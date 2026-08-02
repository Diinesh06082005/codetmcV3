import mongoose from "mongoose";
import validator from "validator";

import { ApiError } from "./apiError.js";

const ROOM_ID_REGEX = /^[A-Z0-9_-]{4,24}$/;
const USERNAME_REGEX = /^[a-z0-9_]{3,24}$/;
const LANGUAGE_REGEX = /^[a-z0-9#+.-]{2,30}$/i;

const asString = (value) => (typeof value === "string" ? value : "");

export const defaultStarterCode = `function welcome() {
  console.log("Start collaborating in real time!");
}

welcome();
`;

export const sanitizeText = (value, options = {}) => {
  const maxLength = options.maxLength || 40;
  const normalized = validator
    .stripLow(validator.trim(asString(value)).replace(/[<>]/g, ""), true)
    .replace(/\s+/g, " ");

  return normalized.slice(0, maxLength);
};

export const sanitizeCode = (value) => {
  return asString(value).replace(/\u0000/g, "").slice(0, 500000);
};

export const sanitizeRoomId = (value) => {
  if (!value || typeof value !== "string") return "";
  const cleaned = value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  return ROOM_ID_REGEX.test(cleaned) ? cleaned : "";
};

export const sanitizeLanguage = (value) => {
  const trimmed = validator.trim(asString(value)).toLowerCase();
  return LANGUAGE_REGEX.test(trimmed) ? trimmed : "";
};

export const validateUsername = (value) => {
  const username = validator.trim(asString(value)).toLowerCase();

  if (!USERNAME_REGEX.test(username)) {
    throw new ApiError(
      400,
      "Username must be 3-24 characters and can only include lowercase letters, numbers, and underscores."
    );
  }

  return username;
};

export const validateEmail = (value) => {
  const email = validator.normalizeEmail(validator.trim(asString(value))) || "";

  if (!validator.isEmail(email)) {
    throw new ApiError(400, "A valid email address is required.");
  }

  return email;
};

export const validatePassword = (value) => {
  const password = asString(value);
  const isStrongEnough = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  });

  if (!isStrongEnough) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters long and include at least one letter and one number."
    );
  }

  return password;
};

export const validateRoomId = (value) => {
  const roomId = sanitizeRoomId(value);

  if (!roomId) {
    throw new ApiError(400, "A valid room ID is required.");
  }

  return roomId;
};

export const validateObjectId = (value, label = "resource") => {
  const normalizedValue = validator.trim(asString(value));

  if (!mongoose.isValidObjectId(normalizedValue)) {
    throw new ApiError(400, `A valid ${label} ID is required.`);
  }

  return normalizedValue;
};

export const sanitizeChatMessage = (value) => sanitizeText(value, { maxLength: 400 });

export const createRoomId = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let roomId = "";

  for (let index = 0; index < 8; index += 1) {
    roomId += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return roomId;
};
