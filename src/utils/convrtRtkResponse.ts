export const ConvertRtkResponse = (response: any) => {
  if (response?.error) {
    const error = new Error(response?.error?.message);
    // @ts-ignore
    error.data = response;
    throw error;
  }
  return response;
};
