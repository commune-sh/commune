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


export function processBody(text) {
  if(!text) return

  const mx_reg = /<mx-reply>[\s\S]*?<\/mx-reply>/;
  text = text.replace(mx_reg, '').trim();

  const regex = emojiRegex();
  return text?.replace(regex, '<span class="emoji">$&</span>');
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

