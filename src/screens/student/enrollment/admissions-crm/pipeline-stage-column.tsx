'use client';

import type {
  AdmissionCrmLeadDto,
  AdmissionCrmLeadListParams,
  AdmissionCrmPipelineColumnKey,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import { useRef, useState, useEffect } from 'react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { useGetAdmissionCrmLeadsQuery } from 'src/redux/student/admissions-crm/core-leads-api';
import {
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Tooltip,
  Skeleton,
  Typography,
  IconButton,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

const PAGE_SIZE = 25;
const emptyLeads: AdmissionCrmLeadDto[] = [];

export type PipelineColumnDefinition = {
  key: AdmissionCrmPipelineColumnKey;
  label: string;
  description: string;
  color: string;
};

type Props = {
  academicYearId: string;
  column: PipelineColumnDefinition;
  query: Omit<AdmissionCrmLeadListParams, 'pipelineColumn' | 'skipCount' | 'maxResultCount'>;
  resetKey: string;
  renderLead: (lead: AdmissionCrmLeadDto) => React.ReactNode;
};

export function PipelineStageColumn({
  academicYearId,
  column,
  query,
  resetKey,
  renderLead,
}: Props) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = useState({ resetKey, page: 0 });
  const [loadedState, setLoadedState] = useState<{
    resetKey: string;
    leads: AdmissionCrmLeadDto[];
    totalCount: number;
  }>({ resetKey, leads: [], totalCount: 0 });
  const [shouldLoad, setShouldLoad] = useState(false);
  const page = pagination.resetKey === resetKey ? pagination.page : 0;
  const loadedLeads = loadedState.resetKey === resetKey ? loadedState.leads : emptyLeads;
  const totalCount = loadedState.resetKey === resetKey ? loadedState.totalCount : 0;
  const {
    currentData: data,
    isFetching,
    isError,
    refetch,
  } = useGetAdmissionCrmLeadsQuery(
    {
      academicYearId,
      ...query,
      pipelineColumn: column.key,
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
    setPagination({ resetKey, page: 0 });
    setLoadedState({ resetKey, leads: [], totalCount: 0 });
  }, [resetKey]);

  useEffect(() => {
    if (!data) return;
    setLoadedState((current) => {
      const currentLeads = current.resetKey === resetKey ? current.leads : [];
      const next = page === 0 ? data.items : [...currentLeads, ...data.items];
      return {
        resetKey,
        leads: Array.from(new Map(next.map((lead) => [lead.id, lead])).values()),
        totalCount: data.totalCount,
      };
    });
  }, [data, page, resetKey]);

  const canLoadMore = loadedLeads.length < totalCount;
  const tooltipTitle = (
    <Typography variant="caption" color="inherit">
      {column.description}
    </Typography>
  );

  return (
    <Paper
      ref={columnRef}
      data-testid="student-enrollment-pipeline-column"
      data-pipeline-column={column.key}
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 1,
        width: { xs: '100%', lg: 300 },
        minWidth: { xs: 0, lg: 300 },
        flex: { lg: '0 0 300px' },
        height: { xs: 'auto', lg: '100%' },
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.neutral',
        borderTop: `3px solid ${column.color}`,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Stack direction="row" alignItems="center" gap={0.5} sx={{ minWidth: 0 }}>
          <Chip
            size="small"
            variant="outlined"
            label={column.label}
            sx={{ borderColor: column.color, color: 'text.primary' }}
          />
          <Tooltip title={tooltipTitle} arrow>
            <IconButton size="small" aria-label={`${column.label} column details`}>
              <InfoOutlined fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {shouldLoad ? (
            (data?.totalCount ?? 0)
          ) : (
            <Skeleton component="span" width={24} aria-label="Lead count loading" />
          )}
        </Typography>
      </Stack>
      {!shouldLoad && (
        <Stack spacing={1} aria-label={`${column.label} loads when visible`}>
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
          Column unavailable
        </Alert>
      ) : shouldLoad ? (
        <Stack
          spacing={1}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: { xs: 'visible', lg: 'auto' },
            pr: { lg: 0.5 },
          }}
        >
          {loadedLeads.length
            ? loadedLeads.map(renderLead)
            : !isFetching && (
                <Typography variant="body2" color="text.secondary">
                  No applicants
                </Typography>
              )}
          {canLoadMore && (
            <Button
              size="small"
              onClick={() =>
                setPagination((current) => ({
                  resetKey,
                  page: current.resetKey === resetKey ? current.page + 1 : 1,
                }))
              }
              disabled={isFetching}
            >
              {isFetching ? (
                <CircularProgress size={16} aria-label="Loading more leads" />
              ) : (
                'Load more'
              )}
            </Button>
          )}
        </Stack>
      ) : null}
    </Paper>
  );
}
