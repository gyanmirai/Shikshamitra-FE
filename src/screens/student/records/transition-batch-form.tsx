import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type {
  RecordsOutcome,
  StudentDirectoryItem,
} from 'src/redux/student/records/student-records-types';
import type {
  TransitionRow,
  TransitionPreview,
} from 'src/redux/student/records/student-record-transitions-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { getIn, useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Alert, Stack, Button, TextField, Typography } from '@mui/material';
import {
  useGetStudentRecordTransitionOptionsQuery,
  useSubmitStudentRecordTransitionsMutation,
  usePreviewStudentRecordTransitionsMutation,
} from 'src/redux/student/records/student-record-transitions-api';

import { recordOutcomes } from './records-settings-model';
import RecordsStudentPicker from './records-student-picker';
import RollAssignmentControl from './roll-assignment-control';

type BatchDraftRow = TransitionRow & {
  studentName: string;
  schoolRollMode?: 'manual' | 'automatic' | 'both';
};
const getPayloadRows = (rows: BatchDraftRow[]): TransitionRow[] =>
  rows.map(({ studentName: _studentName, schoolRollMode: _schoolRollMode, ...row }) => ({
    ...row,
    rollAssignmentMode: ['Promote', 'Repeat'].includes(row.outcome)
      ? row.rollAssignmentMode
      : undefined,
    rollNumber: ['Promote', 'Repeat'].includes(row.outcome) ? row.rollNumber : undefined,
    targetAcademicYearId: row.targetAcademicYearId || undefined,
    targetStandardId: row.targetStandardId || undefined,
    targetDivisionId: row.targetDivisionId || undefined,
  }));
const batchSchema = Yup.object({
  academicYearId: Yup.string().required('Choose the source academic year.'),
  items: Yup.array()
    .min(1, 'Add at least one student.')
    .max(100)
    .of(
      Yup.object({
        studentId: Yup.string().required(),
        outcome: Yup.string().oneOf(recordOutcomes).required(),
        rollAssignmentMode: Yup.string()
          .oneOf(['manual', 'automatic'])
          .test(
            'school-numbering-rule',
            'Use the school numbering method.',
            (value, { parent }) =>
              !['Promote', 'Repeat'].includes(parent.outcome) ||
              !parent.schoolRollMode ||
              parent.schoolRollMode === 'both' ||
              value === parent.schoolRollMode
          )
          .when(['schoolRollMode', 'outcome'], {
            is: (schoolMode: string, outcome: string) =>
              schoolMode === 'both' && ['Promote', 'Repeat'].includes(outcome),
            then: (field) => field.required('Choose manual or automatic roll numbering.'),
          }),
        rollNumber: Yup.number()
          .nullable()
          .when(['rollAssignmentMode', 'outcome'], {
            is: (mode: string, outcome: string) =>
              mode === 'manual' && ['Promote', 'Repeat'].includes(outcome),
            then: (field) =>
              field
                .required('Enter the target roll number.')
                .integer('Enter a whole number.')
                .min(1, 'Enter a positive roll number.'),
          }),
        reason: Yup.string()
          .trim()
          .min(3, 'Explain the transition.')
          .max(1000)
          .required('Enter a reason.'),
        effectiveDate: Yup.string().required('Choose an effective date.'),
        targetAcademicYearId: Yup.string().when('outcome', {
          is: (value: string) => ['Promote', 'Repeat'].includes(value),
          then: (field) => field.required('Choose the target academic year.'),
        }),
        targetStandardId: Yup.string().when('outcome', {
          is: (value: string) => ['Promote', 'Repeat'].includes(value),
          then: (field) => field.required('Choose the target class.'),
        }),
        targetDivisionId: Yup.string().when('outcome', {
          is: (value: string) => ['Promote', 'Repeat'].includes(value),
          then: (field) => field.required('Choose the target division.'),
        }),
      })
    ),
});

function TargetPlacement({
  item,
  path,
  form,
  proposal,
  disabled,
}: {
  item: BatchDraftRow;
  path: string;
  form: FormikProps<{ academicYearId: string; items: BatchDraftRow[] }>;
  proposal?: number | null;
  disabled: boolean;
}) {
  const options = useGetStudentRecordTransitionOptionsQuery(
    { academicYearId: item.targetAcademicYearId },
    { skip: !item.targetAcademicYearId }
  );
  const select = (key: string, value: unknown) => form.setFieldValue(`${path}.${key}`, value);
  const schoolMode = options.isError ? undefined : options.currentData?.rollAssignmentMode;
  const setValue = form.setFieldValue;
  useEffect(() => {
    if (schoolMode && schoolMode !== item.schoolRollMode)
      setValue(`${path}.schoolRollMode`, schoolMode);
    if (schoolMode && schoolMode !== 'both' && !item.rollAssignmentMode)
      setValue(`${path}.rollAssignmentMode`, schoolMode === 'automatic' ? 'automatic' : 'manual');
  }, [schoolMode, item.schoolRollMode, item.rollAssignmentMode, setValue, path]);
  return (
    <Stack spacing={1.5}>
      {options.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => options.refetch()}>
              Retry
            </Button>
          }
        >
          Target-year placements could not be loaded.
        </Alert>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        <CustomSelect
          label="Target class"
          value={item.targetStandardId ?? ''}
          options={(options.currentData?.standards ?? []).map((option) => ({
            value: option.id,
            label: option.name,
          }))}
          onChange={(value) => {
            select('targetStandardId', value);
            select('targetDivisionId', '');
          }}
          disabled={disabled || !item.targetAcademicYearId || options.isFetching}
          error={Boolean(
            getIn(form.touched, `${path}.targetStandardId`) &&
            getIn(form.errors, `${path}.targetStandardId`)
          )}
          helperText={
            getIn(form.touched, `${path}.targetStandardId`)
              ? getIn(form.errors, `${path}.targetStandardId`)
              : undefined
          }
        />
        <CustomSelect
          label="Target division"
          value={item.targetDivisionId ?? ''}
          options={(options.currentData?.divisions ?? [])
            .filter((option) => option.parentId === item.targetStandardId)
            .map((option) => ({ value: option.id, label: option.name }))}
          onChange={(value) => select('targetDivisionId', value)}
          disabled={disabled || !item.targetStandardId || options.isFetching}
          error={Boolean(
            getIn(form.touched, `${path}.targetDivisionId`) &&
            getIn(form.errors, `${path}.targetDivisionId`)
          )}
          helperText={
            getIn(form.touched, `${path}.targetDivisionId`)
              ? getIn(form.errors, `${path}.targetDivisionId`)
              : undefined
          }
        />
      </Box>
      <RollAssignmentControl
        schoolMode={schoolMode}
        mode={item.rollAssignmentMode}
        number={item.rollNumber}
        proposal={proposal}
        disabled={disabled || options.isFetching || options.isError}
        error={
          getIn(form.touched, `${path}.rollAssignmentMode`)
            ? getIn(form.errors, `${path}.rollAssignmentMode`)
            : undefined
        }
        numberError={
          getIn(form.touched, `${path}.rollNumber`)
            ? getIn(form.errors, `${path}.rollNumber`)
            : undefined
        }
        onModeChange={(mode) => {
          select('rollAssignmentMode', mode);
          select('rollNumber', null);
        }}
        onNumberChange={(number) => select('rollNumber', number)}
      />
    </Stack>
  );
}

export default function TransitionBatchForm({ onSubmitted }: { onSubmitted: () => void }) {
  const router = useRouter();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const options = useGetStudentRecordTransitionOptionsQuery({});
  const [preview, setPreview] = useState<{ data: TransitionPreview; signature: string } | null>(
    null
  );
  const [failure, setFailure] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [previewBatch, previewState] = usePreviewStudentRecordTransitionsMutation();
  const [submitBatch, submitState] = useSubmitStudentRecordTransitionsMutation();
  const busy = previewState.isLoading || submitState.isLoading;
  const form = useFormik<{ academicYearId: string; items: BatchDraftRow[] }>({
    initialValues: { academicYearId: currentYear?.id ?? '', items: [] },
    validationSchema: batchSchema,
    onSubmit: async (values) => {
      if (preview?.signature !== JSON.stringify(values) || !preview.data.canSubmit) return;
      if (
        preview.data.items.some(
          (row) =>
            row.ready &&
            row.rollAssignmentMode === 'automatic' &&
            (!Number.isInteger(row.proposedRollNumber) || Number(row.proposedRollNumber) <= 0)
        )
      )
        return;
      setFailure(null);
      try {
        const result = await submitBatch({
          academicYearId: values.academicYearId,
          idempotencyKey,
          items: getPayloadRows(values.items).map((row) => ({
            ...row,
            rollAssignmentMode: ['Promote', 'Repeat'].includes(row.outcome)
              ? (preview.data.items.find((item) => item.studentId === row.studentId)
                  ?.rollAssignmentMode ?? row.rollAssignmentMode)
              : undefined,
            rollNumber:
              preview.data.items.find((item) => item.studentId === row.studentId)
                ?.rollAssignmentMode === 'automatic'
                ? preview.data.items.find((item) => item.studentId === row.studentId)
                    ?.proposedRollNumber
                : row.rollNumber,
            studentConcurrencyStamp: preview.data.items.find(
              (item) => item.studentId === row.studentId
            )?.studentConcurrencyStamp,
            enrollmentConcurrencyStamp: preview.data.items.find(
              (item) => item.studentId === row.studentId
            )?.enrollmentConcurrencyStamp,
          })),
        }).unwrap();
        const exceptions = new Set(result.exceptions.map((item) => item.studentId));
        form.resetForm({
          values: {
            ...values,
            items: values.items.filter((item) => exceptions.has(item.studentId)),
          },
        });
        setPreview(null);
        shikshaMitraToast.success({
          message: `${result.items.length} transitions submitted${result.exceptions.length ? `; ${result.exceptions.length} exceptions remain` : ''}.`,
        });
        if (result.exceptions.length)
          setFailure(
            'The eligible rows were submitted. Resolve the remaining student exceptions and preview again.'
          );
        else onSubmitted();
      } catch (error) {
        if (
          (error as { data?: { error?: { code?: string } } })?.data?.error?.code ===
          'Students:Records:RollProposalChanged'
        )
          setPreview(null);
        setFailure(
          'The batch could not be submitted. Records or policy may have changed since preview. Preview again before retrying.'
        );
      }
    },
  });
  const guard = useUnsavedNavigation(form.dirty || form.values.items.length > 0, {
    push: router.push,
  });
  const signature = JSON.stringify(form.values);
  const addStudent = (student: StudentDirectoryItem | null) => {
    if (!student) return;
    if (form.values.items.some((item) => item.studentId === student.studentId)) {
      setFailure('This student is already in the batch.');
      return;
    }
    if (form.values.items.length >= 100) {
      setFailure('A batch supports up to 100 students.');
      return;
    }
    form.setFieldValue('items', [
      ...form.values.items,
      {
        studentId: student.studentId,
        studentName:
          [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
          'Restricted identity',
        outcome: 'Promote',
        effectiveDate: dayjs().format('YYYY-MM-DD'),
        reason: '',
        targetAcademicYearId: '',
        targetStandardId: '',
        targetDivisionId: '',
      },
    ]);
    setFailure(null);
  };
  const runPreview = async () => {
    const errors = await form.validateForm();
    if (Object.keys(errors).length) {
      await form.submitForm();
      setFailure('Review the highlighted student rows before previewing.');
      return;
    }
    setFailure(null);
    try {
      const result = await previewBatch({
        academicYearId: form.values.academicYearId,
        items: getPayloadRows(form.values.items),
      }).unwrap();
      setPreview({ data: result, signature });
      setIdempotencyKey(crypto.randomUUID());
    } catch {
      setPreview(null);
      setFailure(
        'The batch preview could not be prepared. Review the selected students and target placements, then retry.'
      );
    }
  };
  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Preview every student before submitting. The school policy controls required checks and
        whether exceptions hold the whole batch.
      </Alert>
      {failure && <Alert severity="warning">{failure}</Alert>}
      {options.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => options.refetch()}>
              Retry
            </Button>
          }
        >
          Academic-year choices could not be loaded.
        </Alert>
      )}
      <CustomSelect
        label="Source academic year"
        value={form.values.academicYearId}
        options={(options.currentData?.academicYears ?? []).map((year) => ({
          value: year.id,
          label: year.name,
        }))}
        onChange={(value) => form.setFieldValue('academicYearId', String(value))}
        disabled={busy}
        isLoading={options.isLoading}
      />
      <RecordsStudentPicker
        onSelect={addStudent}
        disabled={busy || form.values.items.length >= 100}
      />
      {form.values.items.map((item, index) => {
        const path = `items.${index}`;
        return (
          <FormSectionCard
            key={item.studentId}
            icon="mdi:account-arrow-right-outline"
            title={item.studentName}
            action={
              <Button
                color="error"
                disabled={busy}
                onClick={() =>
                  form.setFieldValue(
                    'items',
                    form.values.items.filter((_item, position) => position !== index)
                  )
                }
              >
                Remove
              </Button>
            }
          >
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}
            >
              <CustomSelect
                label="Outcome"
                value={item.outcome}
                options={recordOutcomes
                  .filter((value) => value !== 'Return')
                  .map((value) => ({ value, label: value }))}
                onChange={(value) => form.setFieldValue(`${path}.outcome`, value as RecordsOutcome)}
                disabled={busy}
              />
              <TextField
                type="date"
                label="Effective date"
                name={`${path}.effectiveDate`}
                value={item.effectiveDate}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={busy}
              />
            </Box>
            <TextField
              label="Reason"
              name={`${path}.reason`}
              value={item.reason}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={Boolean(
                getIn(form.touched, `${path}.reason`) && getIn(form.errors, `${path}.reason`)
              )}
              helperText={
                getIn(form.touched, `${path}.reason`)
                  ? getIn(form.errors, `${path}.reason`)
                  : undefined
              }
              disabled={busy}
            />
            {['Promote', 'Repeat'].includes(item.outcome) && (
              <>
                <CustomSelect
                  label="Target academic year"
                  value={item.targetAcademicYearId ?? ''}
                  options={(options.currentData?.academicYears ?? []).map((year) => ({
                    value: year.id,
                    label: year.name,
                  }))}
                  onChange={(value) => {
                    form.setFieldValue(`${path}.targetAcademicYearId`, value);
                    form.setFieldValue(`${path}.targetStandardId`, '');
                    form.setFieldValue(`${path}.targetDivisionId`, '');
                    form.setFieldValue(`${path}.rollAssignmentMode`, undefined);
                    form.setFieldValue(`${path}.schoolRollMode`, undefined);
                    form.setFieldValue(`${path}.rollNumber`, null);
                  }}
                  disabled={busy}
                  error={Boolean(
                    getIn(form.touched, `${path}.targetAcademicYearId`) &&
                    getIn(form.errors, `${path}.targetAcademicYearId`)
                  )}
                  helperText={
                    getIn(form.touched, `${path}.targetAcademicYearId`)
                      ? getIn(form.errors, `${path}.targetAcademicYearId`)
                      : undefined
                  }
                />
                <TargetPlacement
                  item={item}
                  path={path}
                  form={form}
                  disabled={busy}
                  proposal={
                    preview?.signature === signature
                      ? preview.data.items.find((row) => row.studentId === item.studentId)
                          ?.proposedRollNumber
                      : undefined
                  }
                />
              </>
            )}
          </FormSectionCard>
        );
      })}
      <Stack direction="row" spacing={1}>
        <Button
          loading={previewState.isLoading}
          disabled={busy || !form.values.items.length}
          onClick={runPreview}
        >
          Preview batch
        </Button>
        <Button
          variant="contained"
          loading={submitState.isLoading}
          disabled={
            busy ||
            preview?.signature !== signature ||
            !preview?.data.canSubmit ||
            preview.data.items.some(
              (row) =>
                row.ready &&
                row.rollAssignmentMode === 'automatic' &&
                (!Number.isInteger(row.proposedRollNumber) || Number(row.proposedRollNumber) <= 0)
            )
          }
          onClick={() => form.submitForm()}
        >
          Submit ready transitions
        </Button>
      </Stack>
      {preview && (
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">
            {preview.data.readyCount} ready · {preview.data.exceptionCount} exceptions
          </Typography>
          {preview.signature !== signature && (
            <Alert severity="info">The batch changed. Preview it again before submitting.</Alert>
          )}
          <CustomizableTable
            tableId="student-transition-preview"
            tableTitle="Batch preview"
            isSearch={false}
            isFilter={false}
            columns={[
              { id: 'studentName', label: 'Student' },
              { id: 'outcome', label: 'Outcome' },
              {
                id: 'rollAssignmentMode',
                label: 'Roll assignment',
                render: (value) =>
                  value === 'automatic' ? 'Automatic' : value === 'manual' ? 'Manual' : '—',
              },
              {
                id: 'proposedRollNumber',
                label: 'Proposed roll number',
                render: (value) => value ?? '—',
              },
              {
                id: 'ready',
                label: 'Readiness',
                render: (value) => (value ? 'Ready' : 'Needs attention'),
              },
              {
                id: 'issues',
                label: 'Checks',
                render: (value) =>
                  value.length
                    ? value.map((issue: { message: string }) => issue.message).join('; ')
                    : 'Checks passed',
              },
            ]}
            data={preview.data.items.map((row) => ({
              ...row,
              studentName:
                row.studentName ??
                form.values.items.find((item) => item.studentId === row.studentId)?.studentName,
            }))}
          />
        </Stack>
      )}
      {guard.confirmation}
    </Stack>
  );
}
