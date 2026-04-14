'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { TextField, Autocomplete } from '@mui/material';

export interface BoardMediumOption {
  label: string;
  boardId: string;
  mediumId: string;
}

interface Props {
  value?: BoardMediumOption;
  onChange: (value: BoardMediumOption) => void;
  size?: 'small' | 'medium';
  minWidth?: number;
}

export default function BoardMediumDropdown({
  value,
  onChange,
  size = 'small',
  minWidth = 220,
}: Props) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const options = React.useMemo<BoardMediumOption[]>(() => {
    if (!currentYear?.boards?.length) return [];

    return currentYear.boards.flatMap((board: any) =>
      (board.educationMediums || []).map((medium: any) => ({
        label: `${board.name} / ${medium.name}`,
        boardId: board.id,
        mediumId: medium.id,
      }))
    );
  }, [currentYear?.boards]);

  // auto-select first option
  React.useEffect(() => {
    if (!value && options.length > 0) {
      onChange(options[0]);
    }
  }, [options, value, onChange]);

  return (
    <Autocomplete
      size={size}
      options={options}
      value={value ?? undefined}
      disableClearable
      getOptionLabel={(option) => option.label}
      onChange={(_, newValue) => {
        if (newValue) onChange(newValue);
      }}
      renderInput={(params) => <TextField {...params} variant="filled" label="Board & Medium" />}
      sx={{
        minWidth,
        '& *': { fontSize: '14px !important' },
      }}
    />
  );
}
