'use client';

import { useRef, useEffect } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Typography, CircularProgress } from '@mui/material';
import { FinanceAuditAction, FinanceAuditSubModule } from 'src/enums/financeAudit.enum';

import AuditFilter from './components/AuditFilter';
import AuditTimeline from './components/AuditTimeline';
import { useAuditFilters } from './hooks/useAuditFilters';

import type { FinanceAuditLog } from './types/financeAudit.types';

// ---------------------------------------------------------------------------
// Mock data – replace with API call (e.g. useQuery / RTK Query) when ready
// ---------------------------------------------------------------------------
const MOCK_LOGS: FinanceAuditLog[] = [
  {
    id: '1',
    subModule: FinanceAuditSubModule.COLLECTIONS,
    action: FinanceAuditAction.PAYMENT,
    description: 'Fee payment of ₹5,000 received for Term 2',
    studentName: 'Aarav Shah',
    studentId: 'STU001',
    performedBy: 'Admin User',
    performedByRole: 'Finance Admin',
    createdAt: new Date().toISOString(),
    beforeData: { amount: '₹0', status: 'Pending' },
    afterData: { amount: '₹5,000', status: 'Paid' },
    ipAddress: '192.168.1.10',
  },
  {
    id: '2',
    subModule: FinanceAuditSubModule.CHARGES,
    action: FinanceAuditAction.ADD_CHARGE,
    description: 'Late fee of ₹200 added for April instalment',
    studentName: 'Priya Mehta',
    studentId: 'STU002',
    performedBy: 'Suresh Joshi',
    performedByRole: 'Accountant',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    afterData: { chargeType: 'Late Fee', amount: '₹200', month: 'April' },
  },
  {
    id: '3',
    subModule: FinanceAuditSubModule.REFUNDS,
    action: FinanceAuditAction.REFUND,
    description: 'Refund amount updated from ₹500 to ₹1,000 after concession approval',
    studentName: 'Riya Patel',
    studentId: 'STU003',
    performedBy: 'Admin User',
    performedByRole: 'Finance Admin',
    createdAt: new Date(Date.now() - 7_200_000).toISOString(),
    beforeData: { amount: '₹500' },
    afterData: { amount: '₹1,000' },
  },
  {
    id: '4',
    subModule: FinanceAuditSubModule.CONCESSIONS,
    action: FinanceAuditAction.APPROVE,
    description: 'Sibling concession of 10% approved',
    studentName: 'Karan Desai',
    studentId: 'STU004',
    performedBy: 'Principal',
    performedByRole: 'Principal',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    afterData: { concessionType: 'Sibling', discount: '10%', status: 'Approved' },
  },
  {
    id: '5',
    subModule: FinanceAuditSubModule.INVOICE_RECEIPTS,
    action: FinanceAuditAction.GENERATE_RECEIPT,
    description: 'Receipt #REC-2024-0892 generated successfully',
    studentName: 'Neha Singh',
    studentId: 'STU005',
    performedBy: 'Admin User',
    performedByRole: 'Finance Admin',
    createdAt: new Date(Date.now() - 86_400_000 * 2).toISOString(),
    afterData: { receiptNo: 'REC-2024-0892', amount: '₹12,000' },
  },
  {
    id: '6',
    subModule: FinanceAuditSubModule.RECONCILIATION,
    action: FinanceAuditAction.CREATE,
    description: 'Bank reconciliation entry created for HDFC account ending 4521',
    performedBy: 'Suresh Joshi',
    performedByRole: 'Accountant',
    createdAt: new Date(Date.now() - 86_400_000 * 3).toISOString(),
    afterData: { bank: 'HDFC', account: '****4521', amount: '₹1,50,000' },
  },
  {
    id: '7',
    subModule: FinanceAuditSubModule.EXPENSE_TRACKING,
    action: FinanceAuditAction.UPDATE,
    description: 'Electricity expense updated from ₹8,000 to ₹9,200 for May',
    performedBy: 'Admin User',
    performedByRole: 'Finance Admin',
    createdAt: new Date(Date.now() - 86_400_000 * 3).toISOString(),
    beforeData: { category: 'Electricity', amount: '₹8,000', month: 'May' },
    afterData: { category: 'Electricity', amount: '₹9,200', month: 'May' },
  },
  {
    id: '8',
    subModule: FinanceAuditSubModule.INCOME_TRACKING,
    action: FinanceAuditAction.CREATE,
    description: 'Donation income of ₹25,000 recorded from Mr. Vikas Sharma',
    performedBy: 'Suresh Joshi',
    performedByRole: 'Accountant',
    createdAt: new Date(Date.now() - 86_400_000 * 4).toISOString(),
    afterData: { incomeType: 'Donation', amount: '₹25,000', source: 'Vikas Sharma' },
  },
  {
    id: '9',
    subModule: FinanceAuditSubModule.ADJUSTMENTS,
    action: FinanceAuditAction.ADJUSTMENT,
    description: 'Fee adjustment of ₹300 applied for transport waiver',
    studentName: 'Dev Kulkarni',
    studentId: 'STU009',
    performedBy: 'Admin User',
    performedByRole: 'Finance Admin',
    createdAt: new Date(Date.now() - 86_400_000 * 5).toISOString(),
    beforeData: { totalFee: '₹15,000' },
    afterData: { totalFee: '₹14,700', adjustment: '₹300 (Transport Waiver)' },
  },
];

// ---------------------------------------------------------------------------

const AuditTrail = () => {
  const {
    filters,
    filteredLogs,
    visibleLogs,
    hasMore,
    isFiltered,
    handleFilterChange,
    handleResetFilters,
    loadMore,
  } = useAuditFilters(MOCK_LOGS);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Page Header ─────────────────────────────────────── */}
      <CustomBreadcrumbs
        heading="Audit Trail"
        description="Comprehensive log of all finance-related activities, changes, and approvals."
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Audit Trail' }]}
      />

      {/* ── Filter Bar ──────────────────────────────────────── */}
      <AuditFilter
        filters={filters}
        isFiltered={isFiltered}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalCount={MOCK_LOGS.length}
        filteredCount={filteredLogs.length}
      />

      {/* ── Summary bar ─────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2,
          px: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {filteredLogs.length}{' '}
            <Typography component="span" variant="body2" color="text.disabled">
              {filteredLogs.length === 1 ? 'record' : 'records'} found
            </Typography>
          </Typography>
          {isFiltered && (
            <Chip
              label="Filtered"
              size="small"
              color="primary"
              variant="soft"
              sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
            />
          )}
        </Box>

        {/* Legend dots */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Collections', color: '#4CAF50' },
            { label: 'Charges', color: '#FF9800' },
            { label: 'Refunds', color: '#F44336' },
            { label: 'Concessions', color: '#9C27B0' },
            { label: 'Reconciliation', color: '#009688' },
          ].map(({ label, color }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: color,
                  boxShadow: `0 0 0 2px ${color}30`,
                }}
              />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Timeline ────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 0.5,
          // Custom scrollbar
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'grey.300',
            borderRadius: 3,
            '&:hover': { bgcolor: 'grey.400' },
          },
        }}
      >
        <AuditTimeline logs={visibleLogs} />

        {/* Infinite scroll sentinel */}
        <Box ref={sentinelRef} sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
          {hasMore && <CircularProgress size={24} thickness={3} />}
        </Box>
      </Box>
    </Box>
  );
};

export default AuditTrail;
