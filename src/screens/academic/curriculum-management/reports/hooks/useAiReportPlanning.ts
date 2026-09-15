'use client';

import type { RootState } from 'src/redux/store';
import type {
  AcademicAiReportModule,
  AcademicDynamicReportSpec,
  AcademicAiReportPlanRequest,
  AcademicAiReportClarificationAnswer,
  AcademicAiReportClarificationQuestion,
} from 'src/redux/academicAPI/AcademicReportApi';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useCreateAcademicReportAiPlanMutation,
  useCreateAcademicReportAiPreviewMutation,
} from 'src/redux/academicAPI/AcademicReportApi';

import { getAcademicReportErrorMessage } from '../ai-report-utils';

import type { AiReportStage, AiReportReview } from '../ai-report-workflow-types';

export function useAiReportPlanning(module: AcademicAiReportModule = 'Curriculum') {
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );
  const [stage, setStage] = useState<AiReportStage>('idle');
  const [request, setRequest] = useState<AcademicAiReportPlanRequest | null>(null);
  const [review, setReview] = useState<AiReportReview | null>(null);
  const [questions, setQuestions] = useState<AcademicAiReportClarificationQuestion[]>([]);
  const [approvalToken, setApprovalToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createAiPlan, { isLoading: isPlanning }] = useCreateAcademicReportAiPlanMutation();
  const [createPreview, { isLoading: isPreviewing }] = useCreateAcademicReportAiPreviewMutation();

  const previewPlan = async (
    plan: AcademicDynamicReportSpec,
    planRequest: AcademicAiReportPlanRequest,
    assumptions: string[],
    confidence: number
  ) => {
    setStage('previewing');
    const response = await createPreview({
      academicYearId: planRequest.academicYearId,
      educationBoardId: planRequest.educationBoardId,
      educationMediumId: planRequest.educationMediumId,
      module: planRequest.module,
      plan,
    }).unwrap();
    setReview({
      plan: response.plan,
      preview: response.preview,
      permissionSummary: response.permissionSummary,
      assumptions,
      confidence,
    });
    setApprovalToken(response.approvalToken);
    setStage('planned');
  };

  const planReport = async (
    prompt: string,
    answers: AcademicAiReportClarificationAnswer[] = []
  ) => {
    setStage('planning');
    setErrorMessage(null);
    setApprovalToken(null);
    if (!currentYear?.id || !currentBoard?.id || !currentMedium?.id) {
      setErrorMessage('Select an Academic Year, Board, and Medium before creating the report.');
      setStage('failed');
      return;
    }
    const nextRequest: AcademicAiReportPlanRequest = {
      prompt,
      academicYearId: currentYear.id,
      educationBoardId: currentBoard.id,
      educationMediumId: currentMedium.id,
      module,
      clarificationAnswers: answers,
    };
    try {
      const response = await createAiPlan(nextRequest).unwrap();
      setRequest(nextRequest);
      if (response.status === 'NeedsClarification' || !response.plan) {
        setQuestions(response.clarificationQuestions);
        setStage('clarifying');
        return;
      }
      setQuestions([]);
      await previewPlan(response.plan, nextRequest, response.assumptions, response.confidence);
    } catch (error: unknown) {
      setErrorMessage(
        getAcademicReportErrorMessage(error, 'ShikshaMitra AI could not prepare this report.')
      );
      setStage('failed');
    }
  };

  const submitClarifications = async (answers: AcademicAiReportClarificationAnswer[]) => {
    if (request) {
      await planReport(request.prompt, [...request.clarificationAnswers, ...answers]);
    }
  };

  const changeFormat = async (format: AcademicDynamicReportSpec['format']) => {
    if (!review || !request) return;
    try {
      await previewPlan({ ...review.plan, format }, request, review.assumptions, review.confidence);
    } catch (error: unknown) {
      setErrorMessage(
        getAcademicReportErrorMessage(error, 'The updated report plan is not valid.')
      );
      setStage('failed');
    }
  };

  const resetPlanning = () => {
    setStage('idle');
    setRequest(null);
    setReview(null);
    setQuestions([]);
    setApprovalToken(null);
    setErrorMessage(null);
  };

  return {
    stage,
    setStage,
    request,
    review,
    questions,
    approvalToken,
    errorMessage,
    setErrorMessage,
    isPlanning,
    isPreviewing,
    planReport,
    submitClarifications,
    changeFormat,
    resetPlanning,
  };
}
