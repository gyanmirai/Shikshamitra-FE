'use client';

import type { ChangeEvent } from 'react';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Button, TextField, InputAdornment } from '@mui/material';

import {
  ACADEMIC_AUDIT_ACTION_OPTIONS,
  ACADEMIC_AUDIT_SUBMODULE_OPTIONS,
} from '../academicAudit.constants';

export type AcademicAuditFilters = {
  search: string;
  subModuleCode: string;
  action: string;
  fromDate: string | null;
  toDate: string | null;
};

type AcademicAuditFilterProps = {
  filters: AcademicAuditFilters;
  isFiltered: boolean;
  onChange: <K extends keyof AcademicAuditFilters>(key: K, value: AcademicAuditFilters[K]) => void;
  onReset: () => void;
};

const AcademicAuditFilter = ({
  filters,
  isFiltered,
  onChange,
  onReset,
}: AcademicAuditFilterProps) => {
  const startDate = filters.fromDate ? dayjs(filters.fromDate) : null;
  const endDate = filters.toDate ? dayjs(filters.toDate) : null;

  return (
    <Box
      sx={{
        p: 1,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Grid container spacing={1} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Search academic activity"
            value={filters.search}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange('search', event.target.value)
            }
            InputProps={{
              sx: { height: 40 },
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mdi:magnify" width={18} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: filters.search ? (
                <InputAdornment position="end">
                  <Iconify
                    icon="mdi:close"
                    width={16}
                    sx={{ color: 'text.disabled', cursor: 'pointer' }}
                    onClick={() => onChange('search', '')}
                  />
                </InputAdornment>
              ) : null,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <CustomSelect
            label="Sub Module"
            value={filters.subModuleCode}
            options={ACADEMIC_AUDIT_SUBMODULE_OPTIONS}
            onChange={(value) => onChange('subModuleCode', value as string)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <CustomSelect
            label="Action"
            value={filters.action}
            options={ACADEMIC_AUDIT_ACTION_OPTIONS}
            onChange={(value) => onChange('action', value as string)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1.75 }}>
          <DatePicker
            label="From"
            format="DD/MM/YYYY"
            value={startDate}
            onChange={(value) =>
              onChange('fromDate', value ? value.startOf('day').toISOString() : null)
            }
            maxDate={endDate ?? undefined}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                sx: { '& .MuiInputBase-root': { height: 40 } },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1.75 }}>
          <DatePicker
            label="To"
            format="DD/MM/YYYY"
            value={endDate}
            onChange={(value) =>
              onChange('toDate', value ? value.endOf('day').toISOString() : null)
            }
            minDate={startDate ?? undefined}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                sx: { '& .MuiInputBase-root': { height: 40 } },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 1.5 }}>
          <Button
            fullWidth
            size="small"
            color="inherit"
            variant="outlined"
            disabled={!isFiltered}
            onClick={onReset}
            startIcon={<Iconify icon="mdi:filter-off-outline" />}
            sx={{ height: 40 }}
          >
            Reset
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicAuditFilter;
