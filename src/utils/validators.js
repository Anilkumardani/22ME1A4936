export function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function isPositiveInteger(str) {
  return /^\d+$/.test(str) && parseInt(str, 10) > 0;
}

export function isValidShortcode(code) {
  return /^[a-zA-Z0-9]{3,10}$/.test(code);
}
