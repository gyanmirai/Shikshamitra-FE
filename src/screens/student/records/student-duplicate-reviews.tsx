import type { RootState } from 'src/redux/store';
import type { StudentDuplicateReview } from 'src/redux/student/records/student-record-duplicates-api';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Alert, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useFlagStudentDuplicateMutation,
  useResolveStudentDuplicateMutation,
  useGetStudentDuplicateReviewsQuery,
} from 'src/redux/student/records/student-record-duplicates-api';

import RecordsStudentPicker from './records-student-picker';

export default function StudentDuplicateReviews({
  studentId,
  status,
  page,
  onPage,
  onStatus,
}: {
  studentId?: string;
  status?: string;
  page: number;
  onPage: (page: number) => void;
  onStatus: (status: string) => void;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(permissions, 'Students.Records.Changes.Create');
  const canApprove = hasGrantedPermission(permissions, 'Students.Records.Changes.Approve');
  const list = useGetStudentDuplicateReviewsQuery({
    studentId,
    status,
    skipCount: page * 25,
    maxResultCount: 25,
  });
  const [create, setCreate] = useState(false);
  const [selected, setSelected] = useState<StudentDuplicateReview | null>(null);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 1.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
        <Typography variant="body2">
          Flag profiles for separate review. Confirming a duplicate preserves both permanent
          profiles.
        </Typography>
        {canCreate && (
          <Button variant="outlined" onClick={() => setCreate(true)}>
            Flag duplicate profiles
          </Button>
        )}
      </Stack>
      <CustomSelect
        label="Duplicate review status"
        value={status ?? ''}
        options={[
          { value: '', label: 'All reviews' },
          { value: 'Open', label: 'Open' },
          { value: 'ConfirmedDuplicate', label: 'Confirmed duplicate' },
          { value: 'NotDuplicate', label: 'Different students' },
        ]}
        onChange={(value) => onStatus(String(value))}
      />
      {list.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => list.refetch()}>
              Retry
            </Button>
          }
        >
          Duplicate reviews could not be loaded.
        </Alert>
      )}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="student-record-duplicate-reviews"
          tableTitle="Duplicate profile reviews"
          data={list.currentData?.items ?? []}
          totalCount={list.currentData?.totalCount ?? 0}
          isLoading={list.isLoading}
          serverSidePagination
          page={page}
          rowsPerPage={25}
          rowsPerPageOptions={[25]}
          onServerPagination={onPage}
          isSearch={false}
          isFilter={false}
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={[
            { id: 'studentName', label: 'Student profile' },
            { id: 'otherStudentName', label: 'Possible duplicate profile' },
            { id: 'reason', label: 'Flag reason' },
            {
              id: 'status',
              label: 'Status',
              render: (value) => (
                <Label
                  color={
                    value === 'ConfirmedDuplicate'
                      ? 'warning'
                      : value === 'NotDuplicate'
                        ? 'success'
                        : 'default'
                  }
                >
                  {value.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
              ),
            },
            { id: 'reviewReason', label: 'Review reason' },
            { id: 'creationTime', label: 'Flagged', render: (value) => fDateTime(value) },
            {
              id: 'action',
              label: 'Action',
              sticky: true,
              stickyPosition: 'right',
              excludeFromExport: true,
              render: (_value, row) =>
                row.canReview && canApprove ? (
                  <Button onClick={() => setSelected(row as StudentDuplicateReview)}>Review</Button>
                ) : (
                  '—'
                ),
            },
          ]}
          noDataText="No duplicate reviews match this view."
        />
      </Box>
      {create && <FlagDuplicateForm onClose={() => setCreate(false)} />}
      {selected && <ResolveDuplicateForm review={selected} onClose={() => setSelected(null)} />}
    </Box>
  );
}

function FlagDuplicateForm({ onClose }: { onClose: () => void }) {
  const [failure, setFailure] = useState<string | null>(null);
  const [flag, state] = useFlagStudentDuplicateMutation();
  const form = useFormik({
    initialValues: { studentId: '', otherStudentId: '', reason: '' },
    validationSchema: Yup.object({
      studentId: Yup.string().required('Choose the first profile.'),
      otherStudentId: Yup.string()
        .required('Choose the other profile.')
        .notOneOf([Yup.ref('studentId')], 'Choose two different profiles.'),
      reason: Yup.string()
        .trim()
        .min(5)
        .max(2000)
        .required('Explain why these may be the same student.'),
    }),
    onSubmit: async (values) => {
      setFailure(null);
      try {
        await flag({ ...values, reason: values.reason.trim() }).unwrap();
        shikshaMitraToast.success({ message: 'Profiles flagged for separate review.' });
        onClose();
      } catch {
        setFailure(
          'The profiles could not be flagged. Check that both profiles are in your scope and that an open flag does not already exist.'
        );
      }
    },
  });
  return (
    <CustomDialog
      open
      title="Flag possible duplicate profiles"
      handleClose={onClose}
      hasForm
      onSubmit={(event) => {
        event.preventDefault();
        form.submitForm();
      }}
      hasUnsavedChanges={form.dirty}
      disableClose={state.isLoading}
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {failure && <Alert severity="error">{failure}</Alert>}
          <Typography variant="subtitle2">First permanent profile</Typography>
          <RecordsStudentPicker
            selectedId={form.values.studentId}
            onSelect={(student) => form.setFieldValue('studentId', student?.studentId ?? '')}
            disabled={state.isLoading}
          />
          <Typography variant="subtitle2">Possible duplicate profile</Typography>
          <RecordsStudentPicker
            selectedId={form.values.otherStudentId}
            onSelect={(student) => form.setFieldValue('otherStudentId', student?.studentId ?? '')}
            disabled={state.isLoading}
          />
          {form.touched.otherStudentId && form.errors.otherStudentId && (
            <Alert severity="error">{form.errors.otherStudentId}</Alert>
          )}
          <TextField
            label="Reason for flag"
            name="reason"
            value={form.values.reason}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            multiline
            minRows={2}
            error={Boolean(form.touched.reason && form.errors.reason)}
            helperText={form.touched.reason ? form.errors.reason : undefined}
            disabled={state.isLoading}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button disabled={state.isLoading} onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={state.isLoading}>
          Flag for review
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

function ResolveDuplicateForm({
  review,
  onClose,
}: {
  review: StudentDuplicateReview;
  onClose: () => void;
}) {
  const [failure, setFailure] = useState<string | null>(null);
  const [resolve, state] = useResolveStudentDuplicateMutation();
  const form = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string().trim().min(5).max(2000).required('Explain the review result.'),
    }),
    onSubmit: async () => undefined,
  });
  const submit = async (confirmedDuplicate: boolean) => {
    const errors = await form.validateForm();
    form.setFieldTouched('reason', true, false);
    if (Object.keys(errors).length) return;
    setFailure(null);
    try {
      await resolve({
        id: review.id,
        concurrencyStamp: review.concurrencyStamp,
        reason: form.values.reason.trim(),
        confirmedDuplicate,
      }).unwrap();
      shikshaMitraToast.success({
        message: confirmedDuplicate
          ? 'Duplicate confirmed. Both profiles remain preserved.'
          : 'Profiles marked as different students.',
      });
      onClose();
    } catch {
      setFailure(
        'The review could not be recorded. Another reviewer may have updated it. Close and reload the list; your reason is still shown.'
      );
    }
  };
  return (
    <CustomDialog
      open
      title="Review duplicate profiles"
      handleClose={onClose}
      hasForm={false}
      hasUnsavedChanges={form.dirty}
      disableClose={state.isLoading}
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Typography variant="subtitle2">
            {review.studentName} · {review.otherStudentName}
          </Typography>
          <Typography variant="body2">{review.reason}</Typography>
          {failure && <Alert severity="error">{failure}</Alert>}
          <TextField
            label="Review reason"
            name="reason"
            value={form.values.reason}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            multiline
            minRows={2}
            error={Boolean(form.touched.reason && form.errors.reason)}
            helperText={form.touched.reason ? form.errors.reason : undefined}
            disabled={state.isLoading}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button disabled={state.isLoading} onClick={onClose}>
          Close
        </Button>
        <Button disabled={state.isLoading} onClick={() => submit(false)}>
          Different students
        </Button>
        <Button variant="contained" loading={state.isLoading} onClick={() => submit(true)}>
          Confirm duplicate
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
