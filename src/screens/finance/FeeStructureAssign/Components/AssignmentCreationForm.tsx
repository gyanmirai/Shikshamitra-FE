import type { ReactNode, FormEventHandler } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';

export function assignmentCreationGrid(bulk: boolean, results: boolean): SxProps<Theme> {
  const regions = [bulk && 'students', !results && 'setup', 'preview'].filter(Boolean);

  return {
    display: 'grid',
    gap: 2,
    alignItems: 'start',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateAreas: regions.map((region) => `"${region}"`).join(' '),
    ...(bulk || !results
      ? {
          '@container (min-width: 760px)': bulk
            ? {
                gridTemplateColumns: 'minmax(180px, 1fr) minmax(0, 3fr)',
                gridTemplateAreas: results
                  ? '"students preview"'
                  : '"students setup" "students preview"',
              }
            : {
                gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
                gridTemplateAreas: '"setup preview"',
              },
        }
      : {}),
    ...(bulk &&
      !results && {
        '@container (min-width: 1056px)': {
          gridTemplateColumns: 'minmax(180px, 0.6fr) minmax(0, 1.4fr) minmax(0, 1fr)',
          gridTemplateAreas: '"students setup preview"',
        },
      }),
  };
}

export default function AssignmentCreationForm({
  busy,
  busyLabel,
  onPreview,
  onAssign,
  onCancel,
  previewDisabled,
  assignDisabled,
  assignLabel,
  resultAction,
  children,
}: {
  busy: boolean;
  busyLabel: string;
  onPreview: FormEventHandler<HTMLFormElement>;
  onAssign: () => void;
  onCancel: () => void;
  previewDisabled: boolean;
  assignDisabled: boolean;
  assignLabel: string;
  resultAction?: { label: string; icon: string; onClick: () => void };
  children: ReactNode;
}) {
  return (
    <Box
      component="form"
      noValidate
      onSubmit={onPreview}
      sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0 }}
    >
      <FormBusyRegion busy={busy} label={busyLabel} fillContent flattenFieldset>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: 'auto',
            px: { xs: 2, sm: 3 },
            py: 2,
            containerType: 'inline-size',
          }}
        >
          {children}
        </Box>
        <Stack
          direction="row"
          justifyContent={resultAction ? 'flex-end' : 'space-between'}
          alignItems="center"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: { xs: 2, sm: 3 },
            py: 1.75,
          }}
        >
          {resultAction ? (
            <Button
              type="button"
              variant="contained"
              size="small"
              disabled={busy}
              onClick={resultAction.onClick}
              startIcon={<Iconify icon={resultAction.icon} />}
            >
              {resultAction.label}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                disabled={busy}
                onClick={onCancel}
                startIcon={<Iconify icon="mdi:close" />}
              >
                Cancel
              </Button>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  type="submit"
                  variant="outlined"
                  color="inherit"
                  size="small"
                  disabled={previewDisabled}
                  startIcon={<Iconify icon="mdi:eye-outline" />}
                >
                  Preview
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  disabled={assignDisabled}
                  onClick={onAssign}
                  startIcon={<Iconify icon="mdi:check" />}
                >
                  {assignLabel}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </FormBusyRegion>
    </Box>
  );
}
