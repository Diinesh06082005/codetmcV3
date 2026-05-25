import bcrypt from "bcryptjs";

export const getSaltRounds = () => Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export const hashPassword = (password) => bcrypt.hash(password, getSaltRounds());

export const isHashedPassword = (password) =>
  /^\$2[aby]\$\d{2}\$/.test(typeof password === "string" ? password : "");

export const comparePassword = (candidatePassword, hashedPassword) =>
  bcrypt.compare(candidatePassword, hashedPassword);
