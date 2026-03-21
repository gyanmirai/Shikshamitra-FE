export function setDriverNextEnabled(enabled: boolean) {
  const btn: any = document.querySelector('./river-popover-next-btn');
  if (!btn) return;
  if (enabled) {
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';
    btn.disabled = false;
  } else {
    btn.style.pointerEvents = 'none';
    btn.disabled = true;
    btn.style.opacity = '0.5';
  }
}
