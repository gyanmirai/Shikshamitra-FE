'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { CustomTabs } from 'src/components/custom-tabs';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FeeMonth, FeeCollectionStatusOptions } from 'src/enums/fee-collection-type';
import { useGetAcademicYearMonthsQuery } from 'src/redux/finance/financeFeeStructure';
import { useGetStudentFeeStructureQuery } from 'src/redux/student/admission/admission-api';
import { Box, Tab, Chip, Card, Checkbox, Typography, FormControlLabel } from '@mui/material';

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
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const FEE_LEDGER_INITIAL_FILTERS: FeeLedgerFilters = {
  activeTab: 'by-month',
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
  { value: 'by-month' as FeeLedgerTab, label: 'By Month', icon: 'solar:calendar-bold' },
  { value: 'by-fee-head' as FeeLedgerTab, label: 'By Fee Head', icon: 'solar:tag-bold' },
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
}: FeeLedgerFilterBarProps) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
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
    params: { studentId },
    options: { skip: !studentId },
  });

  const {
    data: academicYearMonthsData,
    isLoading: isMonthsLoading,
    isFetching: isMonthsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAcademicYearMonthsQuery,
    params: { academicYearId: currentYear?.id },
  });

  const monthOptions = getAcademicYearMonthOptions(academicYearMonthsData);

  const handleSelectionFilterToggle = (key: keyof FeeLedgerSelectionFilters) => {
    onFilterChange({
      ...filters,
      selectionFilters: {
        ...filters.selectionFilters,
        [key]: !filters.selectionFilters[key],
      },
    });
  };

  const feeHeadOptions = [
    { id: 'All', name: 'All' },
    ...(studentFeeStructureData?.feeHeads ?? [])
      .filter((fh: any) => fh.isSelected === true)
      .map((fh: any) => ({
        id: fh.feeHeadId,
        name: fh.feeHeadName,
      })),
  ];

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 1.25, md: 1.5 },
        boxShadow: (t) => `var(--shadows-4)`,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.75)}`,
      }}
    >
      {/* ── Header row: title + tabs ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          mb: 1.25,
        }}
      >
        {/* Title + entry count */}
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              flexShrink: 0,
            }}
          >
            <Iconify
              icon="solar:document-text-bold"
              sx={{ color: 'primary.main', width: 16, height: 16 }}
            />
          </Box>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ fontSize: '0.9rem', letterSpacing: '-0.01em' }}
          >
            Fee Ledger
          </Typography>
          {entryCount !== undefined && (
            <Chip
              label={`${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`}
              size="small"
              variant="soft"
              color="default"
              sx={{
                borderRadius: 999,
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          )}
        </Box>

        {/* View toggle tabs */}
        <CustomTabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{
            minHeight: 30,
            '& .MuiTabs-indicator': { borderRadius: 999 },
          }}
          slotProps={{
            scroller: { p: 0.375 },
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={tab.icon ? <Iconify icon={tab.icon} width={13} /> : undefined}
              iconPosition="start"
              sx={{
                minHeight: 30,
                py: 0.5,
                px: 1.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.01em',
              }}
            />
          ))}
        </CustomTabs>
      </Box>

      {/* ── Filter dropdowns ── */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.25,
          flexWrap: 'wrap',
          pt: 1,
          borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
        }}
      >
        <CustomSelect
          label="Month"
          options={monthOptions}
          labelKey="label"
          valueKey="value"
          value={filters.month}
          isLoading={isMonthsLoading || isMonthsFetching}
          onChange={(value) => onFilterChange({ ...filters, month: value as string })}
          formControlProps={{ sx: { flex: 1, minWidth: 180 } }}
          size="small"
        />

        <CustomSelect
          label="Fee Head"
          options={feeHeadOptions}
          labelKey="name"
          valueKey="id"
          value={filters.feeHead}
          isLoading={isFeeHeadLoading || isFeeHeadFetching}
          onChange={(value) => onFilterChange({ ...filters, feeHead: value as string })}
          formControlProps={{ sx: { flex: 1, minWidth: 180 } }}
          size="small"
        />

        <CustomSelect
          label="Status"
          options={STATUS_OPTIONS}
          labelKey="label"
          valueKey="value"
          value={filters.status}
          onChange={(value) => onFilterChange({ ...filters, status: value as string })}
          formControlProps={{ sx: { flex: 1, minWidth: 180 } }}
          size="small"
        />

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            pt: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            Selection Filters
          </Typography>

          {SELECTION_FILTER_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.key}
              control={
                <Checkbox
                  size="small"
                  checked={filters.selectionFilters[option.key]}
                  onChange={() => handleSelectionFilterToggle(option.key)}
                />
              }
              label={option.label}
              sx={{
                mr: 0.5,
                ml: 0,
                borderRadius: 999,
                px: 0.5,
                py: 0.5,
                bgcolor: filters.selectionFilters[option.key]
                  ? alpha(theme.palette.primary.main, 0.08)
                  : 'transparent',
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.78rem',
                  fontWeight: 500,
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Card>
  );
};

export default FeeLedgerFilterBar;
