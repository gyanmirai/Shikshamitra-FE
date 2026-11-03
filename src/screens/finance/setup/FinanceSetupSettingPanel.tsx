'use client';

import type { FinanceSetupSettingStatus } from 'src/redux/finance/setup/types';

import { useState } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import { Tab, Box, Stack, Alert, Typography } from '@mui/material';

import FinanceSetupManager from './FinanceSetupManager';
import { getFinanceSettingLabel } from './finance-setup-model';
import { financeSetupSettings } from './finance-setup-catalog';
import { FinanceSetupEmbeddingProvider } from './embedding/FinanceSetupEmbeddingProvider';

import type { FinanceSetupPosition } from './finance-setup-catalog';

export default function FinanceSetupSettingPanel({
  position,
  settings,
  deferred,
  disabled,
  onOpen,
  hrefFor,
  onEditorOpenChange,
}: {
  position: FinanceSetupPosition;
  settings: FinanceSetupSettingStatus[];
  deferred: string[];
  disabled: boolean;
  onOpen: (position: FinanceSetupPosition) => void;
  hrefFor: (position: FinanceSetupPosition) => string;
  onEditorOpenChange: (open: boolean) => void;
}) {
  const [actionContainer, setActionContainer] = useState<HTMLDivElement | null>(null);
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
    <FinanceSetupEmbeddingProvider
      onEditorOpenChange={onEditorOpenChange}
      actionContainer={actionContainer}
    >
      <Stack spacing={1} sx={{ flex: { xs: '1 0 auto', sm: 1 }, minHeight: 0, minWidth: 0 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          gap={1}
          sx={{ flexShrink: 0, minWidth: 0 }}
        >
          <CustomTabs
            value={current.key}
            variant="scrollable"
            scrollButtons="auto"
            density="compact"
            aria-label="Settings in this step"
            sx={{ flex: 1, minWidth: 0 }}
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
          <Box
            ref={setActionContainer}
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              flexShrink: 0,
              minWidth: 0,
              maxWidth: '100%',
              px: 1,
              '& > *': { maxWidth: '100%', flexWrap: 'wrap' },
              '& .MuiButton-root': { px: 1 },
            }}
          />
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          sx={{ flexShrink: 0, px: 1, gap: 1 }}
        >
          <Box component="details" key={current.key} sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              component="summary"
              variant="caption"
              color="text.secondary"
              sx={{ cursor: 'pointer', width: 'fit-content' }}
            >
              Setup guidance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {current.description}
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
          <Typography variant="caption" color="text.secondary">
            {getFinanceSettingLabel(status?.configurationState, deferred.includes(current.key))}
          </Typography>
        </Stack>
        {!status?.canManage && (
          <Alert severity="info">
            You can review this setting. Changes require the relevant management permission.
          </Alert>
        )}
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
            '& > *': { minHeight: 0, minWidth: 0 },
          }}
        >
          <FinanceSetupManager key={current.key} setting={current.key} />
        </Box>
      </Stack>
    </FinanceSetupEmbeddingProvider>
  );
}
