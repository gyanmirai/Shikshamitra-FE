import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Box, Tab } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';

import { getStageStatusLabel } from './application-progress-model';

export function ApplicationStageTabs({
  stages,
  selectedStageId,
  currentStageId,
  busy,
  onChange,
}: {
  stages: AdmissionApplicationStage[];
  selectedStageId?: string;
  currentStageId?: string | null;
  busy: boolean;
  onChange: (stageId: string) => void;
}) {
  if (!stages.length) return null;
  const selected = stages.some((stage) => stage.id === selectedStageId) ? selectedStageId : false;

  return (
    <CustomTabs
      value={selected}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      guardUnsavedChanges={false}
      aria-label="Admission journey"
      onChange={(_, stageId: string) => onChange(stageId)}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
      slotProps={{
        scroller: { py: 0, px: 1 },
        tab: { flex: { sm: '1 0 120px' }, minWidth: { sm: 120 }, maxWidth: 200, minHeight: 44 },
      }}
    >
      {[...stages]
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .map((stage) => (
          <Tab
            key={stage.id}
            id={`application-stage-tab-${stage.id}`}
            aria-controls={`application-stage-panel-${stage.id}`}
            aria-label={`${stage.name}, ${getStageStatusLabel(stage.status)}`}
            value={stage.id}
            label={
              <Box component="span" sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                {stage.name}
              </Box>
            }
            disabled={busy || (stage.id !== currentStageId && stage.status === 0)}
          />
        ))}
    </CustomTabs>
  );
}
