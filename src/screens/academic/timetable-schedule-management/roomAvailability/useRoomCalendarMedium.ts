import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';

export function useRoomCalendarMedium() {
  return useSelector((state: RootState) => state.globalState?.currentMedium?.id);
}
