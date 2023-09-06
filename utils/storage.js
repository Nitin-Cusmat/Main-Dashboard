const getCookie = name => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(";").shift() : null;
};

const domain = process.env.NEXT_PUBLIC_MAIN_DOMAIN;

const setCookie = (name, value, expiryDate) => {
  let expires = "";
  if (expiryDate) {
    // expiryDate should be a date object
    expires = `; expires=${expiryDate.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ""}${expires};domain=${domain}; path=/`;
};

const deleteCookie = key => {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; path=/`;
};

export { setCookie, getCookie, deleteCookie };
