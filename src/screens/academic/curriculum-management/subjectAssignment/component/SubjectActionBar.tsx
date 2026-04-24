import type { Standards } from 'src/types/school';

import React from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

interface SubjectActionBarProps {
  allClass: Standards[];
  classId: string;
  onClassChange: (value: string | number) => void;
  onAddNew: () => void;
}

const SubjectActionBar = ({
  allClass,
  classId,
  onClassChange,
  onAddNew,
}: SubjectActionBarProps) => (
  <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <CustomSelect
        label="Class"
        name="class"
        options={allClass}
        valueKey="id"
        labelKey="name"
        formControlProps={{ sx: { maxWidth: '247px', width: '100%' } }}
        value={classId}
        onChange={(value) => onClassChange(value as string | number)}
      />
      <Button
        size="small"
        startIcon={<Add />}
        variant="contained"
        onClick={onAddNew}
        sx={{ px: '32px' }}
      >
        Subjects Assignment
      </Button>
    </Box>
  </Card>
);

/**
 * Memoization Justification:
 * Contains a dropdown and button that only depend on class list and classId.
 * React.memo avoids re-renders from table data loading, dialog state, or
 * selected subject changes that are frequent in the parent.
 */
export default React.memo(SubjectActionBar);
