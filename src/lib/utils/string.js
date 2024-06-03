export function createInitials(text, maxLength = 8) {
  const words = text.split(/\s+/); 
  const initials = words.map(word => word.charAt(0)); 
  return initials.join('').slice(0, maxLength);
}
