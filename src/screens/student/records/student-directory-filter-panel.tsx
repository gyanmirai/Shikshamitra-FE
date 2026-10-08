import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Stack, Alert, Button, Typography } from '@mui/material';
import { useGetStudentRecordsDirectoryOptionsQuery } from 'src/redux/student/records/student-records-api';

import StudentDirectoryFilterFields from './student-directory-filter-fields';

import type { DirectoryFilters } from './student-directory-filter-fields';

type Props = {
  values: DirectoryFilters;
  academicYearId: string;
  onApply: (values: DirectoryFilters) => void;
};

export default function StudentDirectoryFilterPanel({
  values,
  academicYearId,
  onApply,
  onClose,
}: Props & { onClose: () => void }) {
  const [draft, setDraft] = useState(values);
  const options = useGetStudentRecordsDirectoryOptionsQuery({
    academicYearId: academicYearId || undefined,
  });

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography id="student-directory-filter-title" variant="subtitle1">
          Filter students
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon="solar:restart-bold" width={16} />}
          onClick={() =>
            setDraft({
              board: '',
              medium: '',
              class: '',
              division: '',
            })
          }
        >
          Reset Defaults
        </Button>
      </Stack>
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', py: 1 }}>
        {options.isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => options.refetch()}>
                Retry filters
              </Button>
            }
          >
            Academic filter choices could not be loaded. The current view is preserved.
          </Alert>
        )}
        <StudentDirectoryFilterFields
          values={draft}
          options={options.currentData}
          isLoading={options.isFetching}
          onChange={(changes) => setDraft((previous) => ({ ...previous, ...changes }))}
        />
      </Stack>
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          Apply Filters
        </Button>
      </Stack>
    </>
  );
}
