export const AUTH_ERROR_CODE = {
  invalidCredentials: 'invalid_credentials',
  invalidSchoolCode: 'invalid_school_code',
  authenticationUnavailable: 'authentication_unavailable',
} as const;

export const getLoginErrorMessage = (code?: string) => {
  switch (code) {
    case AUTH_ERROR_CODE.invalidSchoolCode:
      return 'School code was not found. Please check it and try again.';
    case AUTH_ERROR_CODE.authenticationUnavailable:
      return 'The authentication service is unavailable. Please try again shortly.';
    case AUTH_ERROR_CODE.invalidCredentials:
    default:
      return 'Invalid email, username, or password.';
  }
};
