/** Let the shared busy state paint before synchronous dynamic-form validation. */
export function waitForAdmissionValidationPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 0));
  });
}
