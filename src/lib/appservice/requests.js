import { PUBLIC_APPSERVICE, PUBLIC_HOMESERVER } from '$env/static/public';
import { getCookie } from '$lib/utils/cookie'

export const getCapabilities = async () => {
  const url = `${PUBLIC_APPSERVICE}/capabilities`;

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


export const getPublicRooms = async () => {
  const url = `${PUBLIC_APPSERVICE}/publicRooms`;

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

export const getRoomHierarchy = async (room_id) => {
  const url = `${PUBLIC_APPSERVICE}/rooms/${room_id}/hierarchy`;
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

export const getRoomState = async (room_id) => {
  const url = `${PUBLIC_APPSERVICE}/_matrix/client/v3/rooms/${room_id}/state`;
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

export const getRoomMessages = async (opts) => {
  if(!opts.room_id) return
  let base = PUBLIC_APPSERVICE
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

export const getEvent = async (opts) => {
  if(!opts.room_id || !opts.event_id) return
  let { room_id, event_id } = opts
  const url = `${PUBLIC_APPSERVICE}/_matrix/client/v3/rooms/${room_id}/event/${event_id}`;
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

