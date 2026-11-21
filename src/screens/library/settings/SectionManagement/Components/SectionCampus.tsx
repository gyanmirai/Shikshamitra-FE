'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { DetailField } from 'src/components/detail-view';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, TextField, Autocomplete } from '@mui/material';
import {
  useBindLibrarySectionCampusMutation,
  useGetLibrarySectionCampusOptionsQuery,
} from 'src/redux/library/settingApi';

export default function SectionCampus({
  sectionId,
  academicYearId,
  campusId,
  campusName,
}: {
  sectionId: string;
  academicYearId: string;
  campusId: string | null;
  campusName?: string | null;
}) {
  const auth = useSelector((state: RootState) => state.auth);
  const canBind = Boolean(
    auth?.permissionsInitialized &&
    !auth.loading &&
    hasGrantedPermission(auth.permissions, 'Library.Settings.SectionManagement.View') &&
    hasGrantedPermission(auth.permissions, 'Library.Settings.SectionManagement.Add')
  );
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<{ campusId: string; campusName: string | null }>();
  const [error, setError] = useState<string>();
  const [bindCampus, { isLoading }] = useBindLibrarySectionCampusMutation();
  const options = useGetLibrarySectionCampusOptionsQuery(
    { academicYearId },
    { skip: !open || !canBind || Boolean(campusId || saved) }
  );
  const available = options.isError ? [] : (options.currentData ?? []);
  const formik = useFormik({
    initialValues: { campusId: '' },
    validationSchema: Yup.object({
      campusId: Yup.string()
        .required('Choose a campus.')
        .test('available', 'Choose an active campus.', (id) =>
          available.some((campus) => campus.id === id)
        ),
    }),
    onSubmit: ({ campusId: chosenId }) => save(chosenId),
  });
  const selected = available.find((campus) => campus.id === formik.values.campusId) ?? null;
  const bound = campusId || saved?.campusId;
  const canSave = Boolean(selected && available.some((campus) => campus.id === selected.id));

  const close = () => {
    setOpen(false);
    formik.resetForm();
    setError(undefined);
  };

  const save = async (chosenId: string) => {
    if (!selected || !canBind || !canSave || isLoading || bound) return;
    setError(undefined);
    try {
      setSaved(await bindCampus({ sectionId, academicYearId, campusId: chosenId }).unwrap());
      close();
    } catch (problem) {
      setError(parseApiProblemDetail(problem).detail || 'Could not assign this campus.');
    }
  };

  return (
    <Stack spacing={1.5} alignItems="flex-start" sx={{ mt: 2 }}>
      <DetailField
        label="Campus"
        value={bound ? campusName || saved?.campusName || 'Campus name unavailable' : 'Unassigned'}
      />
      {canBind && !bound && !open && (
        <Button size="small" variant="outlined" onClick={() => setOpen(true)}>
          Assign campus
        </Button>
      )}
      {canBind && !bound && open && (
        <Stack spacing={1.5} sx={{ width: 1 }}>
          {options.isError ? (
            <Alert
              severity="error"
              action={<Button onClick={() => options.refetch()}>Retry</Button>}
            >
              {parseApiProblemDetail(options.error).detail ||
                'Could not load campus options. Assigning a campus requires school-wide access.'}
            </Alert>
          ) : (
            <Autocomplete
              options={available}
              value={selected}
              onChange={(_event, option) => formik.setFieldValue('campusId', option?.id ?? '')}
              onBlur={() => formik.setFieldTouched('campusId', true)}
              getOptionLabel={(campus) => `${campus.name} (${campus.code})`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={options.isFetching}
              disabled={isLoading}
              noOptionsText="No active campuses are configured"
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="campusId"
                  label="Campus"
                  error={Boolean(formik.touched.campusId && formik.errors.campusId)}
                  helperText={formik.touched.campusId ? formik.errors.campusId : undefined}
                />
              )}
            />
          )}
          {selected && !options.isError && (
            <Alert severity="info">
              Confirm the campus that physically owns this section and its shelves.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={close} disabled={isLoading}>
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              onClick={() => formik.submitForm()}
              loading={isLoading}
              disabled={!canSave || options.isFetching}
            >
              Confirm campus
            </LoadingButton>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
