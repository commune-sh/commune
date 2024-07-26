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
