import type { Theme, SxProps } from '@mui/material';
import type { Board, Medium } from 'src/types/school';

import CustomSelect from 'src/components/custom-select';

interface FinanceAcademicContextFilterProps {
  boards: Board[];
  mediums: Medium[];
  selectedBoard: string;
  selectedMedium: string;
  onBoardChange: (boardId: string) => void;
  onMediumChange: (mediumId: string) => void;
  selectSx?: SxProps<Theme>;
}

const defaultSelectSx = { maxWidth: '180px', width: '100%' };

const FinanceAcademicContextFilter: React.FC<FinanceAcademicContextFilterProps> = ({
  boards,
  mediums,
  selectedBoard,
  selectedMedium,
  onBoardChange,
  onMediumChange,
  selectSx = defaultSelectSx,
}) => (
  <>
    <CustomSelect
      options={boards}
      label="Board"
      value={selectedBoard}
      onChange={(val) => onBoardChange(val as string)}
      labelKey="name"
      valueKey="id"
      disabled={!boards.length}
      formControlProps={{ sx: selectSx }}
    />
    <CustomSelect
      options={mediums}
      label="Medium"
      value={selectedMedium}
      onChange={(val) => onMediumChange(val as string)}
      labelKey="name"
      valueKey="id"
      disabled={!selectedBoard}
      formControlProps={{ sx: selectSx }}
    />
  </>
);

export default FinanceAcademicContextFilter;
