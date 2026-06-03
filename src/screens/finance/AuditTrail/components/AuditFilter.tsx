'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Button, TextField, InputAdornment } from '@mui/material';

import AuditActiveFilters from './AuditActiveFilters';
import AuditStudentAutocomplete from './AuditStudentAutocomplete';
import {
  FINANCE_AUDIT_ACTION_OPTIONS,
  FINANCE_AUDIT_SUBMODULE_OPTIONS,
} from '../constants/subModuleOptions';

import type { AuditFilterValues, FinanceAuditStudentLookup } from '../types/financeAudit.types';

interface AuditFilterProps {
  filters: AuditFilterValues;
  isFiltered: boolean;
  onFilterChange: <K extends keyof AuditFilterValues>(key: K, value: AuditFilterValues[K]) => void;
  onSelectStudent: (student: FinanceAuditStudentLookup | null) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

const AuditFilter = ({
  filters,
  isFiltered,
  onFilterChange,
  onSelectStudent,
  onReset,
  totalCount,
  filteredCount,
}: AuditFilterProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const yearStart = currentYear?.startDate ? dayjs(currentYear.startDate) : null;
  const yearEnd = currentYear?.endDate ? dayjs(currentYear.endDate) : null;

  const startDateVal = filters.startDate ? dayjs(filters.startDate) : null;
  const endDateVal = filters.endDate ? dayjs(filters.endDate) : null;

  const startDateError = (() => {
    if (!startDateVal) return '';
    if (yearStart && startDateVal.isBefore(yearStart, 'day'))
      return `Must be on or after ${yearStart.format('DD/MM/YYYY')}`;
    if (yearEnd && startDateVal.isAfter(yearEnd, 'day'))
      return `Must be on or before ${yearEnd.format('DD/MM/YYYY')}`;
    if (endDateVal && startDateVal.isAfter(endDateVal, 'day')) return 'Must be before End Date';
    return '';
  })();

  const endDateError = (() => {
    if (!endDateVal) return '';
    if (yearStart && endDateVal.isBefore(yearStart, 'day'))
      return `Must be on or after ${yearStart.format('DD/MM/YYYY')}`;
    if (yearEnd && endDateVal.isAfter(yearEnd, 'day'))
      return `Must be on or before ${yearEnd.format('DD/MM/YYYY')}`;
    if (startDateVal && endDateVal.isBefore(startDateVal, 'day')) return 'Must be after Start Date';
    return '';
  })();

  return (
    <Box
      sx={{
        p: 1,
        mb: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Grid container spacing={1.5} alignItems="flex-start">
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <AuditStudentAutocomplete
            studentId={filters.studentId}
            selectedLabel={filters.selectedStudentLabel}
            onSelect={onSelectStudent}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Search activity"
            placeholder="Receipt, actor, or activity summary…"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            InputProps={{
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
                    onClick={() => onFilterChange('search', '')}
                  />
                </InputAdornment>
              ) : null,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <DatePicker
            label="Start Date"
            format="DD/MM/YYYY"
            value={startDateVal}
            onChange={(val) => onFilterChange('startDate', val ? val.toISOString() : null)}
            minDate={yearStart ?? undefined}
            maxDate={endDateVal ?? yearEnd ?? undefined}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                error: !!startDateError,
                helperText: startDateError,
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <DatePicker
            label="End Date"
            format="DD/MM/YYYY"
            value={endDateVal}
            onChange={(val) => onFilterChange('endDate', val ? val.toISOString() : null)}
            minDate={startDateVal ?? yearStart ?? undefined}
            maxDate={yearEnd ?? undefined}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                error: !!endDateError,
                helperText: endDateError,
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <CustomSelect
            label="Sub Module"
            value={filters.subModule}
            options={FINANCE_AUDIT_SUBMODULE_OPTIONS}
            onChange={(v) => onFilterChange('subModule', v as string)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <CustomSelect
            label="Action"
            value={filters.action}
            options={FINANCE_AUDIT_ACTION_OPTIONS}
            onChange={(v) => onFilterChange('action', v as string)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            disabled={!isFiltered}
            onClick={onReset}
            startIcon={<Iconify icon="mdi:filter-off-outline" />}
            size="small"
            sx={{ height: 40 }}
          >
            Reset
          </Button>
        </Grid>
      </Grid>

      <AuditActiveFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onClearStudent={() => onSelectStudent(null)}
      />

      {isFiltered && (
        <Box sx={{ mt: 1 }}>
          <Box
            component="span"
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              bgcolor: 'primary.lighter',
              px: 1,
              py: 0.3,
              borderRadius: 5,
            }}
          >
            Showing {filteredCount} of {totalCount} records
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AuditFilter;
