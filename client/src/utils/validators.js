const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9_]{3,24}$/;
const ROOM_ID_REGEX = /^[A-Z0-9_-]{4,24}$/;

export const sanitizeUsernameInput = (value) =>
  value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);

export const normalizeEmailInput = (value) => value.trim().toLowerCase();

export const sanitizeRoomIdInput = (value) =>
  value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);

export const validateLoginForm = (form) => {
  const values = {
    email: normalizeEmailInput(form.email || ""),
    password: form.password || "",
  };
  const errors = {};

  const isEmail = EMAIL_REGEX.test(values.email);
  const isUsername = USERNAME_REGEX.test(values.email);

  if (!values.email || (!isEmail && !isUsername)) {
    errors.email = "Enter a valid email address or username.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return { values, errors };
};

export const validateRegisterForm = (form) => {
  const values = {
    username: sanitizeUsernameInput(form.username || ""),
    email: normalizeEmailInput(form.email || ""),
    password: form.password || "",
    confirmPassword: form.confirmPassword || "",
  };
  const errors = {};

  if (!USERNAME_REGEX.test(values.username)) {
    errors.username =
      "Use 3-24 lowercase letters, numbers, or underscores for your username.";
  }

  if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password || values.password.length < 8 || !/\d/.test(values.password)) {
    errors.password = "Use at least 8 characters with at least one number.";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return { values, errors };
};

export const validateRoomId = (roomId) => {
  const normalizedRoomId = sanitizeRoomIdInput(roomId || "");

  return {
    roomId: normalizedRoomId,
    isValid: ROOM_ID_REGEX.test(normalizedRoomId),
  };
};
