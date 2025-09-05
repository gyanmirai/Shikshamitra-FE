import type { Board } from 'src/types/school';

import React from 'react';
import { Box, Grid } from '@mui/material';
import { BoardEnum } from 'src/enums/board';
import CustomSelect from 'src/components/custom-select';

interface EducationBoardProps {
  values: {
    board: Board;
  };
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
}

const EducationBoardSetup = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}: EducationBoardProps) => (
  <Box sx={{ mt: 1 }}>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <CustomSelect
          fullWidth
          id="board"
          name="board"
          autoFocus
          label="Board Name"
          value={values.board.name}
          onChange={(val) => setFieldValue('board.name', val)}
          error={touched.board && Boolean(errors.board)}
          helperText={((touched.board && errors.board) || '') as string}
          size="small"
          options={[
            {
              value: BoardEnum.GSEB,
              label: 'GSEB',
            },
            {
              value: BoardEnum.CBSE,
              label: 'CBSE',
            },
          ]}
          formControlProps={{
            fullWidth: true,
            sx: {
              maxWidth: 'unset',
            },
          }}
        />
      </Grid>
    </Grid>
  </Box>
);

export default EducationBoardSetup;
