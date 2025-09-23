import { browser } from '$app/environment';

export function setLocalStorageItem(key, value) {
  if(!browser) return;
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }
  localStorage.setItem(key, value);
}

export function getLocalStorageItem(key) {
  if(!browser) return;
  const value = localStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

export function updateLocalStorageItem(key, newValue) {
  if(!browser) return;
  if (typeof newValue === 'object') {
    newValue = JSON.stringify(newValue);
  }
  localStorage.setItem(key, newValue);
}

export function removeLocalStorageItem(key) {
  if(!browser) return;
  localStorage.removeItem(key);
}

export function clearLocalStorage() {
  if(!browser) return;
  localStorage.clear();
}

export function getSettings() {
  if(!browser) return;
  const settings = localStorage.getItem('settings');
  return settings ? JSON.parse(settings) : {};
}

export function updateSetting(key, value) {
  if(!browser) return;
  const settings = getSettings();
  settings[key] = value;
  localStorage.setItem('settings', JSON.stringify(settings));
}

export function getSetting(key) {
  if(!browser) return;
  const settings = getSettings();
  return settings[key];
}

export function saveSettings(settings) {
  if(!browser) return;
  localStorage.setItem('settings', JSON.stringify(settings));
}
