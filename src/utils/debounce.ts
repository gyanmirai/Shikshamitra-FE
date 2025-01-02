let timer: NodeJS.Timeout;
export default function debounce(func: () => void, delay = 1000) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    func();
  }, delay);
}
