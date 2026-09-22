import type { DragEndEvent } from '@dnd-kit/core';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import Link from 'next/link';
import { Box, Tab, Card } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import { WorkflowStageList } from './workflow-stage-list';
import { WorkflowJourneyMap } from './workflow-journey-map';

type Props = {
  view: 'configure' | 'map';
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  readOnly: boolean;
  loadingStageTypes: boolean;
  issueCountByStage: Record<string, number>;
  onAddStage: () => void;
  onEditStage: (stage: AdmissionWorkflowStage) => void;
  onDuplicateStage: (stage: AdmissionWorkflowStage) => void;
  onDeleteStage: (stage: AdmissionWorkflowStage) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onAddTransition: (stage: AdmissionWorkflowStage) => void;
  onEditTransition: (transition: AdmissionWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
  viewHrefs: Record<'configure' | 'map', string>;
};

const WORKFLOW_VIEWS = [
  { value: 'configure' as const, label: 'Configure', icon: 'mdi:tune-variant' },
  { value: 'map' as const, label: 'Journey map', icon: 'mdi:graph-outline' },
];

export function WorkflowBuilderCanvas({
  view,
  stages,
  transitions,
  readOnly,
  loadingStageTypes,
  issueCountByStage,
  onAddStage,
  onEditStage,
  onDuplicateStage,
  onDeleteStage,
  onDragEnd,
  onAddTransition,
  onEditTransition,
  onDeleteTransition,
  viewHrefs,
}: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}>
        <CustomTabs
          value={view}
          aria-label="Workflow builder view"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          guardUnsavedChanges={false}
          slotProps={{
            scroller: { p: 0.5 },
            tab: { minHeight: 44 },
          }}
        >
          {WORKFLOW_VIEWS.map((item) => (
            <Tab
              key={item.value}
              component={Link}
              href={viewHrefs[item.value]}
              prefetch={false}
              value={item.value}
              id={`workflow-builder-${item.value}-tab`}
              aria-controls={`workflow-builder-${item.value}-panel`}
              icon={<Iconify icon={item.icon} width={19} />}
              iconPosition="start"
              label={item.label}
              sx={{ textDecoration: 'none' }}
            />
          ))}
        </CustomTabs>
      </Box>
      {view === 'map' ? (
        <Box
          role="tabpanel"
          id="workflow-builder-map-panel"
          aria-labelledby="workflow-builder-map-tab"
          sx={{ flex: 1, minHeight: 0, display: 'flex' }}
        >
          <WorkflowJourneyMap
            stages={stages}
            transitions={transitions}
            readOnly={readOnly}
            onEditStage={onEditStage}
          />
        </Box>
      ) : (
        <Box
          role="tabpanel"
          id="workflow-builder-configure-panel"
          aria-labelledby="workflow-builder-configure-tab"
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <WorkflowStageList
            stages={stages}
            transitions={transitions}
            readOnly={readOnly}
            loadingStageTypes={loadingStageTypes}
            issueCountByStage={issueCountByStage}
            onAdd={onAddStage}
            onEdit={onEditStage}
            onDuplicate={onDuplicateStage}
            onDelete={onDeleteStage}
            onAddPath={onAddTransition}
            onEditPath={onEditTransition}
            onDeletePath={onDeleteTransition}
            onDragEnd={onDragEnd}
          />
        </Box>
      )}
    </Card>
  );
}
