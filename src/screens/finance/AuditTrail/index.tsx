'use client';

import { useRef, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import 'src/redux/finance/audit/financeAuditApi';
import { useSearchParams } from 'next/navigation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Alert, Button, Skeleton, Typography, CircularProgress } from '@mui/material';

import AuditFilter from './components/AuditFilter';
import AuditTimeline from './components/AuditTimeline';
import { FINANCE_AUDIT_LEGEND } from './constants/subModuleColors';
import { useFinanceAuditTrail } from './hooks/useFinanceAuditTrail';

const AuditTrail = () => {
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get('studentId') ?? '';
  const initialCorrelationId = searchParams.get('correlationId') ?? '';

  const {
    filters,
    visibleLogs,
    totalCount,
    filteredCount,
    hasMore,
    isFiltered,
    isLoading,
    isFetching,
    isError,
    refetch,
    handleFilterChange,
    handleSelectStudent,
    handleFilterByStudent,
    handleResetFilters,
    loadMore,
  } = useFinanceAuditTrail({
    studentId: initialStudentId,
    correlationId: initialCorrelationId,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore, isFetching]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CustomBreadcrumbs
        description="Comprehensive log of all finance-related activities, changes, and approvals."
        heading="Audit Trail"

        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Audit Trail' }]}
      />

      <AuditFilter
        filters={filters}
        isFiltered={isFiltered}
        onFilterChange={handleFilterChange}
        onSelectStudent={handleSelectStudent}
        onReset={handleResetFilters}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Unable to load audit events. Please try again.
        </Alert>
      )}

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
            {filteredCount}{' '}
            <Typography component="span" variant="body2" color="text.disabled">
              {filteredCount === 1 ? 'record' : 'records'} found
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

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {FINANCE_AUDIT_LEGEND.map(({ label, color }) => (
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
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 0.5,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'grey.300',
            borderRadius: 3,
            '&:hover': { bgcolor: 'grey.400' },
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={120} />
            ))}
          </Box>
        ) : (
          <>
            <AuditTimeline logs={visibleLogs} onFilterByStudent={handleFilterByStudent} />
            {!isLoading && visibleLogs.length === 0 && !isError && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Iconify icon="mdi:history" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  No audit history found
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                  Collect a fee or adjust records to see activity here.
                </Typography>
              </Box>
            )}
          </>
        )}

        <Box ref={sentinelRef} sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
          {hasMore && <CircularProgress size={24} thickness={3} />}
        </Box>
      </Box>
    </Box>
  );
};

export default AuditTrail;
