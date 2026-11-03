'use client';

import type { FinanceSetupSettingStatus } from 'src/redux/finance/setup/types';

import { CustomTabs } from 'src/components/custom-tabs';
import { Tab, Box, Stack, Alert, Typography } from '@mui/material';

import FinanceSetupManager from './FinanceSetupManager';
import { getFinanceSettingLabel } from './finance-setup-model';
import { financeSetupSettings } from './finance-setup-catalog';

import type { FinanceSetupPosition } from './finance-setup-catalog';

export default function FinanceSetupSettingPanel({
  position,
  settings,
  deferred,
  disabled,
  onOpen,
  hrefFor,
}: {
  position: FinanceSetupPosition;
  settings: FinanceSetupSettingStatus[];
  deferred: string[];
  disabled: boolean;
  onOpen: (position: FinanceSetupPosition) => void;
  hrefFor: (position: FinanceSetupPosition) => string;
}) {
  const items = financeSetupSettings.filter(
    (item) =>
      item.stage === position.stage &&
      settings.some((status) => status.key === item.key && status.canView)
  );
  const current = items.find((item) => item.key === position.setting);
  const status = settings.find((item) => item.key === current?.key);

  if (!current)
    return (
      <Alert severity="info">
        You do not have access to the settings in this step. An authorized staff member can review
        this part of Finance setup. You can continue to the other steps.
      </Alert>
    );

  return (
    <Stack spacing={1.5} sx={{ flex: { xs: '1 0 auto', sm: 1 }, minHeight: 0 }}>
      <CustomTabs
        value={current.key}
        variant="scrollable"
        scrollButtons="auto"
        density="compact"
        aria-label="Settings in this step"
      >
        {items.map((item) => (
          <Tab
            component="a"
            href={hrefFor({ stage: item.stage, setting: item.key })}
            id={`finance-setup-tab-${item.key}`}
            aria-controls={`finance-setup-panel-${item.key}`}
            key={item.key}
            value={item.key}
            label={item.title}
            disabled={disabled}
            onClick={(event) => {
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              onOpen({ stage: item.stage, setting: item.key });
            }}
          />
        ))}
      </CustomTabs>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        sx={{ flexShrink: 0 }}
      >
        <Typography variant="body2" color="text.secondary">
          {current.description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {getFinanceSettingLabel(status?.configurationState, deferred.includes(current.key))}
        </Typography>
      </Stack>
      {!status?.canManage && (
        <Alert severity="info">
          You can review this setting. Changes require the relevant management permission.
        </Alert>
      )}
      <Box component="details" sx={{ flexShrink: 0 }}>
        <Typography
          component="summary"
          variant="caption"
          color="text.secondary"
          sx={{ cursor: 'pointer' }}
        >
          Setup guidance
        </Typography>
        <Box component="ol" sx={{ my: 1, pl: 2.5, '& li + li': { mt: 0.5 } }}>
          {current.instructions.map((instruction) => (
            <Typography key={instruction} component="li" variant="body2">
              {instruction}
            </Typography>
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {current.note}
        </Typography>
      </Box>
      <Box
        role="tabpanel"
        id={`finance-setup-panel-${current.key}`}
        aria-labelledby={`finance-setup-tab-${current.key}`}
        sx={{
          flex: { xs: '0 0 480px', sm: '1 1 0' },
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <FinanceSetupManager key={current.key} setting={current.key} />
      </Box>
    </Stack>
  );
}
