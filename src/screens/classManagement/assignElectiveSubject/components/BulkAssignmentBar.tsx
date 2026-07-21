'use client';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Paper, Button, Typography } from '@mui/material';

import type { ElectiveSubjectOption } from '../types';

interface BulkAssignmentBarProps {
  selectedCount: number;
  subjects: ElectiveSubjectOption[];
  onAssign: (subjectId: string) => void;
  onClearAssignments: () => void;
  onClearSelection: () => void;
}

export default function BulkAssignmentBar({
  selectedCount,
  subjects,
  onAssign,
  onClearAssignments,
  onClearSelection,
}: BulkAssignmentBarProps) {
  const [subjectId, setSubjectId] = useState('');

  if (selectedCount === 0) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        p: 1.5,
        mb: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        borderRadius: 1.5,
        bgcolor: 'primary.lighter',
        border: (theme) => `1px solid ${theme.vars.palette.primary.light}`,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: 'primary.darker' }}>
        {selectedCount} student{selectedCount === 1 ? '' : 's'} selected
      </Typography>

      <CustomSelect
        label="Assign to subject"
        options={subjects}
        value={subjectId}
        labelKey="subjectName"
        valueKey="subjectId"
        onChange={(v) => setSubjectId(v as string)}
        formControlProps={{ sx: { minWidth: 200, bgcolor: 'background.paper' } }}
      />

      <Button
        variant="contained"
        size="small"
        disabled={!subjectId}
        startIcon={<Iconify icon="solar:check-circle-bold" />}
        onClick={() => {
          if (subjectId) onAssign(subjectId);
        }}
      >
        Assign Selected
      </Button>

      <Button
        variant="outlined"
        size="small"
        color="inherit"
        onClick={onClearAssignments}
        sx={{ bgcolor: 'background.paper' }}
      >
        Clear Assignments
      </Button>

      <Box sx={{ flexGrow: 1 }} />

      <Button size="small" color="inherit" onClick={onClearSelection}>
        Clear Selection
      </Button>
    </Paper>
  );
}
