const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => {
  return regexEmail.test(email);
};