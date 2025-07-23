import emojiRegex from 'emoji-regex';

import { type ENV } from '../types/common'

import { processURL } from './matrix';

export const debounce = function () {
    var timeoutId = null;
    return function (func, timeout, context) {
        context = context || this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
            func.apply(context, arguments);
        }, timeout);

        return timeoutId;
    };
}();


export function naiveEmailCheck(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function justEmoji(body) {
    if(!body) {
        return false
    }
    const emojiMatcher = emojiRegex();
    const matches = body.match(emojiMatcher);
    const alp = /[\p{L}\p{N}]+/u;

    let hasEmoji = matches !== null && matches.length > 0
    let hasText = alp.test(body) === true
    return !hasText && hasEmoji
}

function processReplies(body) {
    const mx_reg = /<mx-reply>[\s\S]*?<\/mx-reply>/;
    return body.replace(mx_reg, '').trim();
}


function processEmoji(body) {
    const regex = emojiRegex();
    return body?.replace(regex, '<span class="emoji">$&</span>');
}

function cleanID(id: string, homeserver_name: string) {
    if(id.startsWith('@_ooye_')) {
        id = id.replace('@_ooye_', '@')
    }
    if(id.includes(homeserver_name)) {
        return id.split(`:${homeserver_name}`)[0]
    }
    return id
}

function processCustomEmoji(body: any, homeserver_url: string) {
    if(!body || !homeserver_url) return

    const parser = new DOMParser();
    const doc = parser.parseFromString(body, 'text/html');

    const bodyContent = doc.body.innerHTML.trim();
    const singleImg = bodyContent.match(/^<img[^>]*data-mx-emoticon[^>]*>$/);
    if (singleImg) {
        const img = doc.querySelector('img[data-mx-emoticon]');
        img.classList.add(`mx-emoticon-single`);
    }

    //const images = doc.querySelectorAll('img');
    const images = doc.querySelectorAll('img[data-mx-emoticon]');


    images.forEach((img) => {
        const src = img.getAttribute('src');
        if(src) {
            const newSrc = processURL(src, homeserver_url);
            if(!singleImg) {
                img.className = `mx-emoticon`
            }
            img.setAttribute('src', newSrc);
        }

    });

    return doc.body.innerHTML;
}

function processLinks(formatted_body: string, base_url: string)  {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = formatted_body;

    const links = tempElement.querySelectorAll('a');

    links.forEach(link => {
        const text = link.textContent;
        const href = link.href;

        let newHref, newText;

        if (href.startsWith('https://matrix.to/#/')) {
            const part = href.split('/#/')[1];

            if (part.startsWith('@')) {
                newHref = `${base_url}/user/${part}`;
                newText = `${cleanID(part)}`;
                link.setAttribute('data-type', 'user');
            } else if (part.startsWith('#')) {
                newHref = `${base_url}/room/${part}`;
                newText = `${cleanID(part)}`;
                link.setAttribute('data-type', 'room');
            }

            link.className = `mx-link`
            link.setAttribute('data-id', part);
            //link.href = newHref;
            link.removeAttribute('href');
            link.textContent = newText;
            //link.id = newId;
        } else {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }

    });
    return tempElement.innerHTML;
}


function processPlainLinks(body) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = body;

    function convertLinks(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/g;
            const text = node.textContent;
            const matches = text.match(urlPattern);

            if (matches) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                matches.forEach(match => {
                    const index = text.indexOf(match, lastIndex);

                    if (index > lastIndex) {
                        fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
                    }

                    const a = document.createElement('a');
                    a.href = match;
                    a.textContent = match;
                    a.setAttribute('target', '_blank');
                    a.setAttribute('rel', 'noopener noreferrer');
                    fragment.appendChild(a);

                    lastIndex = index + match.length;
                });

                if (lastIndex < text.length) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
                }

                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() !== 'a') {
            Array.from(node.childNodes).forEach(convertLinks);
        }
    }

    convertLinks(tempElement);

    return tempElement.innerHTML;
}


export function processBody(body: any, env: ENV, authenticated: boolean) {
    if(!body || !env) return

    let as_or_hs = authenticated ? env.HOMESERVER_URL : env.APPSERVICE_URL;

    body = processReplies(body);
    body = processEmoji(body);
    body = processCustomEmoji(body, as_or_hs);
    body = processLinks(body, env.BASE_URL);
    body = processPlainLinks(body);

    return body;
}

export function textContent(text) {
    if(!text) return
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return doc.body.textContent || "";
}


export function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const formatBytes = (a,b) => {if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}


export function clickOutside(node, callback) {
    return outside(node, "click", callback)
}

function outside(node, listener, callback) {
    const handleClick = (event) => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            callback(event)
        }
    }
    document.addEventListener(listener, handleClick)
    return {
        destroy() {
            document.removeEventListener(listener, handleClick)
        }
    }
}

export function parseHashParams(hash: string) {
    return hash.slice(1).split('&').reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        acc[key] = value;
        return acc;
    }, {});
}
