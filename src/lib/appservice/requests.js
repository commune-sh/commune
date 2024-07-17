import { PUBLIC_APPSERVICE } from '$env/static/public';

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
