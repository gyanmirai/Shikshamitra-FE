'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Paper, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';

import { useOnboardingSettings } from './onboarding-settings-context';
import { defaultOnboardingConfigurationScope } from './onboarding-settings-model';

import type { OnboardingConfigurationScope } from './onboarding-settings-model';

type AcademicSelection = {
  id?: string;
  name?: string;
};

function ContextItem({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Typography variant="caption" color="text.secondary" noWrap title={`${label}: ${value}`}>
        {label}:{' '}
        <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {value}
        </Box>
      </Typography>
    );
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} noWrap title={value}>
        {value}
      </Typography>
    </Box>
  );
}

function useAcademicConfigurationScope() {
  const { currentYear } = useSelector((state: RootState) => state.globalState) as {
    currentYear?: AcademicSelection | null;
  };
  const hasAcademicYear = Boolean(currentYear?.id);

  const academicScope = useMemo<OnboardingConfigurationScope | null>(() => {
    const academicYearId = currentYear?.id;
    if (!academicYearId) return null;

    const academicYearName = currentYear?.name || 'Selected year';

    return {
      level: 'academic-year',
      key: `school:current:academic-year:${academicYearId}`,
      label: `Academic year — ${academicYearName}`,
      schoolName: 'Current school',
      academicYearId,
      academicYearName,
    };
  }, [currentYear?.id, currentYear?.name]);

  return { academicScope, hasAcademicYear };
}

export function OnboardingConfigurationScopeSync() {
  const { academicScope } = useAcademicConfigurationScope();
  const { scope, setScope } = useOnboardingSettings();

  useEffect(() => {
    if (scope.level !== 'academic-year') return;
    setScope(academicScope ?? defaultOnboardingConfigurationScope);
  }, [academicScope, scope.level, setScope]);

  return null;
}

export function OnboardingConfigurationScopeBar({ compact = false }: { compact?: boolean }) {
  const resetConfirm = useBoolean();
  const { academicScope, hasAcademicYear } = useAcademicConfigurationScope();
  const { scope, isInherited, setScope, resetToInherited } = useOnboardingSettings();

  const handleScopeChange = (value: OnboardingConfigurationScope['level']) => {
    if (value === 'academic-year' && academicScope) {
      setScope(academicScope);
      return;
    }
    setScope(defaultOnboardingConfigurationScope);
  };

  const handleReset = async () => {
    await resetToInherited();
    resetConfirm.onFalse();
  };

  return (
    <>
      <Paper variant="outlined" sx={{ p: compact ? 1.25 : { xs: 1.5, sm: 2 }, flexShrink: 0 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
          spacing={compact ? 1.25 : 2}
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: compact ? 32 : 36,
                height: compact ? 32 : 36,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1,
                bgcolor: 'action.hover',
                color: 'text.secondary',
              }}
            >
              <Iconify icon="mdi:tune-variant" width={20} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="subtitle2">Configuration scope</Typography>
                <Label color={isInherited ? 'default' : 'info'}>
                  {isInherited ? 'Inherited defaults' : 'Customized'}
                </Label>
              </Stack>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: compact ? { xs: 'none', lg: 'block' } : 'block' }}
              >
                Changes apply only to the selected scope. Editing inherited rules creates a scoped
                override.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <TextField
              select
              size="small"
              label="Applies to"
              value={scope.level}
              onChange={(event) =>
                handleScopeChange(event.target.value as OnboardingConfigurationScope['level'])
              }
              sx={{ minWidth: { sm: compact ? 210 : 230 } }}
            >
              <MenuItem value="school">Current school</MenuItem>
              <MenuItem value="academic-year" disabled={!hasAcademicYear}>
                Current academic year
              </MenuItem>
            </TextField>
            {!isInherited ? (
              <Button
                color="inherit"
                variant="outlined"
                onClick={resetConfirm.onTrue}
                sx={{ minHeight: 40, whiteSpace: 'nowrap' }}
              >
                Use inherited defaults
              </Button>
            ) : null}
          </Stack>
        </Stack>

        <Box
          sx={{
            mt: compact ? 1 : 1.5,
            pt: compact ? 1 : 1.5,
            borderTop: 1,
            borderColor: 'divider',
            display: compact ? 'flex' : 'grid',
            gridTemplateColumns: compact
              ? undefined
              : {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                },
            gap: compact ? { xs: 0.75, sm: 2 } : 1.5,
            flexWrap: compact ? 'wrap' : undefined,
          }}
        >
          <ContextItem compact={compact} label="School" value={scope.schoolName} />
          <ContextItem
            compact={compact}
            label="Academic year"
            value={
              scope.level === 'academic-year'
                ? scope.academicYearName || 'Selected year'
                : 'All years'
            }
          />
        </Box>

        {!hasAcademicYear && !compact ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
            Select an academic year from the global academic selector to create a year-specific
            override.
          </Typography>
        ) : null}
      </Paper>

      <ConfirmDialog
        open={resetConfirm.value}
        onClose={resetConfirm.onFalse}
        title="Use inherited defaults?"
        content={`Remove the current ${scope.label} override and restore inherited onboarding rules for this session.`}
        icon="warning"
        action={
          <Button variant="contained" color="warning" onClick={handleReset}>
            Restore defaults
          </Button>
        }
      />
    </>
  );
}
