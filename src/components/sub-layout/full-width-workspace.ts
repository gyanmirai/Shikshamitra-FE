const ADMISSION_APPLICATION_DETAIL_ROUTE = /^\/student\/admissions\/applications\/[^/]+\/?$/;

export function isFullWidthSubLayoutRoute(pathname: string) {
  return ADMISSION_APPLICATION_DETAIL_ROUTE.test(pathname);
}
