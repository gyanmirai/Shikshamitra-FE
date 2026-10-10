import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import AdmissionFeeSelectionPanel, {
  useFeeSelectionEditorState,
} from '../fee-selection/admission-fee-selection-panel';

import type { AdmissionFeeSelectionEditorState } from '../fee-selection/admission-fee-selection-editor';
import type { ApplicationStageReadinessHandler } from '../application-detail/application-stage-readiness';

type Props = {
  applicationId: string;
  stage: AdmissionApplicationStage;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: () => void;
  onFeeSelectionStateChange?: (state: AdmissionFeeSelectionEditorState) => void;
  compact?: boolean;
  readOnly?: boolean;
  showCompletionAction?: boolean;
  onReadinessChange?: ApplicationStageReadinessHandler;
};

export function ApplicationPaymentStage({
  applicationId,
  stage,
  canAdvance,
  advancing,
  onComplete,
  onFeeSelectionStateChange,
  compact = false,
  readOnly = false,
  showCompletionAction = true,
  onReadinessChange,
}: Props) {
  const feeEditor = useFeeSelectionEditorState(onFeeSelectionStateChange);
  return (
    <AdmissionFeeSelectionPanel
      key={stage.id}
      applicationId={applicationId}
      outlined
      compact={compact}
      readOnly={readOnly}
      canContinue={canAdvance && !feeEditor.blocked}
      completionStageId={stage.id}
      continuing={advancing}
      onContinue={showCompletionAction ? onComplete : undefined}
      onEditorStateChange={feeEditor.update}
      onReadinessChange={onReadinessChange}
    />
  );
}
