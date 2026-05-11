'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
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
    <Card
      sx={{
        p: 1.5,
        boxShadow: 'var(--shadows-4)',
        borderRadius: 2,
        ml: 0.5,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.6)}`,
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
          options={MONTH_OPTIONS}
          labelKey="label"
          valueKey="value"
          value={filters.month}
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
      </Box>
    </Card>
  );
};

export default FeeLedgerFilterBar;
