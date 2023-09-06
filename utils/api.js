import apiRoutes from "./api-routes";
import appRoutes from "./app-routes";
import {
  COOKIE_KEYS,
  HTTP_METHODS,
  HTTP_STATUSES,
  HTTP_HEADERS
} from "./constants";
import { getCookie, setCookie } from "./storage";
import { getDateFromEpoch } from "./utils";

//Parse or Decrypt JWT Access and Refresh Tokens to read information
const parseJwt = token => {
  if (!token) {
    return;
  }
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(window.atob(base64));
};

const getAcessTokenFromRefreshToken = async refreshToken => {
  let accessToken;
  const accessTokenResponse = await request(apiRoutes.accounts.token.refresh, {
    method: HTTP_METHODS.POST,
    body: { refresh: refreshToken }
  });
  if (accessTokenResponse.status === HTTP_STATUSES.OK) {
    accessToken = await accessTokenResponse.json();
    accessToken = accessToken.access;
  }
  return accessToken;
};

// Get Access Token Cookie
// Only works when called from client side as document is unavailable to server
const getAccessToken = async () => {
  let accessToken = getCookie(COOKIE_KEYS.ACCESS);
  if (!accessToken) {
    const refreshToken = getCookie(COOKIE_KEYS.REFRESH);
    if (refreshToken) {
      accessToken = await getAcessTokenFromRefreshToken(refreshToken);
      if (accessToken) {
        const parsedAccessToken = parseJwt(accessToken);
        const accessTokenExpiryDate = getDateFromEpoch(parsedAccessToken.exp);
        setCookie(COOKIE_KEYS.ACCESS, accessToken, accessTokenExpiryDate);
      }
    }
  }
  return accessToken;
};

const request = async (apiPath, options = {}) => {
  let tempOptions = options || {};
  const fetchOptions = {
    method: tempOptions.method || HTTP_METHODS.GET,
    headers: {}
  };

  if (tempOptions.body) {
    if (!tempOptions.file) {
      fetchOptions.headers[HTTP_HEADERS.CONTENT_TYPE] = "application/json";
      fetchOptions.body = JSON.stringify(tempOptions.body);
    } else {
      fetchOptions.body = tempOptions.body;
    }
  }

  let authHeader;
  if (options.isAuthenticated) {
    const accessToken = await getAccessToken();
    if (accessToken) {
      authHeader = `Bearer ${accessToken}`;
    }
  }
  if (authHeader) {
    fetchOptions.headers[HTTP_HEADERS.AUTHORIZATION] = authHeader;
  }
  if (options.password_reset_token) {
    fetchOptions.headers["password-reset-token"] = options.password_reset_token;
  }

  fetchOptions.mode = "cors";
  const url = `${process.env.NEXT_PUBLIC_API_ROOT}/${apiPath}`;
  return fetch(url, fetchOptions);
};

const apiCall = async (apiPath, options) => {
  const fetchOptions = { headers: {} };
  let tempOptions = options;

  if (!tempOptions) {
    tempOptions = {};
  }

  if (tempOptions.method) {
    fetchOptions.method = tempOptions.method;
  }

  if (tempOptions.body) {
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(tempOptions.body);
  }
  fetchOptions.mode = "cors";
  let authHeader;
  if (options.isAuthenticated) {
    const accessToken = await getAccessToken();
    if (accessToken) {
      authHeader = `Bearer ${accessToken}`;
    } else {
      // window.location.href = appRoutes.root;
      return null;
    }
  }
  if (authHeader) {
    fetchOptions.headers[HTTP_HEADERS.AUTHORIZATION] = authHeader;
  }
  return fetch(apiPath, fetchOptions);
};

export default request;
export { parseJwt, getAccessToken, apiCall };
