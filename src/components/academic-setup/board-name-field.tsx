import type { Board } from 'src/types/school';

import { BoardEnum } from 'src/enums/board';
import { Alert, Stack, Button, TextField } from '@mui/material';
import { useGetBoardOptionsQuery } from 'src/redux/board/boardApi';

import CustomSelect from '../custom-select';
import { getConfiguredBoardTypes } from './board-options-model';

type Props = {
  value: string | number;
  onChange: (value: string | number) => void;
  customName: string;
  onCustomNameChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  customNameError?: string;
  boards?: readonly Board[];
  academicYearId?: string;
  editingBoardId?: string;
  label?: string;
};

export const BoardNameField = ({
  value,
  onChange,
  customName,
  onCustomNameChange,
  error,
  helperText,
  customNameError,
  boards = [],
  academicYearId,
  editingBoardId,
  label = 'Board Name',
}: Props) => {
  const { data = [], isLoading, isError, refetch } = useGetBoardOptionsQuery();
  const options = data
    .filter((option) => option.value === BoardEnum.CBSE || option.value === BoardEnum.GSEB)
    .map((option) => ({ ...option, value: String(option.value) }));
  return (
    <Stack spacing={1.5}>
      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Education board options could not be loaded. Try again.
        </Alert>
      )}
      <CustomSelect<'value' | 'label', false>
        fullWidth
        required
        name="board"
        label={label}
        value={String(value)}
        SelectDisplayProps={{ 'aria-label': label, 'aria-labelledby': undefined }}
        onChange={(next) => {
          onChange(next);
          onCustomNameChange('');
        }}
        options={options}
        isSearch
        isLoading={isLoading}
        disabled={isError}
        disabledValues={getConfiguredBoardTypes(boards, academicYearId, editingBoardId)}
        disabledLabel="Already added"
        noOptionsMessage="No education board options are available."
        error={error}
        helperText={helperText}
      />
      {String(value) === String(BoardEnum.Custom) && (
        <TextField
          fullWidth
          required
          size="small"
          label="Custom board name"
          name="customName"
          value={customName}
          onChange={(event) => onCustomNameChange(event.target.value)}
          error={Boolean(customNameError)}
          helperText={customNameError}
          inputProps={{ maxLength: 128 }}
        />
      )}
    </Stack>
  );
};
