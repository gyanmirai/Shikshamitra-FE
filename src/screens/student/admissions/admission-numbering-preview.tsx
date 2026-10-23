'use client';

import type { AcademicYear } from 'src/types/school';
import type {
  AdmissionNumberPreview,
  PreviewAdmissionNumbering,
} from 'src/redux/student/admissions/admission-numbering-api';

import { useState, useEffect } from 'react';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Skeleton, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { numberingSchema } from './admission-numbering-model';

import type { NumberingFormValues } from './admission-numbering-model';

export function AdmissionNumberingPreview({
  values,
  academicYear,
  onPreview,
}: {
  values: NumberingFormValues;
  academicYear?: AcademicYear;
  onPreview: (input: PreviewAdmissionNumbering) => Promise<AdmissionNumberPreview>;
}) {
  const [result, setResult] = useState<AdmissionNumberPreview>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const valid = numberingSchema.isValidSync(values);
  const needsYear = values.yearFormat === 2 && !academicYear;
  const requestKey = JSON.stringify({ ...values, academicYearId: academicYear?.id });
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
      <Typography variant="caption" color="text.secondary">
        Next application number{academicYear ? ` · ${academicYear.name}` : ''}
      </Typography>
      {needsYear ? (
        <Typography variant="body2">
          Select an academic year on the page to preview this format.
        </Typography>
      ) : !valid ? (
        <Typography variant="body2">
          Complete the numbering fields to preview the next number.
        </Typography>
      ) : loading ? (
        <Skeleton width="75%" height={32} />
      ) : error ? (
        <StudentFeedback
          notificationKey="STU-0108"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" onClick={() => setRefresh((value) => value + 1)}>
              Retry preview
            </Button>
          }
        >
          {error}
        </StudentFeedback>
      ) : (
        <Typography
          component="output"
          aria-live="polite"
          variant="h6"
          sx={{ overflowWrap: 'anywhere', fontFamily: 'monospace' }}
        >
          {result?.nextNumber}
        </Typography>
      )}
      {valid && !needsYear && !error && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Not reserved · May change with new registrations
          </Typography>
          <Button
            size="small"
            disabled={loading}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            onClick={() => setRefresh((value) => value + 1)}
          >
            Refresh preview
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
