'use client';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { Box, Paper, Button } from '@mui/material';

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
      elevation={2}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        p: 1,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
      }}
    >
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
        startIcon={<Iconify icon={GlobalIcons.submit} />}
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
        startIcon={<Iconify icon="solar:eraser-bold-duotone" />}
        onClick={onClearAssignments}
        sx={{ bgcolor: 'background.paper' }}
      >
        Clear Assignments
      </Button>

      <Label color="info" variant="soft" sx={{ height: 28, px: 1.5, fontSize: '0.8125rem' }}>
        {selectedCount} student{selectedCount === 1 ? '' : 's'} selected
      </Label>

      <Box sx={{ flexGrow: 1 }} />

      <Button
        size="small"
        color="inherit"
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
        onClick={onClearSelection}
      >
        Clear Selection
      </Button>
    </Paper>
  );
}
