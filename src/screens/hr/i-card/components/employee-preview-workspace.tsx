import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Paper,
  Stack,
  TextField,
  IconButton,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { EmployeeCardPreview } from './employee-card-preview';
import {
  filterEmployeeICardPreviewRows,
  clampEmployeeICardPreviewIndex,
} from '../i-card-builder-utils';

import type { BuilderState } from '../employee-builder-state';
import type { EmployeeICardRow } from '../i-card-staff-columns';

export function EmployeePreviewWorkspace({
  state,
  employees,
  sampleEmployee,
  academicYearName,
}: {
  state: BuilderState;
  employees: EmployeeICardRow[];
  sampleEmployee?: EmployeeICardRow;
  academicYearName?: string;
}) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<'single' | 'scroll'>('single');
  const [previewSearch, setPreviewSearch] = useState('');
  const effectivePreviewIndex = clampEmployeeICardPreviewIndex(previewIndex, employees.length);
  const filteredPreviewEmployees = filterEmployeeICardPreviewRows(employees, previewSearch);
  const previewEmployee = employees[effectivePreviewIndex] || sampleEmployee;
  return (
    <Box sx={{ position: 'sticky', top: 16 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'background.neutral',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1}
          sx={{ mb: 1 }}
        >
          <Box>
            <Typography variant="subtitle2">Live Preview</Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time card composition
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            <Chip
              size="small"
              variant="outlined"
              label={`${state.layout.widthMm} × ${state.layout.heightMm} mm`}
            />
            {employees.length > 1 && (
              <ToggleButtonGroup
                exclusive
                size="small"
                value={previewMode}
                aria-label="Preview layout"
                onChange={(_, value) => {
                  if (value) setPreviewMode(value);
                }}
              >
                <ToggleButton value="single" aria-label="Preview one card">
                  One
                </ToggleButton>
                <ToggleButton value="scroll" aria-label="Preview all selected cards">
                  All
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Stack>
        </Stack>
        {previewMode === 'scroll' && employees.length > 1 ? (
          <Stack spacing={1}>
            <TextField
              fullWidth
              size="small"
              name="employee-card-preview-search"
              label="Find Selected Staff"
              placeholder="Search by name, code, role, or department…"
              value={previewSearch}
              autoComplete="off"
              onChange={(event) => setPreviewSearch(event.target.value)}
            />
            <Stack
              spacing={2}
              sx={{
                maxHeight: 560,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                pr: 0.5,
              }}
            >
              {filteredPreviewEmployees.length ? (
                filteredPreviewEmployees.map((employee) => (
                  <Box key={employee.id}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {employee.fullName || employee.employeeIdentifier || 'Employee'}
                    </Typography>
                    <EmployeeCardPreview
                      state={state}
                      employee={employee}
                      academicYearName={academicYearName}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No selected cards match this search.
                </Typography>
              )}
            </Stack>
          </Stack>
        ) : (
          <>
            <EmployeeCardPreview
              state={state}
              employee={previewEmployee}
              academicYearName={academicYearName}
            />
            {employees.length > 1 && (
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
                sx={{ mt: 1 }}
              >
                <IconButton
                  size="small"
                  aria-label="Preview previous staff card"
                  disabled={effectivePreviewIndex === 0}
                  onClick={() => setPreviewIndex(Math.max(0, effectivePreviewIndex - 1))}
                >
                  <Iconify icon="mdi:chevron-left" />
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  {effectivePreviewIndex + 1} / {employees.length}
                </Typography>
                <IconButton
                  size="small"
                  aria-label="Preview next staff card"
                  disabled={effectivePreviewIndex >= employees.length - 1}
                  onClick={() =>
                    setPreviewIndex(Math.min(employees.length - 1, effectivePreviewIndex + 1))
                  }
                >
                  <Iconify icon="mdi:chevron-right" />
                </IconButton>
              </Stack>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
