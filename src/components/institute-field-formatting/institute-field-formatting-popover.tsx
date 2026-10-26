'use client';

import type { RootState } from 'src/redux/store';
import type {
  InstituteFieldFormatting,
  InstituteFormattingScope,
} from 'src/redux/InstituteSetup/institute-field-formatting-api';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { useId, useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomPopover } from 'src/components/custom-popover';
import { Alert, Stack, Button, Skeleton, Typography } from '@mui/material';
import { instituteFieldFormattingApi } from 'src/redux/InstituteSetup/institute-field-formatting-api';

import { INSTITUTE_FORMATTING_CONFIG } from './formatting-config';
import { InstituteFormattingForm } from './institute-formatting-form';

export function InstituteFieldFormattingPopover({ scope }: { scope: InstituteFormattingScope }) {
  const id = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [settings, setSettings] = useState<InstituteFieldFormatting>();
  const requestSequence = useRef(0);
  const config = INSTITUTE_FORMATTING_CONFIG[scope];
  const canEdit = useSelector(
    (state: RootState) =>
      state.auth?.permissionsInitialized &&
      [config.viewPermission, ...config.editPermissions].every((permission) =>
        hasGrantedPermission(state.auth.permissions, permission)
      )
  );
  const [load, query] = instituteFieldFormattingApi.useLazyGetInstituteFieldFormattingQuery();
  const loadSettings = async () => {
    requestSequence.current += 1;
    const request = requestSequence.current;
    setSettings(undefined);
    const result = await load(scope, false);
    if (request === requestSequence.current && !result.isError && result.data)
      setSettings(result.data);
  };
  const close = () => {
    requestSequence.current += 1;
    setAnchorEl(null);
    setSettings(undefined);
  };
  if (!canEdit) return null;
  return (
    <>
      <Button
        type="button"
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<Iconify icon={GlobalIcons.academicFieldSettings} />}
        aria-haspopup="dialog"
        aria-expanded={Boolean(anchorEl)}
        aria-controls={anchorEl ? id : undefined}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          loadSettings();
        }}
      >
        Field settings
      </Button>
      {anchorEl &&
        (settings ? (
          <InstituteFormattingForm
            id={id}
            scope={scope}
            anchorEl={anchorEl}
            settings={settings}
            onClose={close}
          />
        ) : (
          <CustomPopover
            open
            anchorEl={anchorEl}
            onClose={close}
            slotProps={{
              paper: {
                id,
                role: 'dialog',
                'aria-labelledby': `${id}-title`,
                sx: { width: 340, maxWidth: 'calc(100vw - 32px)' },
              },
            }}
          >
            <Stack spacing={2} sx={{ p: 2 }}>
              <Typography id={`${id}-title`} variant="subtitle1">
                Field Formatting
              </Typography>
              {query.isError ? (
                <Alert
                  severity="error"
                  action={
                    <Button size="small" onClick={loadSettings}>
                      Retry
                    </Button>
                  }
                >
                  Could not load formatting settings.
                </Alert>
              ) : (
                <Stack role="status" aria-label="Loading formatting settings">
                  <Skeleton height={40} />
                  <Skeleton height={90} />
                </Stack>
              )}
              <Button variant="outlined" size="small" onClick={close}>
                Close
              </Button>
            </Stack>
          </CustomPopover>
        ))}
    </>
  );
}
