'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowValidationResult,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useState, useEffect } from 'react';

import { createStage, reorderStages } from '../../workflow-builder-utils';
import { getRegistrationWorkflowTemplate } from '../../workflow-template';
import { useAdmissionUnsavedChanges } from '../../use-admission-unsaved-changes';

import type { WorkflowSidePanel } from '../workflow-builder-types';

export function useWorkflowBuilderDraft(
  workflow: AdmissionWorkflow | undefined,
  initialPanel: WorkflowSidePanel
) {
  const [stages, setStages] = useState<AdmissionWorkflowStage[]>([]);
  const [transitions, setTransitions] = useState<AdmissionWorkflowTransition[]>([]);
  const [loadedStamp, setLoadedStamp] = useState('');
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
  useAdmissionUnsavedChanges(true, dirty);

  useEffect(() => {
    if (!workflow || workflow.concurrencyStamp === loadedStamp) return;
    setStages([...workflow.stages].sort((left, right) => left.displayOrder - right.displayOrder));
    setTransitions(workflow.transitions);
    setLoadedStamp(workflow.concurrencyStamp);
    setDirty(false);
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
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setStages((current) => reorderStages(current, String(active.id), String(over.id)));
    setDirty(true);
  };
  const addStage = (stageTypes: AdmissionWorkflowStageTypeMetadata[]) => {
    const metadata = stageTypes.find((item) => item.isRuntimeReady);
    if (!metadata) return;
    setEditingStage(
      createStage(metadata, stages.length, !stages.some((stage) => stage.isEntryStage))
    );
    setStageDrawerOpen(true);
  };
  const saveStage = (stage: AdmissionWorkflowStage) => {
    setStages((current) => {
      const normalized = stage.isEntryStage
        ? current.map((item) => ({ ...item, isEntryStage: false }))
        : current;
      return normalized.some((item) => item.id === stage.id)
        ? normalized.map((item) => (item.id === stage.id ? stage : item))
        : [...normalized, stage];
    });
    setDirty(true);
  };
  const deleteStage = (stageId: string) => {
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
    setDirty(true);
  };
  const saveTransition = (transition: AdmissionWorkflowTransition) => {
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
    setDirty(true);
  };
  const applyRegistrationTemplate = (formDefinitionId?: string) => {
    const template = getRegistrationWorkflowTemplate(formDefinitionId);
    setStages(template.stages);
    setTransitions(template.transitions);
    setValidation(null);
    setDirty(true);
  };

  return {
    stages,
    setStages,
    transitions,
    setTransitions,
    loadedStamp,
    setLoadedStamp,
    dirty,
    setDirty,
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
    issueCountByStage,
    handleDragEnd,
    addStage,
    saveStage,
    deleteStage,
    saveTransition,
    applyRegistrationTemplate,
  };
}
