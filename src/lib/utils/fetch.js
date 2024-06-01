/**
 * Helper function to get a cookie by name
 * 
 * @param {string} name - The name of the cookie
 * @returns {string|null} - The cookie value or null if not found
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/**
 * Generic fetch function to make HTTP requests with timeout
 * 
 * @param {string} url - The endpoint URL to call
 * @param {Object} options - Optional parameters for the fetch request
 * @param {string} [options.method='GET'] - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} [options.headers={}] - Headers to include in the request
 * @param {Object} [options.body=null] - Body of the request for POST, PUT, DELETE methods
 * @param {number} [options.timeout=5000] - Timeout for the request in milliseconds
 * @param {boolean} [options.useBearerToken=false] - Whether to include the bearer token from cookies/localStorage
 * @returns {Promise} - A promise that resolves to the response data or an error object
 */
async function fetchWithTimeout(url, options = {}) {
  const {
    method = 'GET',
    headers = {
      'Content-Type': 'application/json',
    },
    body = null,
    timeout = 5000,
    useBearerToken = false
  } = options;

  if (useBearerToken && headers['Authorization'] === undefined) {
    const cookieToken = getCookie('access_token');
    const localStorageToken = localStorage.getItem('access_token');

    if (cookieToken && localStorageToken && cookieToken === localStorageToken) {
      headers['Authorization'] = `Bearer ${cookieToken}`;
    }
  }

  const controller = new AbortController();
  const signal = controller.signal;

  // Set a timeout to abort the fetch request
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle HTTP errors
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Try to parse the response as JSON
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback to text if JSON parsing fails
      const text = await response.text();
      return text;
    }
  } catch (error) {
    // Handle fetch errors (including timeouts and network errors)
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw new Error(`Fetch error: ${error.message}`);
  }
}


/**
 * Retry wrapper function for fetchWithTimeout that retries indefinitely
 * 
 * @param {string} url - The endpoint URL to call
 * @param {Object} options - Optional parameters for the fetch request
 * @param {Object} retryOptions - Options for retry behavior
 * @param {number} [retryOptions.defaultDelay=3000] - Default delay between retry attempts in milliseconds
 * @param {number} [retryOptions.backoffAfter=Infinity] - Number of retries before starting exponential backoff
 * @param {number} [retryOptions.maxDelay=30000] - Maximum delay between retry attempts in milliseconds
 * @param {number} [retryOptions.maxTries=Infinity] - Maximum number of retry attempts before giving up
 * @returns {Promise} - A promise that resolves to the response data or an error object
 */
async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  const {
    defaultDelay = 3000,
    backoffAfter = Infinity,
    maxDelay = 30000,
    maxTries = Infinity
  } = retryOptions;

  let attempt = 0;
  let delay = defaultDelay;

  while (attempt < maxTries) {
    try {
      const response = await fetchWithTimeout(url, options);
      return response;
    } catch (error) {
      attempt++;
      if (attempt >= maxTries) {
        throw new Error(`Max retries reached: ${error.message}`);
      }
      console.warn(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);

      await new Promise(res => setTimeout(res, delay));

      if (attempt >= backoffAfter) {
        delay = Math.min(delay * 2, maxDelay);
      }
    }
  }
}
