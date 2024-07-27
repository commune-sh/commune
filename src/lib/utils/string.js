export function createInitials(text, maxLength = 8) {
  const words = text?.split(/\s+/); 
  const initials = words?.map(word => word?.charAt(0)); 
  return initials?.join('').slice(0, maxLength);
}

export function getFirstParagraph(input) {
  if(!input) return
  const isHTML = /<\/?[a-z][\s\S]*>/i.test(input);

  if (isHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');
    const firstParagraph = doc.querySelector('p');

    return firstParagraph ? firstParagraph.outerHTML : '';
  } else {

    const firstNewlineIndex = input.indexOf('\n');
    if (firstNewlineIndex !== -1) {
      return input.substring(0, firstNewlineIndex);
    } else {
      return input; 
    }
  }
}
