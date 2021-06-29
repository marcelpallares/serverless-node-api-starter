const jwt = require("jwt-simple");
const cookie = require("cookie");
const throwError = require("../utils/httpErrors");

export const newAnonymousToken = (any) => {
  const date = new Date();
  const exp = date.setMinutes(date.getMinutes() + 15);

  return jwt.encode({ any, exp }, process.env.SECRET);
};

export const newAccessToken = (usr) => {
  const date = new Date();
  // const exp = date.setMinutes(date.getMinutes() + 5);
  const exp = date.setMonth(date.getMonth() + 1);

  return jwt.encode({ usr, exp }, process.env.SECRET);
};

export const newRefreshToken = () => {
  const date = new Date();
  const exp = date.setMonth(date.getMonth() + 1);

  return jwt.encode({ exp }, process.env.SECRET);
};

export const newPasswordToken = (email) => {
  const date = new Date();
  const exp = date.setHours(date.getHours() + 1);

  return jwt.encode({ email, exp }, process.env.SECRET);
};

export const newEmailToken = () => {
  const date = new Date();
  const exp = date.setMonth(date.getMonth() + 1);

  return jwt.encode({ exp }, process.env.SECRET);
};

export const newDeleteToken = () => {
  const date = new Date();
  const exp = date.setHours(date.getHours() + 1);

  return jwt.encode({ exp }, process.env.SECRET);
};

export const isTokenExpired = (token) => {
  const { exp } = decodeToken(token);

  // Check if the token is not expired
  return new Date(exp) <= new Date();
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(clearToken(token), process.env.SECRET);
  } catch (error) {
    console.error("JWT decode error: ", error);
    throwError.authTokenNotValid();
  }
};

export const getToken = (headers) => {
  let token = "";
  if (headers.Authorization) {
    token = headers.Authorization;
  } else if (headers.Cookie) {
    const { accessToken } = cookie.parse(headers["Cookie"]);
    token = accessToken;
  }
  return clearToken(token);
};

export const getRefreshToken = (headers) => {
  let token = "";
  if (headers.Authorization) {
    token = headers.Authorization;
  } else if (headers.Cookie) {
    const { refreshToken } = cookie.parse(headers["Cookie"]);
    token = refreshToken;
  }
  return clearToken(token);
};

export const clearToken = (token) => {
  if (token && token.includes("Bearer")) {
    token = token.replace("Bearer ", "");
  }
  return token;
};
