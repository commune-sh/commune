import { PUBLIC_MATRIX_URL } from '$env/static/public';

export function convertFromMXC(url) {
  let stripped = url.replace('mxc://', '');
  return `${PUBLIC_MATRIX_URL}/_matrix/media/r0/download/${stripped}`;
}

export function thumbnail_from_MXC(url) {
  let stripped = url.replace('mxc://', '');
  return `${PUBLIC_MATRIX_URL}/_matrix/media/v3/thumbnail/${stripped}?width=80&height=80&method=crop&allow_redirect=true`;
}

export function room_alias_from_ID(room_id) {
  const parts = room_id.split(":"); 
  if (parts.length > 1) { 
    const local_part = parts[0]; 
    return local_part.substring(1); 
  } else {
    return null; 
  }
}

export function get_local_part(room_id_or_alias) {
  return room_id_or_alias.replace(/^[\#!](.*?):.*$/, '$1');
}

