import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';
import { setDriverNextEnabled } from 'src/utils/driverBtnConfig';

import type { GlobalAcademicSearchOption } from './types';

type Props = {
  isYearOnly: boolean;
  isStudentModule: boolean;
  options: GlobalAcademicSearchOption[];
  selectedOption: GlobalAcademicSearchOption | null;
  applyAcademicOption: (option: GlobalAcademicSearchOption | null) => void;
};

export function useAcademicConfirmation({
  isYearOnly,
  isStudentModule,
  options,
  selectedOption,
  applyAcademicOption,
}: Props) {
  const [showConfirm, confirmationDialog] = useConfirmDialog();

  const changeSelection = async (newOption: GlobalAcademicSearchOption | null) => {
    if (!newOption) return;

    const subject = isYearOnly ? 'academic year' : 'academic year, board and medium';
    const from = isYearOnly ? selectedOption?.academicYear.name : selectedOption?.label;
    const to = isYearOnly ? newOption.academicYear.name : newOption.label;
    const confirmed = await showConfirm({
      title: isStudentModule ? 'Change academic year' : 'Change Academic Year, Board and Medium',
      confirmText: isStudentModule ? 'Change year' : undefined,
      message: from
        ? `Are you sure you want to change ${subject} from ${from} to ${to}?`
        : `Are you sure you want to set ${subject} to ${to}?`,
      icon: 'warning',
    });
    if (confirmed) {
      const option = isYearOnly
        ? (options.find((item) => item.academicYear.id === newOption.academicYear.id) ?? newOption)
        : newOption;
      applyAcademicOption(option);
    }
    if (selectedOption || confirmed) setDriverNextEnabled(true);
  };

  return { confirmationDialog, changeSelection };
}
