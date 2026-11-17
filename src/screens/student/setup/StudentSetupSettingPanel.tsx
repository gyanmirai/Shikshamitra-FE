'use client';

import type { StudentSetupState } from 'src/redux/student/setup/types';

import { Box, Tab, Tabs, Stack, Alert, Typography } from '@mui/material';

import StudentSetupManager from './StudentSetupManager';
import { studentSetupStatusLabel } from './student-setup-model';
import { studentSetupStages, studentSetupSettings } from './student-setup-catalog';

import type { StudentSetupPosition } from './student-setup-catalog';

export default function StudentSetupSettingPanel({
  position,
  state,
  deferred,
  disabled,
  onOpen,
}: {
  position: StudentSetupPosition;
  state: StudentSetupState;
  deferred: string[];
  disabled: boolean;
  onOpen: (position: StudentSetupPosition) => void;
}) {
  const items = studentSetupSettings.filter(
    (item) =>
      item.stage === position.stage &&
      state.settings.some((status) => status.key === item.key && status.canView)
  );
  const current = items.find((item) => item.key === position.setting);
  const status = state.settings.find((item) => item.key === current?.key);
  return (
    <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0, '& > *': { flexShrink: 0 } }}>
      <Stack spacing={0.75}>
        <Typography variant="overline" color="text.secondary">
          Student setup
        </Typography>
        <Typography variant="h4" component="h1">
          {studentSetupStages.find((item) => item.key === position.stage)?.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure each item using its usual form. Submit your changes before continuing with the
          guide.
        </Typography>
      </Stack>
      {!!items.length && (
        <Tabs
          value={current?.key ?? false}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Settings in this step"
        >
          {items.map((item) => (
            <Tab
              key={item.key}
              value={item.key}
              label={item.title}
              disabled={disabled}
              onClick={() => onOpen({ stage: item.stage, setting: item.key })}
            />
          ))}
        </Tabs>
      )}
      {current ? (
        <>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography variant="body2" color="text.secondary">
              {current.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {studentSetupStatusLabel(status, deferred.includes(current.key))}
            </Typography>
          </Stack>
          {status?.canManage === false &&
            (status.configurationState === 'configured' ||
              status.configurationState === 'empty') && (
              <Alert severity="info">
                You can review this setting. Changes require the relevant management permission.
              </Alert>
            )}
          <Box
            sx={{
              flex: '1 0 auto',
              minHeight: 'min-content',
              display: 'flex',
              flexDirection: 'column',
              '& > *': { height: 'auto' },
            }}
          >
            <StudentSetupManager key={current.key} setting={current.key} />
          </Box>
        </>
      ) : (
        <Alert severity="info">
          You only see settings you have permission to view. You can continue to another step.
        </Alert>
      )}
    </Stack>
  );
}
