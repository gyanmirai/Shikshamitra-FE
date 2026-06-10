import type { Theme, SxProps } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

interface ClassDivisionOption {
  id: string;
  name: string;
}

interface FinanceClassDivisionFilterProps {
  classOptions: ClassDivisionOption[];
  divisionOptions: ClassDivisionOption[];
  selectedStandardId: string;
  selectedDivisionId: string;
  isDivisionDisabled: boolean;
  onClassChange: (standardId: string) => void;
  onDivisionChange: (divisionId: string) => void;
  classesLoading?: boolean;
  selectSx?: SxProps<Theme>;
}

const defaultSelectSx = { maxWidth: '180px', width: '100%' };

const FinanceClassDivisionFilter: React.FC<FinanceClassDivisionFilterProps> = ({
  classOptions,
  divisionOptions,
  selectedStandardId,
  selectedDivisionId,
  isDivisionDisabled,
  onClassChange,
  onDivisionChange,
  classesLoading = false,
  selectSx = defaultSelectSx,
}) => (
  <>
    <CustomSelect
      options={classOptions}
      label="Class"
      value={selectedStandardId}
      onChange={(val) => onClassChange(val as string)}
      labelKey="name"
      valueKey="id"
      disabled={classesLoading}
      formControlProps={{ sx: selectSx }}
    />
    <CustomSelect
      options={divisionOptions}
      label="Division"
      value={selectedDivisionId}
      onChange={(val) => onDivisionChange(val as string)}
      labelKey="name"
      valueKey="id"
      disabled={isDivisionDisabled}
      formControlProps={{ sx: selectSx }}
    />
  </>
);

export default FinanceClassDivisionFilter;
