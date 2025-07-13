export const validatePhoneNumber = (value: string) => {
  const isOnlyCountryCode = value === '+91';
  if (isOnlyCountryCode) return undefined;
  return value;
};
