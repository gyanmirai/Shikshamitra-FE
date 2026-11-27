'use client';

import type { AcademicYear } from 'src/types/school';
import type {
  AdmissionNumberPreview,
  PreviewAdmissionNumbering,
} from 'src/redux/student/admissions/admission-numbering-api';

import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Skeleton, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { numberingSchema } from './admission-numbering-model';

import type { NumberingFormValues } from './admission-numbering-model';

export function AdmissionNumberingPreview({
  values,
  academicYear,
  onPreview,
  beginNewSeries = false,
  requirePrefix = false,
}: {
  values: NumberingFormValues;
  academicYear?: AcademicYear;
  onPreview: (input: PreviewAdmissionNumbering) => Promise<AdmissionNumberPreview>;
  beginNewSeries?: boolean;
  requirePrefix?: boolean;
}) {
  const [result, setResult] = useState<AdmissionNumberPreview>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const missingSchoolPrefix = requirePrefix && !values.prefix.trim();
  const validFormat = numberingSchema.isValidSync(values);
  const valid = validFormat && !missingSchoolPrefix;
  const example = missingSchoolPrefix && validFormat
    ? `PREFIX${values.separator}${values.startingNumber.padStart(values.digits, '0')}`
    : undefined;
  const needsYear = values.yearFormat === 2 && !academicYear;
  const requestKey = JSON.stringify({
    ...values,
    academicYearId: academicYear?.id,
    beginNewSeries,
  });
  useEffect(() => {
    let active = true;
    setResult(undefined);
    setError('');
    setLoading(valid && !needsYear);
    if (!valid || needsYear) return undefined;
    const timer = setTimeout(async () => {
      const draft = JSON.parse(requestKey);
      try {
        const next = await onPreview({
          ...draft,
          prefix: draft.prefix.trim().toUpperCase(),
          suffix: draft.suffix.trim().toUpperCase(),
          startingNumber: Number(draft.startingNumber),
        });
        if (active) setResult(next);
      } catch (failure) {
        if (active)
          setError(
            parseApiProblemDetail(failure).detail || 'Unable to load the next application number.'
          );
      } finally {
        if (active) setLoading(false);
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [requestKey, valid, needsYear, onPreview, refresh]);

  return (
    <Stack spacing={0.5} aria-busy={loading}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={0.5} flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">
          {example ? 'Format Example' : 'Next Available Number'}
          {values.yearFormat === 2 && academicYear ? ` · ${academicYear.name}` : ''}
        </Typography>
        {valid && !needsYear && !error && (
          <Button
            size="small"
            disabled={loading}
            startIcon={<Iconify icon="mdi:refresh" />}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            onClick={() => setRefresh((value) => value + 1)}
          >
            Refresh Preview
          </Button>
        )}
      </Stack>
      {needsYear ? (
        <Typography variant="body2">
          Select an academic year on the page to preview this format.
        </Typography>
      ) : example ? (
        <>
          <Typography variant="h6" sx={{ overflowWrap: 'anywhere', fontFamily: 'monospace' }}>
            {example}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Enter your school prefix to see the next available number.
          </Typography>
        </>
      ) : !valid ? (
        <Typography variant="body2">
          Complete the numbering fields to preview the next number.
        </Typography>
      ) : loading ? (
        <Skeleton width="75%" height={32} />
      ) : error ? (
        <StudentFeedback notificationKey="STU-0108" presentation="toast" severity="error">
          <Stack spacing={1}>
            <span>{error}</span>
            <Button size="small" onClick={() => setRefresh((value) => value + 1)}>
              Retry Preview
            </Button>
          </Stack>
        </StudentFeedback>
      ) : (
        <>
          <Typography
            component="output"
            aria-live="polite"
            variant="h6"
            sx={{ overflowWrap: 'anywhere', fontFamily: 'monospace' }}
          >
            {result?.nextNumber}
          </Typography>
          {beginNewSeries && result?.startingNumberUnavailable && (
            <Typography variant="body2" color="text.secondary">
              The starting number is already in use. The next available number is shown above.
            </Typography>
          )}
        </>
      )}
    </Stack>
  );
}
