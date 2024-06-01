import { PUBLIC_MATRIX_URL } from '$env/static/public';
import { fetchWithTimeout, fetchWithRetry } from '$lib/utils/fetch';

export const MATRIX_BASE_URL = `${PUBLIC_MATRIX_URL}/_matrix/client/v3/`

export const login = async (username, password) => {
  const url = `${MATRIX_BASE_URL}login`;
  const body = {
    type: 'm.login.password',
    user: username,
    password,
  };
  const response = await fetchWithRetry(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const json = await response.json();
  return json;
}
