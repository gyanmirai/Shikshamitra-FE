'use client';

import type { AiReportStage } from 'src/screens/academic/curriculum-management/reports/ai-report-workflow-types';
import type {
  HrReportRequest,
  HrReportPreview,
  HrAiReportClarificationAnswer,
  HrAiReportClarificationQuestion,
} from 'src/redux/hr/hrReportsApi';

import { useState } from 'react';
import { getAcademicReportErrorMessage } from 'src/screens/academic/curriculum-management/reports/ai-report-utils';
import {
  usePreviewHrReportMutation,
  useCreateHrReportExportMutation,
  useCreateHrAiReportPlanMutation,
} from 'src/redux/hr/hrReportsApi';

export type HrAiReportReview = {
  plan: HrReportRequest;
  preview: HrReportPreview;
  interpretedRequest: string;
  summary: string;
  permissionSummary: string;
  assumptions: string[];
  confidence: number;
};

export function useHrAiReport(onExportQueued: (jobId: string) => void) {
  const [stage, setStage] = useState<AiReportStage>('idle');
  const [prompt, setPrompt] = useState('');
  const [answers, setAnswers] = useState<HrAiReportClarificationAnswer[]>([]);
  const [questions, setQuestions] = useState<HrAiReportClarificationQuestion[]>([]);
  const [review, setReview] = useState<HrAiReportReview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [queuedJobId, setQueuedJobId] = useState<string | null>(null);
  const [createPlan] = useCreateHrAiReportPlanMutation();
  const [previewReport] = usePreviewHrReportMutation();
  const [createExport] = useCreateHrReportExportMutation();

  const previewPlan = async (
    plan: HrReportRequest,
    metadata: Omit<HrAiReportReview, 'plan' | 'preview'>
  ) => {
    setStage('previewing');
    const preview = await previewReport({ ...plan, page: 1, pageSize: 5 }).unwrap();
    setReview({ plan, preview, ...metadata });
    setStage('planned');
  };

  const planReport = async (
    nextPrompt: string,
    nextAnswers: HrAiReportClarificationAnswer[] = answers
  ) => {
    setStage('planning');
    setErrorMessage(null);
    try {
      const response = await createPlan({
        prompt: nextPrompt,
        clarificationAnswers: nextAnswers,
      }).unwrap();
      setPrompt(nextPrompt);
      setAnswers(nextAnswers);
      if (response.status === 'NeedsClarification' || !response.plan) {
        setQuestions(response.clarificationQuestions);
        setStage('clarifying');
        return;
      }
      setQuestions([]);
      await previewPlan(response.plan, {
        interpretedRequest: response.interpretedRequest,
        summary: response.summary,
        permissionSummary: response.permissionSummary,
        assumptions: response.assumptions,
        confidence: response.confidence,
      });
    } catch (error: unknown) {
      setErrorMessage(getAcademicReportErrorMessage(error, 'ShikshaMitra AI could not prepare this HR report.'));
      setStage('failed');
    }
  };

  const submitClarifications = async (nextAnswers: HrAiReportClarificationAnswer[]) => {
    await planReport(prompt, [...answers, ...nextAnswers]);
  };

  const changeFormat = async (format: 'pdf' | 'excel') => {
    if (!review) return;
    setErrorMessage(null);
    try {
      await previewPlan({ ...review.plan, format }, {
        interpretedRequest: review.interpretedRequest,
        summary: review.summary,
        permissionSummary: review.permissionSummary,
        assumptions: review.assumptions,
        confidence: review.confidence,
      });
    } catch (error: unknown) {
      setErrorMessage(getAcademicReportErrorMessage(error, 'The updated HR report plan is not valid.'));
      setStage('failed');
    }
  };

  const generate = async () => {
    if (!review) return;
    setStage('generating');
    setErrorMessage(null);
    try {
      const response = await createExport({ ...review.plan, page: 1, pageSize: 50 }).unwrap();
      setQueuedJobId(response.jobId);
      setStage('ready');
      onExportQueued(response.jobId);
    } catch (error: unknown) {
      setErrorMessage(getAcademicReportErrorMessage(error, 'The HR report could not be queued.'));
      setStage('failed');
    }
  };

  const reset = () => {
    setStage('idle');
    setPrompt('');
    setAnswers([]);
    setQuestions([]);
    setReview(null);
    setErrorMessage(null);
    setQueuedJobId(null);
  };

  return {
    stage,
    prompt,
    questions,
    review,
    errorMessage,
    queuedJobId,
    planReport,
    submitClarifications,
    changeFormat,
    generate,
    reset,
  };
}
