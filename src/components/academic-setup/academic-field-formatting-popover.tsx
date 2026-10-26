'use client';

import type { RootState } from 'src/redux/store';
import type { AcademicFieldFormatting } from 'src/redux/InstituteSetup/academic-field-formatting-api';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomPopover } from 'src/components/custom-popover';
import { Alert, Stack, Button, Skeleton, Typography } from '@mui/material';
import { academicFieldFormattingApi } from 'src/redux/InstituteSetup/academic-field-formatting-api';

import { AcademicFieldFormattingForm } from './academic-field-formatting-form';

export function AcademicFieldFormattingPopover() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [settings, setSettings] = useState<AcademicFieldFormatting>();
  const requestSequence = useRef(0);
  const canEdit = useSelector((state: RootState) =>
    hasGrantedPermission(state.auth.permissions, 'InstituteSetup.AcademicSetup.Edit')
  );
  const [load, query] = academicFieldFormattingApi.useLazyGetAcademicFieldFormattingQuery();
  const loadSettings = async () => {
    requestSequence.current += 1;
    const request = requestSequence.current;
    setSettings(undefined);
    const result = await load(undefined, false);
    if (request === requestSequence.current && result.data) setSettings(result.data);
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
        aria-controls={anchorEl ? 'academic-field-formatting' : undefined}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          loadSettings();
        }}
      >
        Field settings
      </Button>
      {anchorEl &&
        (settings ? (
          <AcademicFieldFormattingForm anchorEl={anchorEl} settings={settings} onClose={close} />
        ) : (
          <CustomPopover
            open
            anchorEl={anchorEl}
            onClose={close}
            slotProps={{
              paper: {
                id: 'academic-field-formatting',
                role: 'dialog',
                'aria-labelledby': 'academic-field-formatting-title',
                sx: { width: 340, maxWidth: 'calc(100vw - 32px)' },
              },
            }}
          >
            <Stack spacing={2} sx={{ p: 2 }}>
              <Typography id="academic-field-formatting-title" variant="subtitle1">
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
