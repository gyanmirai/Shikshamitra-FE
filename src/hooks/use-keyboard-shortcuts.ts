import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';

const useKeyboardShortcuts = () => {
  const router = useRouter();
  // Hr Module Shortcuts
  useHotkeys('ctrl+shift+h+f', (e) => {
    e.preventDefault();
    nProgress.start();

    router.push('/hr/employee');
  });
  //   useHotkeys('ctrl+shift+h+e', () => {});
};

export default useKeyboardShortcuts;
