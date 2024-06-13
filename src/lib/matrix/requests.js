import { PUBLIC_MATRIX_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { fetchWithTimeout, fetchWithRetry } from '$lib/utils/fetch';

export const MATRIX_BASE_URL = `${PUBLIC_MATRIX_URL}/_matrix/client/v3`

export const login = async (body) => {
  const url = `${MATRIX_BASE_URL}/login`;

  let options = {
      headers: {
        'Content-Type': 'application/json',
      },
  }

  if(body !== undefined && body?.type != ''){
    options.method = 'POST'
    options.body = body
  }

  try {
    const response = await fetchWithTimeout(url, options)
    return response;
  } catch (error) {
    throw error
  }

}

export const register = async (body) => {
  const url = `${MATRIX_BASE_URL}/register`;

  let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "initial_device_display_name": PUBLIC_APP_NAME,
      })
  }

  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }

}

export const get_public_rooms = async () => {
  const url = `${MATRIX_BASE_URL}/publicRooms`;

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

export const whoami = async () => {
  const url = `${MATRIX_BASE_URL}/account/whoami`;

  const access_token = localStorage.getItem('access_token')

  let options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
  }

  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }

}

