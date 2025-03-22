import { PUBLIC_HOMESERVER } from '$env/static/public';
import { getCookie } from '$lib/utils/cookie'

export const getPublicRooms = async (appservice_url) => {
  const url = `${appservice_url}/publicRooms`;

  let options = {
      headers: {
        'Content-Type': 'application/json',
      },
  }

  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }

}

export const getRoomHierarchy = async (appservice_url, room_id) => {
  const url = `${appservice_url}/rooms/${room_id}/hierarchy`;
  let options = {
      headers: {
        'Content-Type': 'application/json',
      },
  }
  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }
}

export const getRoomState = async (appservice_url, room_id) => {
  const url = `${appservice_url}/_matrix/client/v3/rooms/${room_id}/state`;
  let options = {
      headers: {
        'Content-Type': 'application/json',
      },
  }
  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }
}

export const getRoomMessages = async (appservice_url, opts) => {
  if(!opts.room_id) return
  let base = appservice_url
  if(opts.authenticated) {
    base = PUBLIC_HOMESERVER
  }

  let dir = `b`

  if(opts?.dir) {
    dir = opts.dir
  }

  let url = `${base}/_matrix/client/v3/rooms/${opts.room_id}/messages?limit=100&dir=${dir}`;

  if(opts?.end) {
    url = `${base}/_matrix/client/v3/rooms/${opts.room_id}/messages?limit=100&dir=${dir}&from=${opts.end}`;
  }

  if(opts?.filter) {
    const filter = JSON.stringify(opts.filter)
    const encoded = encodeURIComponent(filter);
    //url = `${url}&filter=${encoded}`
  }

  let options = {
      headers: {
        'Content-Type': 'application/json',
      },
  }
  if(opts.authenticated) {
    const token = getCookie("mx_access_token")
    options['headers']['Authorization'] = `Bearer ${token}`
  }
  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }
}

export const getEventContext = async (appservice_url, opts) => {
  if(!opts.room_id || !opts.event_id) return
  let base = appservice_url

  if(opts.authenticated) {
    base = PUBLIC_HOMESERVER
  }

  let url = `${base}/_matrix/client/v3/rooms/${opts.room_id}/context/${opts.event_id}?limit=100`;

  if(opts?.filter) {
    const filter = JSON.stringify(opts.filter)
    const encoded = encodeURIComponent(filter);
    //url = `${url}&filter=${encoded}`
  }

  let options = {
      headers: {
        'Content-Type': 'application/json',
      },
  }
  if(opts.authenticated) {
    const token = getCookie("mx_access_token")
    options['headers']['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }
}


export const getEvent = async (appservice_url, opts) => {
  if(!opts.room_id || !opts.event_id) return
  let { room_id, event_id } = opts
  const url = `${appservice_url}/_matrix/client/v3/rooms/${room_id}/event/${event_id}`;
  let options = {
      headers: {
        'Content-Type': 'application/json',
      },
  }
  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }
}

export const getThreadEvents = async (appservice_url, opts) => {
  if(!opts.room_id || !opts.event_id) return
  let { room_id, event_id } = opts

  const url = `${appservice_url}/_matrix/client/v1/rooms/${room_id}/relations/${event_id}`;
  let options = {
      headers: {
        'Content-Type': 'application/json',
      },
  }
  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }
}

export const getAvatarThumbnail = async (appservice_url, mxcid ) => {
  let stripped = mxcid.replace('mxc://', '');

  let url = `${appservice_url}/_matrix/client/v1/media/thumbnail/${stripped}?height=96&width=96&method=crop`;

  let options = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  try {
    const response = await fetch(url, options)
    return response?.url;
  } catch (error) {
    throw error
  }
}

export const getImageThumbnail = async (appservice_url, mxcid, width, height, method ) => {
  let stripped = mxcid.replace('mxc://', '');

  let url = `${appservice_url}/_matrix/client/v1/media/thumbnail/${stripped}?height=${height}&width=${width}&method=${method}`;

  let options = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  try {
    const response = await fetch(url, options)
    return response?.url;
  } catch (error) {
    throw error
  }
}

export const downloadMedia = async (appservice_url, mxcid) => {
  let stripped = mxcid.replace('mxc://', '');

  let url = `${appservice_url}/_matrix/client/v1/media/download/${stripped}`;

  let options = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  try {
    const response = await fetch(url, options)
    return response?.url;
  } catch (error) {
    throw error
  }
}
