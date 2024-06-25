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
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    return response.json();
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

  if(body !== undefined && body?.type != ''){
    options.body = JSON.stringify(body)
  }


  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }
}

export const requestToken = async (email, client_secret) => {
  const url = `${MATRIX_BASE_URL}/register`;

  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "client_secret": client_secret,
      "email": email,
      "send_attempt": 1
    })
  }

  try {
    const response = await fetch(url, options)
    return response.json();
  } catch (error) {
    throw error
  }

}


export const usernameAvailable = async (username) => {
  const url = `${MATRIX_BASE_URL}/register/available?username=${username}`;

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

export const whoami = async (access_token) => {
  const url = `${MATRIX_BASE_URL}/account/whoami`;

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

export const getVersions = async () => {
  const url = `${PUBLIC_MATRIX_URL}/_matrix/client/versions`;

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
