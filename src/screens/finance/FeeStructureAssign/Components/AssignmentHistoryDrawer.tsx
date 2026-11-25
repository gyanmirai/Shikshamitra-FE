'use client';

import type {
  AssignmentHistoryPage,
  AssignmentHistoryChange,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import { useAssignmentHistoryQuery } from 'src/redux/finance/studentFeeAssignment';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';
import PolicyHistoryPagination from 'src/screens/finance/policies/components/version/PolicyHistoryPagination';
import {
  Box,
  Alert,
  Stack,
  Drawer,
  Button,
  Skeleton,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import type { IFeeStructureData } from './type';

const pageSize = 10;
const title = 'Fee Assignment History';
const titleId = 'fee-assignment-history-title';

export default function AssignmentHistoryDrawer({
  student,
  academicYearId,
  academicYearName,
  onClose,
}: {
  student: IFeeStructureData;
  academicYearId: string;
  academicYearName?: string;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const history = useAssignmentHistoryQuery(
    {
      studentId: student.studentId,
      academicYearId,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { refetchOnMountOrArgChange: true }
  );
  const result = history.currentData;
  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          sx: {
            width: { xs: '100%', sm: 'min(760px, 96vw)' },
            maxWidth: '100%',
            bgcolor: 'background.neutral',
          },
        },
      }}
    >
      <FinancePolicyDrawerHeader
        title={title}
        titleId={titleId}
        description="Review when this student's fee assignment changed, who saved it, and the values recorded at the time."
        descriptionDisplay="tooltip"
        badges={<Label>Read only</Label>}
        onClose={onClose}
      />
      <Stack spacing={0.5} sx={{ px: 2, py: 1.5, bgcolor: 'background.paper', flexShrink: 0 }}>
        <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
          {student.studentName || 'Student'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {[academicYearName, student.grNumber && `GR No. ${student.grNumber}`]
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        useFlexGap
        sx={{ px: 2, py: 1.5, borderBlock: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Typography variant="subtitle2" component="h3">
          Recorded activity
        </Typography>
        {result && <Label>{result.totalCount}</Label>}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          Newest first · Local time
        </Typography>
      </Stack>
      <Scrollbar sx={{ flex: 1, minHeight: 0 }} aria-busy={history.isFetching}>
        <Stack spacing={1.5} sx={{ p: 2 }}>
          {history.isError ? (
            <Alert
              severity="error"
              action={
                <Button
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.refresh} />}
                  onClick={history.refetch}
                >
                  Retry
                </Button>
              }
            >
              Assignment history could not be loaded.
            </Alert>
          ) : !result ? (
            <Stack spacing={1} role="status" aria-label="Loading assignment history">
              <Skeleton variant="rounded" height={80} />
              <Skeleton variant="rounded" height={80} />
            </Stack>
          ) : (
            <>
              {result.hasIncompleteEvidence && (
                <Alert severity="info">Some older changes have incomplete recorded details.</Alert>
              )}
              {result.items.length ? (
                <AssignmentHistoryTimeline
                  key={page}
                  items={result.items}
                  currency={result.currency}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No assignment activity recorded.
                </Typography>
              )}
            </>
          )}
        </Stack>
      </Scrollbar>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={1}
        sx={{
          px: 2,
          py: 1,
          minHeight: 52,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        {(page > 0 || (result?.totalCount ?? 0) > pageSize) && (
          <PolicyHistoryPagination
            page={page}
            pageSize={pageSize}
            totalCount={result?.totalCount ?? 0}
            isLoading={history.isFetching}
            onPageChange={setPage}
            ariaLabel="Assignment history pages"
          />
        )}
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </Stack>
    </Drawer>
  );
}

function AssignmentHistoryTimeline({
  items,
  currency,
}: {
  items: AssignmentHistoryPage['items'];
  currency: string;
}) {
  const days = items.reduce<Record<string, AssignmentHistoryPage['items']>>((groups, item) => {
    const date = dayjs(item.occurredAt).format('YYYY-MM-DD');
    (groups[date] ||= []).push(item);
    return groups;
  }, {});
  return Object.entries(days).map(([date, entries]) => (
    <Accordion key={date} disableGutters defaultExpanded variant="outlined">
      <AccordionSummary
        id={`assignment-history-${date}`}
        aria-controls={`assignment-history-events-${date}`}
        expandIcon={<Iconify icon="mdi:chevron-down" width={20} />}
        sx={{ bgcolor: 'background.neutral' }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="mdi:calendar-blank-outline" width={18} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" component="span">
            {fDate(date)}
          </Typography>
          <Label>
            {entries.length} {entries.length === 1 ? 'event' : 'events'}
          </Label>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1.5 }}>
        <Stack spacing={1}>
          {entries.map((item) => (
            <Accordion key={item.id} disableGutters variant="outlined">
              <AccordionSummary
                id={`assignment-event-${item.id}`}
                aria-controls={`assignment-changes-${item.id}`}
                expandIcon={<Iconify icon="mdi:chevron-down" width={18} />}
              >
                <Stack spacing={0.5} alignItems="flex-start">
                  <Label>{item.action}</Label>
                  <Typography variant="caption" color="text.secondary" component="span">
                    {dayjs(item.occurredAt).format('h:mm:ss A')} · {item.actor || 'System'}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                {item.reason && (
                  <Typography variant="body2" sx={{ mb: 1, overflowWrap: 'anywhere' }}>
                    Reason: {item.reason}
                  </Typography>
                )}
                {item.changes.length ? (
                  <AssignmentHistoryChanges changes={item.changes} currency={currency} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No field changes recorded.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  ));
}

function AssignmentHistoryChanges({
  changes,
  currency,
}: {
  changes: AssignmentHistoryChange[];
  currency: string;
}) {
  const serviceHead = changes.find((change) => change.field === 'Fee head')?.after;
  const groups = new Map<
    string,
    {
      title: string;
      fields: AssignmentHistoryChange[];
      installments: Map<string, AssignmentHistoryChange[]>;
    }
  >();

  changes.forEach((change) => {
    if (serviceHead && change.field === 'Fee head') return;
    const [first, ...parts] = change.field.split(' · ');
    const feeHead =
      change.feeHead ?? (serviceHead ? String(serviceHead) : parts.length ? first : null);
    const installment =
      change.installment ??
      (serviceHead && parts.length
        ? first
        : parts.length > 1
          ? parts.slice(0, -1).join(' · ')
          : undefined);
    const detail = change.detail ?? parts.at(-1) ?? change.field;
    const groupTitle = feeHead ?? (/\bpolicy$/.test(change.field) ? 'Policies' : 'Assignment');
    const key = feeHead ? `fee:${feeHead}` : groupTitle;
    let group = groups.get(key);
    if (!group) {
      group = { title: groupTitle, fields: [], installments: new Map() };
      groups.set(key, group);
    }
    const field = { ...change, field: detail };
    if (installment) {
      const items = group.installments.get(installment) ?? [];
      items.push(field);
      group.installments.set(installment, items);
    } else {
      group.fields.push(field);
    }
  });

  return (
    <Stack spacing={1.25}>
      {[...groups.entries()].map(([key, group]) => (
        <Stack
          key={key}
          component="section"
          aria-label={group.title}
          spacing={1}
          sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
        >
          <Typography component="h4" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {group.title}
          </Typography>
          {!!group.fields.length && <HistoryFields fields={group.fields} currency={currency} />}
          {!!group.installments.size && (
            <Box component="details" sx={{ borderTop: 1, borderColor: 'divider', pt: 0.75 }}>
              <Typography component="summary" variant="body2" sx={{ cursor: 'pointer' }}>
                Installments ({group.installments.size})
              </Typography>
              <Stack
                spacing={0.75}
                divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}
              >
                {[...group.installments.entries()].map(([name, fields]) => (
                  <Stack key={name} spacing={0.5} sx={{ py: 0.75 }}>
                    <Typography component="h5" variant="subtitle2">
                      {name}
                    </Typography>
                    <HistoryFields fields={fields} currency={currency} />
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function HistoryFields({
  fields,
  currency,
}: {
  fields: AssignmentHistoryChange[];
  currency: string;
}) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gap: 1,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
      }}
    >
      {fields.map(({ field, before, after, format }, index) => (
        <Box key={`${field}:${index}`} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          <Typography component="dt" variant="caption" color="text.secondary">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0 }}>
            {after == null ? 'Removed' : formatChange(after, format, currency)}
          </Typography>
          {before != null && before !== after && (
            <Typography component="dd" variant="caption" color="text.secondary" sx={{ m: 0 }}>
              Previously {formatChange(before, format, currency)}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

function formatChange(
  value: AssignmentHistoryChange['before'],
  format: AssignmentHistoryChange['format'],
  currency: string
) {
  if (value == null || value === '') return '—';
  if (format === 'money' && typeof value === 'number') return formatNumber(value, currency);
  if (format === 'date') return fDate(String(value));
  return value;
}
