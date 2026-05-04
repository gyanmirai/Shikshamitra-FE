'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomTabs } from 'src/components/custom-tabs';
import { Box, Tab, Chip, Card, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import { FeeMonthOptions, FeeCollectionStatusOptions } from 'src/enums/fee-collection-type';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeeLedgerTab = 'by-month' | 'by-fee-head';

export interface FeeLedgerFilters {
  activeTab: FeeLedgerTab;
  month: string;
  feeHead: string;
  status: string;
}

interface FeeLedgerFilterBarProps {
  filters: FeeLedgerFilters;
  onFilterChange: (filters: FeeLedgerFilters) => void;
  entryCount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const FEE_LEDGER_INITIAL_FILTERS: FeeLedgerFilters = {
  activeTab: 'by-month',
  month: '',
  feeHead: '',
  status: '',
};

const TABS = [
  { value: 'by-month' as FeeLedgerTab, label: 'By Month', icon: 'solar:calendar-bold' },
  { value: 'by-fee-head' as FeeLedgerTab, label: 'By Fee Head', icon: 'solar:tag-bold' },
];

const MONTH_OPTIONS = [
  { label: 'All', value: 'All' },
  ...FeeMonthOptions.map((m) => ({ label: m.label, value: String(m.value) })),
];

const STATUS_OPTIONS = [
  { label: 'All', value: 'All' },
  ...FeeCollectionStatusOptions.map((s) => ({ label: s.label, value: String(s.value) })),
];

// ─── Component ────────────────────────────────────────────────────────────────

const FeeLedgerFilterBar = ({ filters, onFilterChange, entryCount }: FeeLedgerFilterBarProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const tabs = useTabs(filters.activeTab);

  const {
    data: feeHeadData,
    isLoading: isFeeHeadLoading,
    isFetching: isFeeHeadFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeHeadsQuery,
    params: { academicYearId: currentYear?.id },
  });

  const feeHeadOptions = [{ id: 'All', name: 'All' }, ...(feeHeadData?.items || [])];

  const handleTabChange = (_: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(_, newValue);
    onFilterChange({ ...filters, activeTab: newValue as FeeLedgerTab });
  };

  return (
    <Card sx={{ p: 1, boxShadow: 'var(--shadows-4)' }}>
      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">Fee Ledger</Typography>
          {entryCount !== undefined && (
            <Chip
              label={`${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`}
              size="small"
              variant="soft"
              color="default"
            />
          )}
        </Box>
        <CustomTabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{ minHeight: 28 }}
          slotProps={{
            scroller: { p: 0.5 },
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={tab.icon ? <Iconify icon={tab.icon} width={14} /> : undefined}
              iconPosition="start"
              sx={{ minHeight: 28, py: 0.5, px: 1.5, fontSize: '0.75rem' }}
            />
          ))}
        </CustomTabs>
      </Box>

      {/* ── Tabs ── */}

      {/* ── Filter Dropdowns ── */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <CustomSelect
          label="Month"
          options={MONTH_OPTIONS}
          labelKey="label"
          valueKey="value"
          value={filters.month}
          onChange={(value) => onFilterChange({ ...filters, month: value as string })}
          formControlProps={{ sx: { minWidth: 170, flex: '1 1 170px', maxWidth: 220 } }}
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
          formControlProps={{ sx: { minWidth: 180, flex: '1 1 180px', maxWidth: 240 } }}
          size="small"
        />

        <CustomSelect
          label="Status"
          options={STATUS_OPTIONS}
          labelKey="label"
          valueKey="value"
          value={filters.status}
          onChange={(value) => onFilterChange({ ...filters, status: value as string })}
          formControlProps={{ sx: { minWidth: 160, flex: '1 1 160px', maxWidth: 210 } }}
          size="small"
        />
      </Box>
    </Card>
  );
};

export default FeeLedgerFilterBar;
