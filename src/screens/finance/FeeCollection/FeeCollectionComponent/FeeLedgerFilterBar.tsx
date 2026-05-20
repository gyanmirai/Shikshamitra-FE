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

const QUICK_MONTH_OPTIONS = [
  { label: 'All', value: 'All' },
  ...FeeMonthOptions.map((m) => ({ label: m.label.slice(0, 3), value: String(m.value) })),
];

const STATUS_OPTIONS = [
  { label: 'All', value: 'All' },
  ...FeeCollectionStatusOptions.map((s) => ({ label: s.label, value: String(s.value) })),
];

// ─── Component ───────────────────────────────────────────────────────────────────

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
        p: { xs: 1.25, md: 1.5 },
        boxShadow: (t) => `0 8px 18px ${alpha(t.palette.common.black, 0.06)}`,
        borderRadius: 2.6,
        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.14)}`,
        position: { md: 'sticky' },
        top: { md: 8 },
        zIndex: 3,
        // bgcolor: (t) => alpha(t.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* ── Header row: title + tabs ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          mb: 1,
        }}
      >
        {/* Title + entry count */}
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 32,
              height: 32,
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
            sx={{ fontSize: '0.95rem', letterSpacing: '-0.01em' }}
          >
            Fee Timeline Navigator
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
                fontSize: '0.72rem',
                height: 22,
                border: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
              }}
            />
          )}
        </Box>

        {/* View toggle tabs */}
        <CustomTabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{
            minHeight: 34,
            border: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
            borderRadius: 1.25,
            // bgcolor: (t) => alpha(t.palette.background.neutral ?? t.palette.action.hover, 0.45),
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
                minHeight: 32,
                py: 0.5,
                px: 1.25,
                fontSize: '0.77rem',
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
          gap: 1,
          flexWrap: 'wrap',
          pt: 1.1,
          borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.72)}`,
        }}
      >
        <CustomSelect
          label="Month"
          options={MONTH_OPTIONS}
          labelKey="label"
          valueKey="value"
          value={filters.month}
          onChange={(value) => onFilterChange({ ...filters, month: value as string })}
          formControlProps={{ sx: { flex: 1, minWidth: { xs: '100%', sm: 175 } } }}
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
          formControlProps={{ sx: { flex: 1, minWidth: { xs: '100%', sm: 175 } } }}
          size="small"
        />

        <CustomSelect
          label="Status"
          options={STATUS_OPTIONS}
          labelKey="label"
          valueKey="value"
          value={filters.status}
          onChange={(value) => onFilterChange({ ...filters, status: value as string })}
          formControlProps={{ sx: { flex: 1, minWidth: { xs: '100%', sm: 175 } } }}
          size="small"
        />

        <Box
          sx={{
            width: '100%',
            mt: 0.3,
            pt: 0.9,
            borderTop: (t) => `1px dashed ${alpha(t.palette.divider, 0.85)}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.7, display: 'block' }}
          >
            Quick Month Selection
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.65, flexWrap: 'wrap' }}>
            {QUICK_MONTH_OPTIONS.map((month) => (
              <Chip
                key={month.value}
                label={month.label}
                size="small"
                onClick={() => onFilterChange({ ...filters, month: month.value })}
                color={filters.month === month.value ? 'primary' : 'default'}
                variant={filters.month === month.value ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 700,
                  height: 23,
                  borderRadius: 1,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default FeeLedgerFilterBar;
