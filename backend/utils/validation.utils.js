const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSignupInput = (name, email, password) => {
  if (!name || !email || !password) {
    return "Name, email, and password are required.";
  }

  if (!emailPattern.test(email)) {
    return "Please provide a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
};

export const validateLoginInput = (email, password) => {
  if (!email || !password) {
    return "Email and password are required.";
  }

  if (!emailPattern.test(email)) {
    return "Please provide a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  return null;
};
