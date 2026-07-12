'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Add, Send, Publish } from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmIdentifierType,
  AdmissionCrmNumberSeriesStatus,
  useGetAdmissionCrmNumberSeriesQuery,
  useGetAdmissionCrmPlacementOptionsQuery,
  useCreateAdmissionCrmNumberSeriesMutation,
  useSubmitAdmissionCrmNumberSeriesMutation,
  usePublishAdmissionCrmNumberSeriesMutation,
  useGetAdmissionCrmIdentifierGovernanceQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

const today = () => new Date().toISOString().slice(0, 10);
const nextYear = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};
const iso = (value: string) => new Date(`${value}T00:00:00Z`).toISOString();
const labels = ['Draft', 'Approval pending', 'Published', 'Retired'];

export default function AdmissionsNumberSeriesConfiguration() {
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id) as
    | string
    | undefined;
  const [code, setCode] = useState('GR-MAIN');
  const [name, setName] = useState('General Register Number');
  const [prefix, setPrefix] = useState('GR-');
  const [suffix, setSuffix] = useState('');
  const [padding, setPadding] = useState('6');
  const [startingSequence, setStartingSequence] = useState('1');
  const [maximumSequence, setMaximumSequence] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(today);
  const [effectiveUntil, setEffectiveUntil] = useState(nextYear);
  const [placementKey, setPlacementKey] = useState('');
  const [auditSeriesId, setAuditSeriesId] = useState('');
  const series = useGetAdmissionCrmNumberSeriesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const placements = useGetAdmissionCrmPlacementOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const governance = useGetAdmissionCrmIdentifierGovernanceQuery(
    { academicYearId: academicYearId || '', seriesId: auditSeriesId },
    { skip: !academicYearId || !auditSeriesId }
  );
  const [create, createState] = useCreateAdmissionCrmNumberSeriesMutation();
  const [submit, submitState] = useSubmitAdmissionCrmNumberSeriesMutation();
  const [publish, publishState] = usePublishAdmissionCrmNumberSeriesMutation();
  const selected = placements.data?.find(
    (x) => `${x.educationBoardId}:${x.academicMediumId}:${x.standardId}` === placementKey
  );

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message });
    } catch (error) {
      const data =
        typeof error === 'object' && error && 'data' in error
          ? (error as { data?: { errorCode?: string } }).data
          : undefined;
      shikshaMitraToast.error({ message: data?.errorCode || 'Number series action failed.' });
    }
  };
  const save = () => {
    if (!academicYearId || !code.trim() || !name.trim()) return;
    run(
      () =>
        create({
          academicYearId,
          body: {
            code: code.trim().toUpperCase(),
            name: name.trim(),
            identifierType: AdmissionCrmIdentifierType.GrNumber,
            educationBoardId: selected?.educationBoardId || null,
            academicMediumId: selected?.academicMediumId || null,
            standardId: selected?.standardId || null,
            prefix,
            suffix,
            padding: Number(padding),
            startingSequence: Number(startingSequence),
            maximumSequence: maximumSequence ? Number(maximumSequence) : null,
            effectiveFrom: iso(effectiveFrom),
            effectiveUntil: effectiveUntil ? iso(effectiveUntil) : null,
          },
        }).unwrap(),
      'Number series draft created.'
    );
  };

  const scopeOptions = Array.from(
    new Map(
      (placements.data || []).map((x) => [
        `${x.educationBoardId}:${x.academicMediumId}:${x.standardId}`,
        x,
      ])
    ).entries()
  );
  return (
    <Stack spacing={1.25}>
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="subtitle2">Permanent identifier series</Typography>
            <Typography variant="caption" color="text.secondary">
              Publish non-overlapping GR sequences before student activation.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
            <TextField
              size="small"
              label="Series code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              label="Series name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              size="small"
              select
              label="Academic scope"
              value={placementKey}
              onChange={(e) => setPlacementKey(e.target.value)}
              sx={{ minWidth: 240 }}
            >
              <MenuItem value="">Whole cycle</MenuItem>
              {scopeOptions.map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value.boardName} / {value.mediumName} / {value.standardName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
            />
            <TextField
              size="small"
              label="Suffix"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
            />
            <TextField
              size="small"
              type="number"
              label="Padding"
              value={padding}
              onChange={(e) => setPadding(e.target.value)}
            />
            <TextField
              size="small"
              type="number"
              label="Starts at"
              value={startingSequence}
              onChange={(e) => setStartingSequence(e.target.value)}
            />
            <TextField
              size="small"
              type="number"
              label="Maximum"
              value={maximumSequence}
              onChange={(e) => setMaximumSequence(e.target.value)}
            />
            <TextField
              size="small"
              type="date"
              label="Effective from"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="date"
              label="Effective until"
              value={effectiveUntil}
              onChange={(e) => setEffectiveUntil(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <LoadingButton
            variant="contained"
            startIcon={<Add />}
            loading={createState.isLoading}
            onClick={save}
            sx={{ alignSelf: 'flex-start' }}
          >
            Create draft
          </LoadingButton>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2">Series register</Typography>
          {series.isFetching && <LinearProgress />}
          {!series.data?.length && (
            <Alert severity="info">No activation number series are configured.</Alert>
          )}
          {(series.data || []).map((item) => (
            <Stack
              key={item.id}
              direction={{ xs: 'column', md: 'row' }}
              gap={1}
              justifyContent="space-between"
              alignItems={{ md: 'center' }}
              sx={{ pt: 0.75, borderTop: '1px solid', borderColor: 'divider' }}
            >
              <Box>
                <Typography variant="body2">
                  {item.name}{' '}
                  <Typography component="span" variant="caption">
                    {item.code}
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Range starts {item.startingSequence}; next {item.nextPreview}
                </Typography>
              </Box>
              <Stack direction="row" gap={0.75}>
                <Chip
                  size="small"
                  label={labels[item.status]}
                  color={
                    item.status === AdmissionCrmNumberSeriesStatus.Published ? 'success' : 'default'
                  }
                />
                <LoadingButton size="small" onClick={() => setAuditSeriesId(item.id)}>
                  Audit
                </LoadingButton>
                {item.status === 0 && (
                  <LoadingButton
                    size="small"
                    startIcon={<Send />}
                    loading={submitState.isLoading}
                    onClick={() =>
                      run(() => submit({ seriesId: item.id }).unwrap(), 'Series submitted.')
                    }
                  >
                    Submit
                  </LoadingButton>
                )}
                {item.status === 1 && (
                  <LoadingButton
                    size="small"
                    startIcon={<Publish />}
                    loading={publishState.isLoading}
                    onClick={() =>
                      run(() => publish({ seriesId: item.id }).unwrap(), 'Series published.')
                    }
                  >
                    Publish
                  </LoadingButton>
                )}
              </Stack>
            </Stack>
          ))}
          {governance.isFetching && <LinearProgress />}
          {governance.data && (
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <Chip size="small" label={`Allocated ${governance.data.allocatedCount}`} />
              <Chip size="small" label={`Committed ${governance.data.committedCount}`} />
              <Chip size="small" label={`Manual ${governance.data.manualCount}`} />
              <Chip size="small" label={`Voided ${governance.data.voidedCount}`} />
              <Chip
                size="small"
                color={governance.data.gapSequences.length ? 'warning' : 'success'}
                label={
                  governance.data.gapSequences.length
                    ? `Gaps: ${governance.data.gapSequences.join(', ')}${governance.data.gapReportTruncated ? ' ...' : ''}`
                    : 'No sequence gaps'
                }
              />
              {governance.data.isExhausted && (
                <Chip size="small" color="error" label="Series exhausted" />
              )}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
