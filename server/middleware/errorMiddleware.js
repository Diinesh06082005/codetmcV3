import { ApiError } from "../utils/apiError.js";

const normalizeError = (error) => {
  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyValue || {})[0] || "field";
    return new ApiError(409, `${duplicateField} is already in use.`);
  }

  if (error?.name === "ValidationError") {
    const firstValidationMessage =
      Object.values(error.errors || {})[0]?.message || "Validation failed.";
    return new ApiError(400, firstValidationMessage);
  }

  if (error?.name === "CastError") {
    return new ApiError(400, "Invalid resource identifier.");
  }

  if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
    return new ApiError(401, "Authentication failed. Please sign in again.");
  }

  return error;
};

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} was not found.`));
};

export const errorHandler = (error, req, res, next) => {
  const normalizedError = normalizeError(error);
  const statusCode =
    normalizedError.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = normalizedError.message || "Internal server error";

  if (process.env.NODE_ENV !== "test") {
    if (statusCode >= 500) {
      console.error(normalizedError);
    } else {
      console.warn(`[Client Error ${statusCode}] ${message}`);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(normalizedError.details ? { details: normalizedError.details } : {}),
  });
};
