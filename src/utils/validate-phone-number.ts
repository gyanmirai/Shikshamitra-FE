import { matchIsValidTel } from 'mui-tel-input';

export const validatePhoneNumber = (value: string) => {
  const isOnlyCountryCode = value === '+91';
  if (isOnlyCountryCode) return undefined;
  return value;
};

export const validateContact = (value: string) => {
  if (!value) return false;
  if (!value.includes('+')) {
    value = `+91${value}`;
  }

  const digits = value.replace(/\D/g, '');
  const national = digits.replace(/^91/, '');

  return matchIsValidTel(value, { onlyCountries: ['IN'] }) && national.length === 10;
};
