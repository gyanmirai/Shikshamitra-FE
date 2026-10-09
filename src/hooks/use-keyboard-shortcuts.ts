import type { RootState } from 'src/redux/store';

import nProgress from 'nprogress';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';

const useKeyboardShortcuts = () => {
  const router = useRouter();
  const isHost = useSelector(
    (state: RootState) => state.auth.sessionContext?.accountMode === 'host'
  );
  // Hr Module Shortcuts
  useHotkeys('ctrl+shift+h+f', (e) => {
    e.preventDefault();
    if (isHost) return;
    nProgress.start();

    router.push('/hr/employee');
  });
  //   useHotkeys('ctrl+shift+h+e', () => {});
};

export default useKeyboardShortcuts;
