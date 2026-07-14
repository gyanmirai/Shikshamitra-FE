'use client';

import type {
  AdmissionCrmLeadDto,
  AdmissionCrmLeadListParams,
  AdmissionCrmPipelineStageDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useGetAdmissionCrmLeadsQuery } from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Skeleton,
  Typography,
  LinearProgress,
} from '@mui/material';

const PAGE_SIZE = 25;

type Props = {
  academicYearId: string;
  stage: AdmissionCrmPipelineStageDto;
  query: Omit<AdmissionCrmLeadListParams, 'stage' | 'skipCount' | 'maxResultCount'>;
  resetKey: string;
  renderLead: (lead: AdmissionCrmLeadDto) => React.ReactNode;
  clientFilter: (lead: AdmissionCrmLeadDto) => boolean;
};

export function PipelineStageColumn({
  academicYearId,
  stage,
  query,
  resetKey,
  renderLead,
  clientFilter,
}: Props) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [loadedLeads, setLoadedLeads] = useState<AdmissionCrmLeadDto[]>([]);
  const [shouldLoad, setShouldLoad] = useState(false);
  const { data, isFetching, isError, refetch } = useGetAdmissionCrmLeadsQuery(
    {
      academicYearId,
      ...query,
      stage: stage.systemStage,
      skipCount: page * PAGE_SIZE,
      maxResultCount: PAGE_SIZE,
      sorting: 'LastActivityTime DESC',
    },
    { skip: !academicYearId || !shouldLoad }
  );

  useEffect(() => {
    const element = columnRef.current;
    if (!element || shouldLoad) return undefined;
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: '320px', threshold: 0.01 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    setPage(0);
    setLoadedLeads([]);
  }, [resetKey]);

  useEffect(() => {
    if (!data) return;
    setLoadedLeads((current) => {
      const next = page === 0 ? data.items : [...current, ...data.items];
      return Array.from(new Map(next.map((lead) => [lead.id, lead])).values());
    });
  }, [data, page]);

  const visibleLeads = useMemo(() => loadedLeads.filter(clientFilter), [clientFilter, loadedLeads]);
  const canLoadMore = loadedLeads.length < (data?.totalCount ?? 0);
  const configuredColor = /^#[0-9a-f]{6}$/i.test(stage.colorHex || '')
    ? stage.colorHex || undefined
    : undefined;

  return (
    <Paper
      ref={columnRef}
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 1,
        width: { xs: '100%', lg: 300 },
        minWidth: { xs: 0, lg: 300 },
        flex: { lg: '0 0 300px' },
        bgcolor: 'background.neutral',
        borderTop: configuredColor ? `3px solid ${configuredColor}` : undefined,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Chip
          size="small"
          variant="outlined"
          label={stage.stageName}
          sx={
            configuredColor ? { borderColor: configuredColor, color: configuredColor } : undefined
          }
        />
        <Typography variant="caption" color="text.secondary">
          {shouldLoad ? (data?.totalCount ?? 0) : '...'}
        </Typography>
      </Stack>
      {!shouldLoad && (
        <Stack spacing={1} aria-label={`${stage.stageName} loads when visible`}>
          <Skeleton variant="rounded" height={112} />
          <Skeleton variant="rounded" height={112} />
        </Stack>
      )}
      {isFetching && page === 0 && <LinearProgress sx={{ mb: 1 }} />}
      {shouldLoad && isError ? (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Stage unavailable
        </Alert>
      ) : shouldLoad ? (
        <Stack spacing={1}>
          {visibleLeads.length
            ? visibleLeads.map(renderLead)
            : !isFetching && (
                <Typography variant="body2" color="text.secondary">
                  No leads
                </Typography>
              )}
          {canLoadMore && (
            <Button
              size="small"
              onClick={() => setPage((current) => current + 1)}
              disabled={isFetching}
            >
              {isFetching ? 'Loading...' : 'Load more'}
            </Button>
          )}
        </Stack>
      ) : null}
    </Paper>
  );
}
