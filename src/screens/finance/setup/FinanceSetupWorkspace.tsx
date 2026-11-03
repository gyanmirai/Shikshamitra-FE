'use client';

import type { GrantedPermission } from 'src/utils/permissions';
import type { FinanceSetupScope } from 'src/redux/finance/setup/types';

import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { SetupFlowShell } from 'src/components/setup-flow';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Stack, Alert, Button, Skeleton } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useFinanceSetupStateQuery } from 'src/redux/finance/setup/api';
import GlobalAcademicSearch from 'src/layouts/components/global-academic-search';

import FinanceSetupReview from './FinanceSetupReview';
import FinanceSetupFooter from './FinanceSetupFooter';
import FinanceSetupGuidance from './FinanceSetupGuidance';
import FinanceSetupSettingPanel from './FinanceSetupSettingPanel';
import { useFinanceSetupProgress } from './use-finance-setup-progress';
import { financeSetupStages, financeSetupSettings } from './finance-setup-catalog';
import { getFinanceSetupPosition, getFinanceSetupStepStates } from './finance-setup-model';

import type { FinanceSetupPosition } from './finance-setup-catalog';

export default function FinanceSetupWorkspace({
  scope,
  returnTo,
  permissions,
}: {
  scope: FinanceSetupScope;
  returnTo: string;
  permissions: GrantedPermission[];
}) {
  const router = useRouter();
  const query = useFinanceSetupStateQuery(scope, {
    skip: !scope.academicYearId,
    refetchOnMountOrArgChange: true,
  });
  const { refetch, isFetching } = query;
  // Never fall back to query.data: it may belong to the previous academic year.
  const state =
    query.currentData?.academicYearId === scope.academicYearId ? query.currentData : undefined;
  const visibleSettings =
    state?.settings.map((item) => ({
      ...item,
      canView:
        item.canView &&
        hasGrantedPermission(
          permissions,
          financeSetupSettings.find((entry) => entry.key === item.key)?.permission
        ),
    })) ?? [];
  const progress = useFinanceSetupProgress(
    scope,
    state ? { ...state, settings: visibleSettings } : undefined
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const wasEditorOpen = useRef(false);
  const [reloading, setReloading] = useState(false);
  const refreshLock = useRef(false);
  const heading = useRef<HTMLSpanElement>(null);
  const { position } = progress;
  const activeStep = financeSetupStages.findIndex((item) => item.key === position.stage);
  const visible = financeSetupSettings.filter((item) =>
    visibleSettings.some((status) => status.key === item.key && status.canView)
  );
  const disabled =
    editorOpen ||
    !state ||
    query.isFetching ||
    query.isError ||
    progress.saving ||
    progress.conflict ||
    reloading;

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [position.stage, position.setting]);

  useEffect(() => {
    const refresh = () => {
      if (
        document.visibilityState !== 'hidden' &&
        scope.academicYearId &&
        !editorOpen &&
        !progress.saving &&
        !progress.conflict &&
        !isFetching &&
        !refreshLock.current
      ) {
        refreshLock.current = true;
        Promise.resolve(refetch()).finally(() => {
          refreshLock.current = false;
        });
      }
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [scope.academicYearId, editorOpen, progress.saving, progress.conflict, isFetching, refetch]);

  useEffect(() => {
    if (wasEditorOpen.current && !editorOpen && !isFetching) refetch();
    wasEditorOpen.current = editorOpen;
  }, [editorOpen, isFetching, refetch]);

  const move = (target: FinanceSetupPosition) => {
    if (!disabled) progress.persist(target);
  };
  const next = (defer = false) => {
    if (disabled) return;
    if (position.stage === 'review') {
      progress.persist(position, progress.deferred, true);
      return;
    }
    const inStage = visible.filter((item) => item.stage === position.stage);
    const currentIndex = inStage.findIndex((item) => item.key === position.setting);
    const nextSetting = inStage[currentIndex + 1];
    const target = nextSetting
      ? { stage: nextSetting.stage, setting: nextSetting.key }
      : getFinanceSetupPosition(
          financeSetupStages[activeStep + 1].key,
          null,
          visible.map((item) => item.key)
        );
    const keys = position.setting
      ? progress.deferred.filter((key) => key !== position.setting)
      : progress.deferred;
    progress.persist(target, defer && position.setting ? [...keys, position.setting] : keys);
  };
  const back = () => {
    if (disabled) return;
    const inStage = visible.filter((item) => item.stage === position.stage);
    const index = inStage.findIndex((item) => item.key === position.setting);
    const previous = inStage[index - 1];
    if (previous) move({ stage: previous.stage, setting: previous.key });
    else if (activeStep > 0) {
      const stage = financeSetupStages[activeStep - 1].key;
      move({ stage, setting: visible.filter((item) => item.stage === stage).at(-1)?.key ?? null });
    }
  };
  const reload = async () => {
    setReloading(true);
    try {
      const result = await query.refetch();
      if ('data' in result && result.data) progress.restore(result.data);
    } finally {
      setReloading(false);
    }
  };
  const saveExit = () => {
    if (!disabled) progress.persist(position, progress.deferred, false, returnTo);
  };
  const isGuidance = position.stage === 'assignment' || position.stage === 'operations';
  const tableStage = !isGuidance && position.stage !== 'review';

  return (
    <SetupFlowShell
      density="compact"
      contentMaxWidth={tableStage ? 'none' : 1040}
      steps={financeSetupStages}
      fillContent={tableStage}
      activeStep={activeStep}
      furthestStep={financeSetupStages.length - 1}
      stepStates={
        !query.isError && !query.isFetching && state
          ? getFinanceSetupStepStates(visibleSettings, progress.deferred, state.reviewedAt)
          : {}
      }
      disabled={disabled}
      onStep={(index) =>
        move(
          getFinanceSetupPosition(
            financeSetupStages[index].key,
            null,
            visible.map((item) => item.key)
          )
        )
      }
      schoolCode="Finance module"
      sidebarTitle="Finance setup"
      headerLabel="Finance setup guide"
      contextLabel="Progress is saved for the selected academic year."
      footer={
        <FinanceSetupFooter
          first={
            activeStep === 0 &&
            (!position.setting ||
              position.setting === visible.find((item) => item.stage === 'accounts')?.key)
          }
          review={position.stage === 'review'}
          hasSetting={Boolean(position.setting)}
          disabled={disabled}
          saving={progress.saving}
          message={
            editorOpen
              ? 'Submit or close the open Finance editor before continuing.'
              : progress.failed
                ? ''
                : progress.message
                  ? 'Saved'
                  : ''
          }
          onBack={back}
          onSave={() => {
            progress.persist();
          }}
          onExit={saveExit}
          onContinue={() => next()}
          onDefer={() => next(true)}
        />
      }
    >
      <Stack
        spacing={tableStage ? 1 : 2}
        sx={tableStage ? { flex: { xs: '1 0 auto', sm: 1 }, minHeight: 0 } : undefined}
      >
        <CustomBreadcrumbs
          headingComponent="h1"
          heading={
            <Box component="span" ref={heading} tabIndex={-1} sx={{ outline: 'none' }}>
              {financeSetupStages[activeStep].title}
            </Box>
          }
          description="Save changes in each setting before continuing. Guide progress is saved for the selected academic year."
          links={[]}
          slotProps={{
            action: { maxWidth: '100%', ml: { md: 'auto' } },
            heading: {},
            moreLink: {},
            breadcrumbs: {},
          }}
          sx={{ flexShrink: 0, minHeight: 44 }}
          action={
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ minWidth: 0 }}>
              <Box
                inert={editorOpen || progress.saving || reloading}
                sx={{ flex: '1 1 160px', minWidth: 0, maxWidth: 200 }}
              >
                <GlobalAcademicSearch />
              </Box>
              {tableStage && state && !query.isError && (
                <Button
                  startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
                  size="small"
                  color="inherit"
                  variant="outlined"
                  disabled={disabled}
                  onClick={() => {
                    query.refetch();
                  }}
                >
                  Refresh checks
                </Button>
              )}
              <Button
                startIcon={<Iconify icon={GlobalIcons.exit} width={18} />}
                size="small"
                color="inherit"
                variant="outlined"
                disabled={
                  editorOpen ||
                  progress.saving ||
                  reloading ||
                  (Boolean(state) && query.isFetching && !query.isError)
                }
                onClick={() => {
                  if (state && !query.isError && !progress.conflict) saveExit();
                  else router.push(returnTo);
                }}
              >
                Exit setup
              </Button>
            </Stack>
          }
        />
        {!scope.academicYearId ? (
          <Alert severity="info">
            Select an existing academic year above to view Finance configuration and guide progress.
          </Alert>
        ) : query.isError && !state ? (
          <Alert
            severity="error"
            action={
              <Button
                startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
                color="inherit"
                size="small"
                disabled={query.isFetching}
                onClick={() => {
                  query.refetch();
                }}
              >
                Retry
              </Button>
            }
          >
            Finance configuration could not be checked. Retry to continue; previous results are not
            confirmed.
          </Alert>
        ) : !state ? (
          <Stack spacing={2} role="status" aria-label="Checking Finance configuration">
            <Skeleton height={44} />
            <Skeleton variant="rounded" height={220} />
          </Stack>
        ) : position.stage === 'review' ? (
          <FinanceSetupReview
            settings={visibleSettings}
            deferred={progress.deferred}
            reviewed={Boolean(state.reviewedAt)}
            disabled={disabled}
            onOpen={move}
          />
        ) : isGuidance ? (
          <FinanceSetupGuidance
            assignment={position.stage === 'assignment'}
            permissions={permissions}
            disabled={disabled}
          />
        ) : (
          <Box
            inert={progress.saving || progress.conflict || reloading}
            aria-busy={query.isFetching || undefined}
            sx={{
              flex: { xs: '1 0 auto', sm: '1 1 0' },
              minHeight: 0,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <FinanceSetupSettingPanel
              onEditorOpenChange={setEditorOpen}
              position={position}
              settings={
                query.isError
                  ? visibleSettings.map((item) => ({
                      ...item,
                      configurationState: 'unavailable',
                    }))
                  : visibleSettings
              }
              deferred={progress.deferred}
              disabled={disabled}
              onOpen={move}
              hrefFor={progress.hrefFor}
            />
          </Box>
        )}
        {query.isError && state && (
          <Alert
            severity="error"
            action={
              <Button
                startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
                color="inherit"
                size="small"
                disabled={query.isFetching || editorOpen}
                onClick={() => {
                  query.refetch();
                }}
              >
                Retry
              </Button>
            }
          >
            Finance configuration could not be checked. Your open setting is preserved. Retry to
            refresh its status.
          </Alert>
        )}
        {progress.failed && (
          <Alert
            severity={progress.conflict ? 'warning' : 'error'}
            action={
              progress.conflict ? (
                <Button
                  startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
                  size="small"
                  color="inherit"
                  disabled={reloading}
                  onClick={() => {
                    reload();
                  }}
                >
                  Reload saved progress
                </Button>
              ) : undefined
            }
          >
            {progress.message}
          </Alert>
        )}
      </Stack>
    </SetupFlowShell>
  );
}
