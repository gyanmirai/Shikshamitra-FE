import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { vi } from 'vitest';

import { AdmissionWorkflowStageDrawer } from '../admission-workflow-stage-drawer';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';
import { AdmissionWorkflowTransitionDrawer } from '../admission-workflow-transition-drawer';

export function renderRetiredStage(
  type: AdmissionWorkflowStage['stageType'],
  name: string,
  configurationJson = JSON.stringify({ extension: 'legacy' })
) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  const metadata: AdmissionWorkflowStageTypeMetadata = {
    type,
    displayName: name,
    description: name,
    icon: '',
    defaultColor: '',
    supportedConfiguration: [],
    runtimeHandler: name,
    nextRequiredAction: '',
    canBeEntryStage: true,
    canBeTerminalStage: true,
    supportsFormAttachment: false,
    supportsConditions: true,
    isRuntimeReady: true,
    isSelectable: false,
    isDeprecated: true,
  };
  const stage: AdmissionWorkflowStage = {
    id: 'legacy',
    code: 'LEGACY',
    name,
    stageType: type,
    displayOrder: 0,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: true,
    isTerminalStage: true,
    configurationJson,
  };
  renderDocumentUi(
    <AdmissionWorkflowStageDrawer
      open
      stage={stage}
      stageTypes={[
        metadata,
        {
          ...metadata,
          type: 7,
          displayName: 'Admission Decision',
          isSelectable: true,
          isDeprecated: false,
        },
      ]}
      forms={[]}
      stages={[stage]}
      readOnly={false}
      onClose={onClose}
      onSave={onSave}
    />
  );
  return { onSave, onClose, stage };
}

export function renderRetiredRoute(
  type: AdmissionWorkflowStage['stageType'],
  name: string,
  readOnly = false
) {
  const onSave = vi.fn();
  const source: AdmissionWorkflowStage = {
    id: 'retired',
    code: 'RETIRED',
    name,
    stageType: type,
    displayOrder: 0,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: true,
    isTerminalStage: false,
    configurationJson: JSON.stringify({
      eligibility: { enabled: true },
      review: { enabled: true },
      offer: { enabled: true },
    }),
  };
  const destination = {
    ...source,
    id: 'decision',
    code: 'DECISION',
    name: 'Admission Decision',
    stageType: 7 as const,
    isEntryStage: false,
    isTerminalStage: true,
    configurationJson: undefined,
  };
  renderDocumentUi(
    <AdmissionWorkflowTransitionDrawer
      open
      stages={[source, destination]}
      readOnly={readOnly}
      transition={{
        id: 'route',
        fromStageId: source.id,
        toStageId: destination.id,
        priority: 0,
        isDefault: true,
      }}
      onClose={vi.fn()}
      onSave={onSave}
    />
  );
  return { onSave };
}
