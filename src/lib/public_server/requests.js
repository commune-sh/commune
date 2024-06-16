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
