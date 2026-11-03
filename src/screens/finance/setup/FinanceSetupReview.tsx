'use client';

import type { FinanceSetupSettingStatus } from 'src/redux/finance/setup/types';

import { Label } from 'src/components/label';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Alert, Button, Divider, Typography } from '@mui/material';

import { getFinanceSettingLabel } from './finance-setup-model';
import { financeSetupStages, financeSetupSettings } from './finance-setup-catalog';

import type { FinanceSetupPosition } from './finance-setup-catalog';

export default function FinanceSetupReview({
  settings,
  deferred,
  reviewed,
  disabled,
  onOpen,
}: {
  settings: FinanceSetupSettingStatus[];
  deferred: string[];
  reviewed: boolean;
  disabled: boolean;
  onOpen: (position: FinanceSetupPosition) => void;
}) {
  const visible = financeSetupSettings.filter((item) =>
    settings.some((status) => status.key === item.key && status.canView)
  );
  const pending = visible.filter(
    (item) =>
      settings.find((status) => status.key === item.key)?.configurationState !== 'configured'
  );
  return (
    <Stack spacing={2}>
      <Alert severity={reviewed ? 'success' : 'info'}>
        {reviewed ? 'Your Finance setup review is saved. ' : ''}
        {pending.length
          ? `${pending.length} visible configuration checks still need attention. `
          : 'Active records are available for your visible configuration checks. '}
        Finishing this review does not assign fees, collect money or approve requests. Missing and
        deferred setup remains pending.
      </Alert>
      <Typography variant="body2" color="text.secondary">
        These checks confirm configuration is present. Review every required class, mapping,
        effective date and payment method in its owning form before using Finance.
      </Typography>
      {financeSetupStages
        .filter((stage) => financeSetupSettings.some((item) => item.stage === stage.key))
        .map((stage) => {
          const items = visible.filter((item) => item.stage === stage.key);
          if (!items.length) return null;
          return (
            <FormSectionCard key={stage.key} title={stage.title}>
              <Stack divider={<Divider />} spacing={1.5}>
                {items.map((item) => {
                  const status = settings.find((entry) => entry.key === item.key);
                  return (
                    <Stack
                      key={item.key}
                      direction={{ xs: 'column', sm: 'row' }}
                      gap={1}
                      alignItems={{ sm: 'center' }}
                      justifyContent="space-between"
                    >
                      <Typography variant="body2">{item.title}</Typography>
                      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
                        <Label
                          color={
                            status?.configurationState === 'configured' ? 'success' : 'default'
                          }
                        >
                          {getFinanceSettingLabel(
                            status?.configurationState,
                            deferred.includes(item.key)
                          )}
                        </Label>
                        <Button
                          color="inherit"
                          variant="outlined"
                          size="small"
                          disabled={disabled}
                          aria-label={`Review ${item.title}`}
                          onClick={() => onOpen({ stage: item.stage, setting: item.key })}
                        >
                          Review
                        </Button>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            </FormSectionCard>
          );
        })}
      {visible.length < financeSetupSettings.length && (
        <Alert severity="info">
          Some settings are outside your view permissions. Ask an authorized staff member to review
          those settings; this guide does not confirm their readiness.
        </Alert>
      )}
    </Stack>
  );
}
