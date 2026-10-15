import type { Board, AcademicYear } from 'src/types/school';

import { useId } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

export function IdentityContextFields({
  years,
  boards,
  yearId,
  boardId,
  mediumId,
  onChange,
  disabled = false,
}: {
  years: AcademicYear[];
  boards: Board[];
  yearId: string;
  boardId: string;
  mediumId: string;
  onChange: (year: string, board: string, medium: string) => void;
  disabled?: boolean;
}) {
  const fieldId = useId();
  const currentBoards = boards.filter((board) => board.academicYearId === yearId);
  const mediums = currentBoards.find((board) => board.id === boardId)?.educationMediums ?? [];
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      <TextField
        id={`${fieldId}-year`}
        select
        size="small"
        InputLabelProps={{ shrink: true }}
        SelectProps={{
          displayEmpty: true,
          SelectDisplayProps: { 'aria-labelledby': `${fieldId}-year-label` },
        }}
        label="Academic year"
        value={yearId}
        disabled={disabled}
        sx={{ minWidth: 0 }}
        onChange={(event) => onChange(event.target.value, '', '')}
      >
        {!years.length && <MenuItem value="">No academic years available</MenuItem>}
        {years.map((year) => (
          <MenuItem key={year.id} value={year.id}>
            {year.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        id={`${fieldId}-board`}
        select
        size="small"
        InputLabelProps={{ shrink: true }}
        SelectProps={{
          displayEmpty: true,
          SelectDisplayProps: { 'aria-labelledby': `${fieldId}-board-label` },
        }}
        label="Board"
        value={boardId}
        disabled={disabled || !yearId || !currentBoards.length}
        sx={{ minWidth: 0 }}
        onChange={(event) => onChange(yearId, event.target.value, '')}
      >
        <MenuItem value="">Select board</MenuItem>
        {currentBoards.map((board) => (
          <MenuItem key={board.id} value={board.id}>
            {board.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        id={`${fieldId}-medium`}
        select
        size="small"
        SelectProps={{
          displayEmpty: true,
          SelectDisplayProps: { 'aria-labelledby': `${fieldId}-medium-label` },
        }}
        InputLabelProps={{ shrink: true }}
        label="Medium"
        value={mediumId}
        disabled={disabled || !boardId}
        sx={{ minWidth: 0 }}
        onChange={(event) => onChange(yearId, boardId, event.target.value)}
      >
        <MenuItem value="">All mediums</MenuItem>
        {mediums.map((medium) => (
          <MenuItem key={medium.id} value={medium.id}>
            {medium.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
