'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { TextField, Autocomplete } from '@mui/material';

export interface BoardMediumStageOption {
  label: string;
  boardId: string;
  mediumId: string;
  stageId: string;
}

interface Props {
  value?: BoardMediumStageOption | null;
  onChange: (value: BoardMediumStageOption) => void;
  size?: 'small' | 'medium';
  minWidth?: number;
}

export default function BoardMediumStageDropdown({
  value,
  onChange,
  size = 'small',
  minWidth = 260,
}: Props) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const options = React.useMemo<BoardMediumStageOption[]>(() => {
    if (!currentYear?.boards?.length) return [];

    return currentYear.boards.flatMap((board: any) =>
      (board.educationMediums || []).flatMap((medium: any) =>
        (medium.educationMediumStages || []).map((stage: any) => ({
          label: `${board.name} / ${medium.name} / ${stage.name}`,
          boardId: board.id,
          mediumId: medium.id,
          stageId: stage.id,
        }))
      )
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
      value={value ?? options[0]}
      disableClearable
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) =>
        option.boardId === val.boardId &&
        option.mediumId === val.mediumId &&
        option.stageId === val.stageId
      }
      onChange={(_, newValue) => {
        if (newValue) onChange(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} variant="filled" label="Board, Medium & Stage" />
      )}
      sx={{
        minWidth,
        '& *': { fontSize: '14px !important' },
      }}
    />
  );
}
