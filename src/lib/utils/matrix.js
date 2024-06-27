import { PUBLIC_HOMESERVER, PUBLIC_HOMESERVER_NAME } from '$env/static/public';

export function convertFromMXC(url) {
  let stripped = url.replace('mxc://', '');
  return `${PUBLIC_HOMESERVER}/_matrix/media/r0/download/${stripped}`;
}

export function thumbnail_from_MXC(url, height, width) {
  let stripped = url.replace('mxc://', '');
  return `${PUBLIC_HOMESERVER}/_matrix/media/v3/thumbnail/${stripped}?width=${width}&height=${height}&method=crop`;
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

export function is_local_room(room_id) {
  if(!room_id) return false;
  const parts = room_id.split(':');
  const domain = parts[1];
  return domain === PUBLIC_HOMESERVER_NAME;
}
