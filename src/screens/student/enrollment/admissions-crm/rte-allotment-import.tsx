'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { useRef, useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import CustomizableTable from 'src/components/customizabaleTable';
import { FactCheck, CheckCircle, CloudUpload } from '@mui/icons-material';
import { Chip, Alert, Paper, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';
import {
  AdmissionCrmRouteDefinitionStatus,
  useGetAdmissionCrmRouteDefinitionsQuery,
  type AdmissionCrmRteAllotmentImportRowDto,
  useImportAdmissionCrmRteAllotmentsMutation,
  usePreviewAdmissionCrmRteAllotmentsMutation,
  type AdmissionCrmRteAllotmentImportResultDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

type Props = {
  academicYearId: string;
};

const parseCsv = (value: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const next = value[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const valueAt = (record: Record<string, string>, ...keys: string[]) =>
  keys.map((key) => record[key.toLowerCase()]).find((value) => value) || '';

const toDate = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const mapRows = (
  csv: string,
  routeDefinitionId: string
): AdmissionCrmRteAllotmentImportRowDto[] => {
  const parsed = parseCsv(csv);
  if (parsed.length < 2) return [];
  const headers = parsed[0].map((header) => header.toLowerCase().replace(/\s+/g, ''));

  return parsed.slice(1).map((values) => {
    const record = Object.fromEntries(
      headers.map((header, index) => [header, values[index] || ''])
    );
    const evidence = valueAt(record, 'evidenceReferences', 'evidence', 'documents')
      .split(/[|;]/)
      .map((item) => item.trim())
      .filter(Boolean);
    return {
      leadId: valueAt(record, 'leadId') || null,
      applicantReference: valueAt(record, 'applicantReference', 'applicationNumber') || null,
      routeDefinitionId,
      routeData: {
        authoritativeReference:
          valueAt(record, 'authoritativeReference', 'authorityReference') || null,
        authorityName: valueAt(record, 'authorityName', 'authority') || null,
        allotmentNumber: valueAt(record, 'allotmentNumber', 'allotmentNo') || null,
        allotmentRound: valueAt(record, 'allotmentRound', 'round') || null,
        allottedCampus: valueAt(record, 'allottedCampus', 'campus') || null,
        allottedClass: valueAt(record, 'allottedClass', 'class') || null,
        admissionDeadline: toDate(valueAt(record, 'admissionDeadline', 'deadline')),
        parentAcceptanceDeadline: toDate(
          valueAt(record, 'parentAcceptanceDeadline', 'acceptanceDeadline')
        ),
        notes: valueAt(record, 'notes') || null,
      },
      evidenceReferences: evidence,
    };
  });
};

const readError = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.detail || data?.errorCode || 'The allotment import failed.';
  }
  return 'The allotment import failed.';
};

export function RteAllotmentImport({ academicYearId }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [routeDefinitionId, setRouteDefinitionId] = useState('');
  const [rows, setRows] = useState<AdmissionCrmRteAllotmentImportRowDto[]>([]);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<AdmissionCrmRteAllotmentImportResultDto>();
  const [preview, previewState] = usePreviewAdmissionCrmRteAllotmentsMutation();
  const [importRows, importState] = useImportAdmissionCrmRteAllotmentsMutation();
  const routesQuery = useGetAdmissionCrmRouteDefinitionsQuery(
    { academicYearId },
    {
      skip: !academicYearId,
    }
  );
  const publishedRteRoutes = useMemo(
    () =>
      (routesQuery.data || []).filter(
        (route) =>
          route.status === AdmissionCrmRouteDefinitionStatus.Published &&
          (route.code.toLowerCase().includes('rte') || route.name.toLowerCase().includes('rte'))
      ),
    [routesQuery.data]
  );
  const resultColumns = useMemo<IColumn[]>(
    () => [
      {
        id: 'applicantReference',
        label: 'Applicant reference',
        minWidth: 200,
        filterType: 'string',
        render: (value, row) => value || row.leadId || '-',
      },
      {
        id: 'allotmentNumber',
        label: 'Allotment',
        minWidth: 160,
        filterType: 'string',
        render: (value) => value || '-',
      },
      {
        id: 'success',
        label: 'Outcome',
        minWidth: 180,
        filterType: 'enum',
        enumOptions: [
          { value: true, label: 'Imported' },
          { value: false, label: 'Failed' },
        ],
        render: (value, row) => (
          <Chip
            size="small"
            color={value ? 'success' : 'error'}
            label={value ? 'Imported' : row.errorCode || 'Failed'}
          />
        ),
      },
    ],
    []
  );

  const loadFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setResult(undefined);
    try {
      const parsedRows = mapRows(await file.text(), routeDefinitionId);
      setRows(parsedRows);
      if (!parsedRows.length) shikshaMitraToast.error({ message: 'The CSV has no data rows.' });
    } catch {
      setRows([]);
      shikshaMitraToast.error({ message: 'Unable to read the CSV file.' });
    }
  };

  const run = async (commit: boolean) => {
    if (!routeDefinitionId) {
      shikshaMitraToast.error({ message: 'Select the published RTE route first.' });
      return;
    }
    if (!rows.length) {
      shikshaMitraToast.error({ message: 'Upload a CSV with at least one data row.' });
      return;
    }
    const request = { academicYearId, rows: rows.map((row) => ({ ...row, routeDefinitionId })) };
    try {
      const response = commit
        ? await importRows(request).unwrap()
        : await preview(request).unwrap();
      setResult(response);
      shikshaMitraToast.success({
        message: commit ? 'RTE allotment import completed.' : 'RTE allotment preview completed.',
      });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error) });
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography variant="subtitle2">RTE allotment import</Typography>
          <Chip
            size="small"
            label="Preview before commit"
            color="warning"
            variant="outlined"
            sx={{ color: 'warning.darker', borderColor: 'warning.darker' }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Upload a CSV from the applicable authority export. Supported columns include
          applicantReference, leadId, allotmentNumber, allotmentRound, authorityName,
          admissionDeadline, allottedClass, allottedCampus, evidenceReferences, and notes.
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <TextField
            select
            size="small"
            fullWidth
            label="Published RTE route"
            value={routeDefinitionId}
            onChange={(event) => {
              setRouteDefinitionId(event.target.value);
              setRows((current) =>
                current.map((row) => ({ ...row, routeDefinitionId: event.target.value }))
              );
              setResult(undefined);
            }}
          >
            {publishedRteRoutes.map((route) => (
              <MenuItem key={route.id} value={route.id}>
                {route.name} v{route.version}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInput.current?.click()}
          >
            Choose CSV
          </Button>
          <input
            ref={fileInput}
            hidden
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => loadFile(event.target.files?.[0])}
          />
          <Typography variant="caption" sx={{ minWidth: 150 }}>
            {fileName || 'No file selected'}
          </Typography>
        </Stack>
        {rows.length > 0 ? (
          <Alert severity="info">
            {rows.length} allotment row(s) parsed and ready for validation.
          </Alert>
        ) : null}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <LoadingButton
            startIcon={<FactCheck />}
            loading={previewState.isLoading}
            disabled={!routeDefinitionId || !rows.length}
            onClick={() => run(false)}
          >
            Validate preview
          </LoadingButton>
          <LoadingButton
            variant="contained"
            startIcon={<CheckCircle />}
            loading={importState.isLoading}
            disabled={!routeDefinitionId || !rows.length || !result}
            onClick={() => run(true)}
          >
            Commit allotments
          </LoadingButton>
        </Stack>
        {result ? (
          <Stack spacing={1}>
            <Alert severity={result.failed > 0 ? 'warning' : 'success'}>
              {result.succeeded} succeeded, {result.failed} failed.
            </Alert>
            <CustomizableTable
              tableId="student-enrollment-rte-import-results"
              tableTitle="RTE Allotment Import Results"
              columns={resultColumns}
              data={result.items}
              isSearch={false}
              isPagination={false}
              isShowedDense={false}
              tableContainerProps={{ sx: { minHeight: 220 } }}
            />
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
