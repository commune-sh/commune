import { 
  PUBLIC_BASE_URL,
  PUBLIC_HOMESERVER_NAME
} from '$env/static/public';

import emojiRegex from 'emoji-regex';

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

function cleanID(id) {
  if(id.startsWith('@_ooye_')) {
    id = id.replace('@_ooye_', '')
  }
  if(id.includes(PUBLIC_HOMESERVER_NAME)) {
    return id.split(`:${PUBLIC_HOMESERVER_NAME}`)[0]
  }
  return id
}

function processLinks(formatted_body) {
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
        newHref = `${PUBLIC_BASE_URL}/user/${part}`;
        newText = `${cleanID(part)}`;
        link.setAttribute('data-type', 'user');
      } else if (part.startsWith('#')) {
        newHref = `${PUBLIC_BASE_URL}/room/${part}`;
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


export function processBody(body) {
  if(!body) return

  body = processReplies(body);
  body = processEmoji(body);
  body = processLinks(body);
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
