import { PUBLIC_SERVER } from '$env/static/public';

export const getPublicRooms = async () => {
  const url = `${PUBLIC_SERVER}/publicRooms`;

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
  const url = `${PUBLIC_SERVER}/rooms/${room_id}/hierarchy`;

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
