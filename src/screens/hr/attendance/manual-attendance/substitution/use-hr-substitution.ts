import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { canArrangeSubstitution } from 'src/screens/academic/timetable-schedule-management/substitutionManagement/quick-substitution/quick-substitution-context';

export type HrSubstitutionEmployee = {
  id: string;
  fullName?: string;
  isTeaching?: boolean;
  status?: string;
  isApprovedLeave?: boolean;
};

export function useHrSubstitution(
  date: Dayjs | null,
  dirty: boolean,
  save: () => Promise<boolean>
) {
  const [selected, setSelected] = useState<{
    employee: HrSubstitutionEmployee;
    date: string;
  } | null>(null);
  const [opening, setOpening] = useState(false);
  const pending = useRef(false);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const allowed = canArrangeSubstitution(permissions);
  const open = async (employee: HrSubstitutionEmployee) => {
    if (!allowed || !date || pending.current) return;
    pending.current = true;
    setOpening(true);
    try {
      const dateIso = date.format('YYYY-MM-DD');
      if (dirty && !(await save())) return;
      setSelected({ employee, date: dateIso });
    } catch {
      shikshaMitraToast.error({ message: 'Attendance could not be saved. Please try again.' });
    } finally {
      pending.current = false;
      setOpening(false);
    }
  };
  return { selected, opening, allowed, open, close: () => setSelected(null) };
}
