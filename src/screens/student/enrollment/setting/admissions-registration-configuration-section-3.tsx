'use client';

import { LoadingButton } from 'src/components/loading-button';

import {
  Box,
  Stack,
  Switch,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from '@mui/material';

import { RegistrationTemplatePreview } from './registration-template-preview';

import { useAdmissionsRegistrationWorkspace } from './admissions-registration-configuration-context';

export function AdmissionsRegistrationSection3() {
  const { state: controllerState, actions, meta } = useAdmissionsRegistrationWorkspace();
  const {
    createSeriesState,
    editingSeries,
    previewTemplate,
    saveSeries,
    seriesForm,
    seriesOpen,
    seriesReadOnly,
    setPreviewTemplate,
    setSeriesForm,
    setSeriesOpen,
    updateSeriesState,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      {previewTemplate ? (
        <RegistrationTemplatePreview
          open
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      ) : null}
      <Dialog open={seriesOpen} onClose={() => setSeriesOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingSeries
            ? seriesReadOnly
              ? 'View Form Number Series'
              : 'Edit Form Number Series'
            : 'New Form Number Series'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Series name"
              value={seriesForm.name}
              disabled={seriesReadOnly}
              onChange={(event) =>
                setSeriesForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                size="small"
                label="Prefix"
                value={seriesForm.prefix}
                disabled={seriesReadOnly}
                onChange={(event) =>
                  setSeriesForm((current) => ({
                    ...current,
                    prefix: event.target.value.toUpperCase(),
                  }))
                }
              />
              <TextField
                size="small"
                label="Suffix"
                value={seriesForm.suffix}
                disabled={seriesReadOnly}
                onChange={(event) =>
                  setSeriesForm((current) => ({
                    ...current,
                    suffix: event.target.value.toUpperCase(),
                  }))
                }
              />
              <TextField
                size="small"
                type="number"
                label="Padding"
                value={seriesForm.padding}
                disabled={seriesReadOnly}
                onChange={(event) =>
                  setSeriesForm((current) => ({ ...current, padding: Number(event.target.value) }))
                }
              />
              <TextField
                size="small"
                type="number"
                label="Next number"
                value={seriesForm.nextNumber}
                disabled={seriesReadOnly}
                onChange={(event) =>
                  setSeriesForm((current) => ({
                    ...current,
                    nextNumber: Number(event.target.value),
                  }))
                }
              />
            </Box>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
            >
              {(
                [
                  ['campus', 'Campus'],
                  ['desiredClass', 'Class'],
                  ['admissionRound', 'Admission round'],
                  ['admissionRoute', 'Admission route'],
                ] as const
              ).map(([key, label]) => (
                <TextField
                  key={key}
                  size="small"
                  label={label}
                  value={seriesForm.applicability[key] || ''}
                  disabled={seriesReadOnly}
                  onChange={(event) =>
                    setSeriesForm((current) => ({
                      ...current,
                      applicability: {
                        ...current.applicability,
                        [key]: event.target.value || null,
                      },
                    }))
                  }
                />
              ))}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={seriesForm.isActive}
                  disabled={seriesReadOnly}
                  onChange={(event) =>
                    setSeriesForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeriesOpen(false)}>
            {seriesReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!seriesReadOnly ? (
            <LoadingButton
              variant="contained"
              loading={createSeriesState.isLoading || updateSeriesState.isLoading}
              disabled={!seriesForm.name.trim()}
              onClick={saveSeries}
            >
              Save Series
            </LoadingButton>
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  );
}
