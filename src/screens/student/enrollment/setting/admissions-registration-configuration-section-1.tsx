'use client';

import CustomizableTable from 'src/components/customizabaleTable';

import { Add, Edit, Visibility, FormatListNumbered } from '@mui/icons-material';

import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';

import { useAdmissionsRegistrationWorkspace } from './admissions-registration-configuration-context';

export function AdmissionsRegistrationSection1() {
  const { state: controllerState, actions, meta } = useAdmissionsRegistrationWorkspace();
  const {
    academicYearId,
    canManageFormNumberSeries,
    canManageRegistrationTemplates,
    openBlankTemplate,
    openNewSeries,
    openNewTemplate,
    openSeries,
    seriesQuery,
    templateColumns,
    templatesQuery,
    view,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <Stack spacing={1.25} sx={{ flex: view === 'templates' ? 1 : undefined, minHeight: 0 }}>
        <Box>
          <Typography component="h2" variant="subtitle1">
            {view === 'templates' ? 'Registration Form Templates' : 'Form Numbering'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {view === 'templates'
              ? 'Published templates control the secure form, issue method, sections, and family-facing content.'
              : 'Number series give every issued form a clear, traceable reference.'}
          </Typography>
        </Box>

        {(view === 'templates' && templatesQuery.isError) ||
        (view === 'numbering' && seriesQuery.isError) ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  if (view === 'templates') templatesQuery.refetch();
                  else seriesQuery.refetch();
                }}
              >
                Retry
              </Button>
            }
          >
            Registration configuration could not be loaded.
          </Alert>
        ) : null}

        {view === 'templates' && !templatesQuery.isError ? (
          <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
            {canManageRegistrationTemplates ? (
              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button
                  size="small"
                  startIcon={<Add />}
                  disabled={!academicYearId}
                  onClick={openBlankTemplate}
                >
                  Blank Template
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Add />}
                  disabled={!academicYearId}
                  onClick={openNewTemplate}
                >
                  Use Starter Template
                </Button>
              </Stack>
            ) : null}
            {templatesQuery.isFetching ? <LinearProgress /> : null}
            <CustomizableTable
              tableId="student-enrollment-registration-templates"
              tableTitle="Registration Templates"
              columns={templateColumns}
              data={templatesQuery.data?.items || []}
              isLoading={templatesQuery.isFetching}
              defaultRowsPerPage={10}
              noDataText="No registration templates configured. Create one to issue secure registration links."
              wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
              tableContainerProps={{ sx: { height: '100%', minHeight: 0 } }}
            />
          </Stack>
        ) : null}

        {view === 'numbering' && !seriesQuery.isError ? (
          <Stack spacing={1.25}>
            {canManageFormNumberSeries ? (
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<FormatListNumbered />}
                  disabled={!academicYearId}
                  onClick={openNewSeries}
                >
                  New Series
                </Button>
              </Stack>
            ) : null}
            {seriesQuery.isFetching ? <LinearProgress /> : null}
            {(seriesQuery.data?.items || []).map((series) => (
              <Stack
                key={series.id}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                gap={1}
                sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
              >
                <Box>
                  <Typography variant="subtitle2">{series.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Next: {series.nextPreview}
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Chip
                    size="small"
                    label={series.isActive ? 'Active' : 'Inactive'}
                    color={series.isActive ? 'success' : 'default'}
                  />
                  <IconButton
                    size="small"
                    aria-label={
                      canManageFormNumberSeries
                        ? 'Edit form number series'
                        : 'View form number series'
                    }
                    onClick={() => openSeries(series)}
                  >
                    {canManageFormNumberSeries ? (
                      <Edit fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </>
  );
}
