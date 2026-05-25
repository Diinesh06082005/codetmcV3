const AUTH_STORAGE_KEY = "codetmc-auth";

const getSafeStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export const getStoredAuth = () => {
  const storage = getSafeStorage();

  if (!storage) {
    return { user: null };
  }

  try {
    const rawValue = storage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
      return { user: null };
    }

    const parsedValue = JSON.parse(rawValue);

    return {
      user: parsedValue?.user || null,
    };
  } catch (error) {
    return { user: null };
  }
};

export const setStoredAuth = (session) => {
  const storage = getSafeStorage();

  if (!storage) {
    return;
  }

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredAuth = () => {
  const storage = getSafeStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEY);
};
