'use client';

import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowValidationResult,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { isEqual } from 'src/utils/helper';
import { useRef, useState, useEffect } from 'react';

import { createStage } from '../../workflow-builder-utils';
import { isApplicationStageType } from '../workflow-stage-configuration';
import { getSequentialAppendRoute } from '../workflow-route-diagnostics';
import { useAdmissionUnsavedChanges } from '../../use-admission-unsaved-changes';
import { type WorkflowTemplateId, getAdmissionWorkflowTemplate } from '../../workflow-template';

import type { WorkflowSidePanel } from '../workflow-builder-types';

type WorkflowSnapshot = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
};

export function useWorkflowBuilderDraft(
  workflow: AdmissionWorkflow | undefined,
  initialPanel: WorkflowSidePanel
) {
  const [stages, setStages] = useState<AdmissionWorkflowStage[]>([]);
  const [transitions, setTransitions] = useState<AdmissionWorkflowTransition[]>([]);
  const [defaultInquiryFormDefinitionId, setDefaultInquiryFormDefinitionId] = useState<
    string | null
  >(null);
  const [loadedStamp, setLoadedStamp] = useState('');
  const observedWorkflow = useRef<AdmissionWorkflow | undefined>(undefined);
  const [dirty, setDirty] = useState(false);
  const [editingStage, setEditingStage] = useState<AdmissionWorkflowStage | null>(null);
  const [editingTransition, setEditingTransition] = useState<AdmissionWorkflowTransition | null>(
    null
  );
  const [stageDrawerOpen, setStageDrawerOpen] = useState(false);
  const [transitionDrawerOpen, setTransitionDrawerOpen] = useState(false);
  const [sidePanel, setSidePanel] = useState<WorkflowSidePanel>(initialPanel);
  const [validation, setValidation] = useState<AdmissionWorkflowValidationResult | null>(null);
  const [stageToDelete, setStageToDelete] = useState<AdmissionWorkflowStage | null>(null);
  const [history, setHistory] = useState<{
    past: WorkflowSnapshot[];
    future: WorkflowSnapshot[];
  }>({ past: [], future: [] });
  useAdmissionUnsavedChanges(true, dirty);

  useEffect(() => {
    // A save updates loadedStamp before its invalidated query finishes refetching.
    // Do not reapply that unchanged, older query snapshot on the local state update.
    if (!workflow || workflow === observedWorkflow.current) return;
    const previous = observedWorkflow.current;
    observedWorkflow.current = workflow;
    if (workflow.concurrencyStamp === loadedStamp) return;
    // Successful validation updates governance metadata without changing the journey.
    // Refresh its concurrency stamp while retaining the result and any local edits.
    if (
      previous?.id === workflow.id &&
      isEqual(previous.stages, workflow.stages) &&
      isEqual(previous.transitions, workflow.transitions) &&
      previous.defaultInquiryFormDefinitionId === workflow.defaultInquiryFormDefinitionId
    ) {
      setLoadedStamp(workflow.concurrencyStamp);
      return;
    }
    setStages([...workflow.stages].sort((left, right) => left.displayOrder - right.displayOrder));
    setTransitions(workflow.transitions);
    setDefaultInquiryFormDefinitionId(workflow.defaultInquiryFormDefinitionId ?? null);
    setLoadedStamp(workflow.concurrencyStamp);
    setDirty(false);
    setValidation(null);
    setHistory({ past: [], future: [] });
  }, [loadedStamp, workflow]);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [dirty]);

  const issueCountByStage = (validation?.issues ?? []).reduce<Record<string, number>>(
    (result, issue) => {
      if (issue.stageId) result[issue.stageId] = (result[issue.stageId] ?? 0) + 1;
      return result;
    },
    {}
  );
  const markDirty = () => {
    setValidation(null);
    setDirty(true);
  };
  const recordHistory = () => {
    const snapshot = { stages, transitions };
    setHistory((current) => ({
      past: [...current.past, snapshot].slice(-30),
      future: [],
    }));
  };
  const restoreSnapshot = (snapshot: WorkflowSnapshot) => {
    setStages(snapshot.stages);
    setTransitions(snapshot.transitions);
    markDirty();
  };
  const undo = () => {
    const previous = history.past.at(-1);
    if (!previous) return;
    setHistory((current) => ({
      past: current.past.slice(0, -1),
      future: [{ stages, transitions }, ...current.future].slice(0, 30),
    }));
    restoreSnapshot(previous);
  };
  const redo = () => {
    const next = history.future[0];
    if (!next) return;
    setHistory((current) => ({
      past: [...current.past, { stages, transitions }].slice(-30),
      future: current.future.slice(1),
    }));
    restoreSnapshot(next);
  };
  const addStage = (stageTypes: AdmissionWorkflowStageTypeMetadata[]) => {
    const metadata = stageTypes.find(
      (item) =>
        isApplicationStageType(item.type) && item.isRuntimeReady && item.isSelectable !== false
    );
    if (!metadata) return;
    setEditingStage(
      createStage(metadata, stages.length, !stages.some((stage) => stage.isEntryStage), stages)
    );
    setStageDrawerOpen(true);
  };
  const saveStage = (stage: AdmissionWorkflowStage, autoConnect = true) => {
    recordHistory();
    if (autoConnect && workflow?.stages.length === 0 && workflow.transitions.length === 0) {
      const next = getSequentialAppendRoute(stages, transitions, stage);
      if (next) setTransitions((current) => [...current, next]);
    }
    setStages((current) => {
      const normalized = stage.isEntryStage
        ? current.map((item) => ({ ...item, isEntryStage: false }))
        : current;
      return normalized.some((item) => item.id === stage.id)
        ? normalized.map((item) => (item.id === stage.id ? stage : item))
        : [...normalized, stage];
    });
    markDirty();
  };
  const deleteStage = (stageId: string) => {
    recordHistory();
    setStages((current) =>
      current
        .filter((stage) => stage.id !== stageId)
        .map((stage, index) => ({ ...stage, displayOrder: index }))
    );
    setTransitions((current) =>
      current.filter(
        (transition) => transition.fromStageId !== stageId && transition.toStageId !== stageId
      )
    );
    markDirty();
  };
  const saveTransition = (transition: AdmissionWorkflowTransition) => {
    recordHistory();
    setTransitions((current) => {
      const normalized = transition.isDefault
        ? current.map((item) =>
            item.fromStageId === transition.fromStageId ? { ...item, isDefault: false } : item
          )
        : current;
      return normalized.some((item) => item.id === transition.id)
        ? normalized.map((item) => (item.id === transition.id ? transition : item))
        : [...normalized, transition];
    });
    markDirty();
  };
  const applyWorkflowTemplate = (
    templateId: WorkflowTemplateId,
    formDefinitionId: string,
    inquiryFormDefinitionId: string | null
  ) => {
    recordHistory();
    const template = getAdmissionWorkflowTemplate(templateId, formDefinitionId);
    setStages(template.stages);
    setTransitions(template.transitions);
    setDefaultInquiryFormDefinitionId(inquiryFormDefinitionId);
    setValidation(null);
    setDirty(true);
  };

  return {
    stages,
    setStages,
    transitions,
    setTransitions,
    defaultInquiryFormDefinitionId,
    setDefaultInquiryFormDefinitionId,
    loadedStamp,
    setLoadedStamp,
    dirty,
    setDirty,
    markDirty,
    editingStage,
    setEditingStage,
    editingTransition,
    setEditingTransition,
    stageDrawerOpen,
    setStageDrawerOpen,
    transitionDrawerOpen,
    setTransitionDrawerOpen,
    sidePanel,
    setSidePanel,
    validation,
    setValidation,
    stageToDelete,
    setStageToDelete,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    recordHistory,
    undo,
    redo,
    issueCountByStage,
    addStage,
    saveStage,
    deleteStage,
    saveTransition,
    applyWorkflowTemplate,
  };
}
