import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment.");
  }

  return process.env.JWT_SECRET;
};

const getAuthCookieName = () => process.env.AUTH_COOKIE_NAME || "codetmc_session";

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000),
  path: "/",
});

export const generateToken = (userId) =>
  jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());

export const setAuthCookie = (res, token) => {
  res.cookie(getAuthCookieName(), token, getCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(getAuthCookieName(), getCookieOptions());
};

export const extractBearerToken = (authorizationHeader = "") => {
  if (typeof authorizationHeader !== "string") {
    return "";
  }

  const [scheme, token] = authorizationHeader.trim().split(" ");

  if (!/^Bearer$/i.test(scheme) || !token) {
    return "";
  }

  return token.trim();
};

export const extractCookieToken = (cookieHeader = "") => {
  if (typeof cookieHeader !== "string" || !cookieHeader.trim()) {
    return "";
  }

  const cookieName = getAuthCookieName();
  const cookies = cookieHeader.split(";").reduce((accumulator, item) => {
    const [rawKey, ...rawValueParts] = item.split("=");
    const key = rawKey?.trim();

    if (!key) {
      return accumulator;
    }

    accumulator[key] = rawValueParts.join("=").trim();
    return accumulator;
  }, {});

  return cookies[cookieName] || "";
};
