'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Alert, Drawer, IconButton, Typography, CircularProgress } from '@mui/material';
import { useLazyGetFinanceStudentAuditEventsQuery } from 'src/redux/finance/audit/financeAuditApi';
import { useFinancePermissions } from 'src/screens/finance/hooks/useFinancePermissions';

import AuditTimeline from './AuditTimeline';
import { mapFinanceAuditEventsToLogs } from '../utils/financeAudit.mapper';

type FinanceFeeAuditDrawerProps = {
  open: boolean;
  studentId: string | null;
  studentName?: string;
  onClose: () => void;
};

export default function FinanceFeeAuditDrawer(props: FinanceFeeAuditDrawerProps) {
  const access = useFinancePermissions('Finance.Auditing');
  return access.canView ? <AuthorizedFinanceFeeAuditDrawer {...props} /> : null;
}

function AuthorizedFinanceFeeAuditDrawer({
  open,
  studentId,
  studentName,
  onClose,
}: FinanceFeeAuditDrawerProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [accumulatedEvents, setAccumulatedEvents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFetchingNewer, setIsFetchingNewer] = useState(false);
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);

  const [trigger] = useLazyGetFinanceStudentAuditEventsQuery();

  const loadInitial = useCallback(async () => {
    if (!studentId || !currentYear?.id) return;
    setIsInitialLoading(true);
    setIsError(false);
    try {
      const res = await trigger({
        studentId,
        academicYearId: currentYear.id,
        maxResultCount: 20,
        skipCount: 0,
        sorting: 'occurredAt desc',
      }).unwrap();
      setAccumulatedEvents(res.items || []);
      setTotalCount(res.totalCount || 0);
    } catch (err) {
      setIsError(true);
    } finally {
      setIsInitialLoading(false);
    }
  }, [studentId, currentYear?.id, trigger]);

  useEffect(() => {
    if (open) {
      loadInitial();
    } else {
      setAccumulatedEvents([]);
      setTotalCount(0);
      setIsInitialLoading(true);
      setIsError(false);
    }
  }, [open, loadInitial]);

  const loadMoreOlder = useCallback(async () => {
    if (
      isFetchingNewer ||
      isFetchingOlder ||
      isInitialLoading ||
      accumulatedEvents.length >= totalCount ||
      !studentId ||
      !currentYear?.id
    ) {
      return;
    }
    setIsFetchingOlder(true);
    try {
      const res = await trigger({
        studentId,
        academicYearId: currentYear.id,
        maxResultCount: 20,
        skipCount: accumulatedEvents.length,
        sorting: 'occurredAt desc',
      }).unwrap();

      setAccumulatedEvents((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = (res.items || []).filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
      setTotalCount(res.totalCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingOlder(false);
    }
  }, [
    accumulatedEvents.length,
    totalCount,
    studentId,
    currentYear?.id,
    isFetchingNewer,
    isFetchingOlder,
    isInitialLoading,
    trigger,
  ]);

  const loadMoreNewer = useCallback(async () => {
    if (
      isFetchingNewer ||
      isFetchingOlder ||
      isInitialLoading ||
      accumulatedEvents.length === 0 ||
      !studentId ||
      !currentYear?.id
    ) {
      return;
    }
    setIsFetchingNewer(true);
    try {
      const res = await trigger({
        studentId,
        academicYearId: currentYear.id,
        maxResultCount: 20,
        skipCount: 0,
        sorting: 'occurredAt desc',
      }).unwrap();

      setAccumulatedEvents((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = (res.items || []).filter((item) => !existingIds.has(item.id));
        if (newItems.length > 0) {
          return [...newItems, ...prev];
        }
        return prev;
      });
      setTotalCount(res.totalCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingNewer(false);
    }
  }, [
    accumulatedEvents.length,
    studentId,
    currentYear?.id,
    isFetchingNewer,
    isFetchingOlder,
    isInitialLoading,
    trigger,
  ]);

  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  // Observer for top sentinel (scrolling up)
  useEffect(() => {
    const el = topSentinelRef.current;
    if (!el || isInitialLoading || accumulatedEvents.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNewer && !isFetchingOlder) {
          loadMoreNewer();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [loadMoreNewer, isInitialLoading, accumulatedEvents.length, isFetchingNewer, isFetchingOlder]);

  // Observer for bottom sentinel (scrolling down)
  useEffect(() => {
    const el = bottomSentinelRef.current;
    if (!el || isInitialLoading || accumulatedEvents.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          accumulatedEvents.length < totalCount &&
          !isFetchingNewer &&
          !isFetchingOlder
        ) {
          loadMoreOlder();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [
    loadMoreOlder,
    isInitialLoading,
    accumulatedEvents.length,
    totalCount,
    isFetchingNewer,
    isFetchingOlder,
  ]);

  const logs = mapFinanceAuditEventsToLogs(accumulatedEvents);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Fee Audit Trail
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {studentName || 'Student activity'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mdi:close" />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        {/* Top Sentinel */}
        <Box ref={topSentinelRef} sx={{ height: 2, visibility: 'hidden' }} />

        {isFetchingNewer && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={20} thickness={3} />
          </Box>
        )}

        {isInitialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : isError ? (
          <Alert
            severity="error"
            action={
              <IconButton size="small" onClick={() => loadInitial()}>
                <Iconify icon="mdi:refresh" width={18} />
              </IconButton>
            }
          >
            Failed to load audit events.
          </Alert>
        ) : (
          <>
            <AuditTimeline logs={logs} cardVariant="compact" />

            {/* Bottom Sentinel */}
            <Box ref={bottomSentinelRef} sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
              {accumulatedEvents.length < totalCount && (
                <CircularProgress size={24} thickness={3} />
              )}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
