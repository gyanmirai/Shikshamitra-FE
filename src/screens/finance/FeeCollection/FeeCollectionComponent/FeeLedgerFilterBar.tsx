'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import CustomSelect from 'src/components/custom-select';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FeeMonth, FeeCollectionStatusOptions } from 'src/enums/fee-collection-type';
import { Paper, Stack, Checkbox, Typography, FormControlLabel } from '@mui/material';
import { useGetStudentFeeStructureQuery } from 'src/redux/student/admission/admission-api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeeLedgerTab = 'by-month' | 'by-fee-head';

export interface FeeLedgerSelectionFilters {
  allPending: boolean;
  allCharges: boolean;
  firstSixMonths: boolean;
  lastSixMonths: boolean;
}

export interface FeeLedgerFilters {
  activeTab: FeeLedgerTab;
  month: string;
  feeHead: string;
  status: string;
  selectionFilters: FeeLedgerSelectionFilters;
}

interface FeeLedgerFilterBarProps {
  filters: FeeLedgerFilters;
  onFilterChange: (filters: FeeLedgerFilters) => void;
  entryCount?: number;
  studentId?: string;
  academicYearId?: string;
  feeHeads?: { feeHeadId: string; feeHeadName: string }[];
  academicYearMonths?: { month: number; year: number }[];
  isMonthsLoading?: boolean;
  selectionStates?: Partial<
    Record<keyof FeeLedgerSelectionFilters, { checked: boolean; indeterminate: boolean }>
  >;
  onSelectionFilterChange?: (key: keyof FeeLedgerSelectionFilters, checked: boolean) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const FEE_LEDGER_INITIAL_FILTERS: FeeLedgerFilters = {
  activeTab: 'by-fee-head',
  month: 'All',
  feeHead: 'All',
  status: 'All',
  selectionFilters: {
    allPending: false,
    allCharges: false,
    firstSixMonths: false,
    lastSixMonths: false,
  },
};

const TABS = [
  { value: 'by-fee-head' as FeeLedgerTab, label: 'By Fee Head', icon: 'solar:tag-bold' },
  { value: 'by-month' as FeeLedgerTab, label: 'By Month', icon: 'solar:calendar-bold' },
];

export const getAcademicYearMonthOptions = (
  data: { month: number; year: number }[] | undefined
) => [
  { label: 'All', value: 'All' },
  ...(data?.map((item) => ({
    label: `${FeeMonth[item.month]}-${item.year}`,
    value: `${item.month}-${item.year}`,
  })) || []),
];

const STATUS_OPTIONS = [
  { label: 'All', value: 'All' },
  ...FeeCollectionStatusOptions.map((s) => ({ label: s.label, value: String(s.value) })),
];

const SELECTION_FILTER_OPTIONS: Array<{
  key: keyof FeeLedgerSelectionFilters;
  label: string;
}> = [
  { key: 'allPending', label: 'All Pending' },
  { key: 'allCharges', label: 'All Charges' },
  { key: 'firstSixMonths', label: 'First 6 Month' },
  { key: 'lastSixMonths', label: 'Last 6 Month' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const FeeLedgerFilterBar = ({
  filters,
  onFilterChange,
  entryCount,
  studentId,
  academicYearId,
  feeHeads,
  academicYearMonths,
  isMonthsLoading = false,
  selectionStates,
  onSelectionFilterChange,
}: FeeLedgerFilterBarProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const resolvedYearId = academicYearId ?? currentYear?.id;
  const tabs = useTabs(filters.activeTab);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(_, newValue);
    onFilterChange({ ...filters, activeTab: newValue as FeeLedgerTab });
  };

  const {
    data: studentFeeStructureData,
    isLoading: isFeeHeadLoading,
    isFetching: isFeeHeadFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentFeeStructureQuery,
    params: { studentId, academicYearId: resolvedYearId },
    options: { skip: feeHeads !== undefined || !studentId || !resolvedYearId },
  });

  const monthOptions = getAcademicYearMonthOptions(academicYearMonths);

  const handleSelectionFilterToggle = (key: keyof FeeLedgerSelectionFilters, checked: boolean) => {
    if (onSelectionFilterChange) {
      onSelectionFilterChange(key, checked);
      return;
    }
    onFilterChange({
      ...filters,
      selectionFilters: {
        ...filters.selectionFilters,
        [key]: checked,
      },
    });
  };

  const feeHeadOptions = [
    { id: 'All', name: 'All' },
    ...(
      feeHeads ??
      (studentFeeStructureData?.feeHeads ?? []).filter((fh: any) => fh.isSelected === true)
    ).map((fh: any) => ({
      id: fh.feeHeadId,
      name: fh.feeHeadName,
    })),
  ];

  return (
    <Paper variant="outlined" sx={{ p: 1, flexShrink: 0 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <CustomSelect
          fullWidth
          label="Month"
          options={monthOptions}
          value={filters.month}
          size="small"
          isLoading={isMonthsLoading}
          onChange={(value) => onFilterChange({ ...filters, month: String(value) })}
        />
        <CustomSelect
          fullWidth
          label="Fee Head"
          options={feeHeadOptions}
          labelKey="name"
          valueKey="id"
          value={filters.feeHead}
          size="small"
          isLoading={isFeeHeadLoading || isFeeHeadFetching}
          onChange={(value) => onFilterChange({ ...filters, feeHead: String(value) })}
        />
        <CustomSelect
          fullWidth
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status}
          size="small"
          onChange={(value) => onFilterChange({ ...filters, status: String(value) })}
        />
        <CustomSelect
          fullWidth
          label="Group by"
          options={TABS}
          value={tabs.value as string}
          size="small"
          onChange={(value) => handleTabChange({} as React.SyntheticEvent, String(value))}
        />
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        sx={{ pt: 0.5 }}
      >
        <Typography variant="caption" color="text.secondary">
          {entryCount ?? 0} entries · Select fees
        </Typography>
        {SELECTION_FILTER_OPTIONS.map((option) => (
          <FormControlLabel
            key={option.key}
            sx={{ m: 0 }}
            label={<Typography variant="body2">{option.label}</Typography>}
            control={
              <Checkbox
                size="small"
                checked={
                  selectionStates?.[option.key]?.checked ?? filters.selectionFilters[option.key]
                }
                indeterminate={selectionStates?.[option.key]?.indeterminate ?? false}
                slotProps={{
                  input: {
                    'aria-checked': selectionStates?.[option.key]?.indeterminate
                      ? 'mixed'
                      : undefined,
                  },
                }}
                disabled={
                  (option.key === 'firstSixMonths' || option.key === 'lastSixMonths') &&
                  (isMonthsLoading || !academicYearMonths?.length)
                }
                onChange={(_, checked) => handleSelectionFilterToggle(option.key, checked)}
              />
            }
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default FeeLedgerFilterBar;
