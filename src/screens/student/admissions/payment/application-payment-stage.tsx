import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { useState, useCallback } from 'react';

import { CollectLaterDialog } from './collect-later-dialog';
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
  onDeferCollection?: (reason: string) => Promise<boolean>;
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
  onDeferCollection,
  onFeeSelectionStateChange,
  compact = false,
  readOnly = false,
  showCompletionAction = true,
  onReadinessChange,
}: Props) {
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [deferring, setDeferring] = useState(false);
  const feeEditorChanged = useCallback(
    (state: AdmissionFeeSelectionEditorState) => {
      onFeeSelectionStateChange?.({ ...state, busy: state.busy || collectionOpen });
    },
    [collectionOpen, onFeeSelectionStateChange]
  );
  const feeEditor = useFeeSelectionEditorState(feeEditorChanged);
  const collectionChanged = useCallback(
    (open: boolean) => {
      setCollectionOpen(open);
      onFeeSelectionStateChange?.({ ...feeEditor.state, busy: feeEditor.state.busy || open });
    },
    [feeEditor.state, onFeeSelectionStateChange]
  );
  return (
    <>
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
        onCollectLater={
          canAdvance && !readOnly && onDeferCollection ? () => setDeferring(true) : undefined
        }
        onCollectionOpenChange={collectionChanged}
        editorBlocked={feeEditor.blocked}
        onEditorStateChange={feeEditor.update}
        onReadinessChange={onReadinessChange}
      />
      {deferring && onDeferCollection && !readOnly && (
        <CollectLaterDialog
          busy={advancing}
          onClose={() => setDeferring(false)}
          onSubmit={onDeferCollection}
        />
      )}
    </>
  );
}
