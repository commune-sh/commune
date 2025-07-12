export function createCookie(name, value) {
  const domain = getCookieDomain();
  document.cookie = `${name}=${value}; path=/; max-age=2147483647; domain=${domain};`;
}

function getCookieDomain() {
  const hostname = window.location.hostname;

  if (hostname === 'localhost') {
    return 'localhost';
  }

  const parts = hostname.split('.');

  if (parts.length > 2) {
    parts.shift();
  }

  return '.' + parts.join('.');
}

export function removeCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0; domain=${getCookieDomain()};`;
}

export function getCookie(name) {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');

    if (key.toLowerCase() === name) {
      return value;
    }
  }

  return null;
}


export function storeCookies(opts) {
  if (!opts) {
    return;
  }
  console.log("Saving cookies: ", opts)
  for (const key in opts) {
    createCookie(key, opts[key]);
  }
}
