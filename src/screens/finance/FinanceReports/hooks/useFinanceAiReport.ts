'use client';

import type { AiReportStage } from 'src/screens/academic/curriculum-management/reports/ai-report-workflow-types';
import type {
  FinanceReportRequest,
  FinanceReportPreview,
  FinanceAiClarificationAnswer,
  FinanceAiClarificationQuestion,
} from 'src/redux/finance/reports/financeReportsApi';

import { useState } from 'react';
import { getAcademicReportErrorMessage } from 'src/screens/academic/curriculum-management/reports/ai-report-utils';
import {
  useCreateFinanceAiPlanMutation,
  usePreviewFinanceReportMutation,
  useCreateFinanceReportExportMutation,
} from 'src/redux/finance/reports/financeReportsApi';

export type FinanceAiReview = {
  plan: FinanceReportRequest;
  preview: FinanceReportPreview;
  interpretedRequest: string;
  summary: string;
  permissionSummary: string;
  assumptions: string[];
  confidence: number;
};

export function useFinanceAiReport(onExportQueued: (jobId: string) => void) {
  const [stage, setStage] = useState<AiReportStage>('idle');
  const [prompt, setPrompt] = useState('');
  const [answers, setAnswers] = useState<FinanceAiClarificationAnswer[]>([]);
  const [questions, setQuestions] = useState<FinanceAiClarificationQuestion[]>([]);
  const [review, setReview] = useState<FinanceAiReview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createPlan] = useCreateFinanceAiPlanMutation();
  const [previewReport] = usePreviewFinanceReportMutation();
  const [createExport] = useCreateFinanceReportExportMutation();

  const previewPlan = async (
    plan: FinanceReportRequest,
    metadata: Omit<FinanceAiReview, 'plan' | 'preview'>
  ) => {
    setStage('previewing');
    const preview = await previewReport(plan).unwrap();
    setReview({ plan, preview, ...metadata });
    setStage('planned');
  };

  const planReport = async (
    nextPrompt: string,
    nextAnswers: FinanceAiClarificationAnswer[] = answers
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
      setErrorMessage(
        getAcademicReportErrorMessage(error, 'ShikshaMitra AI could not prepare this Finance report.')
      );
      setStage('failed');
    }
  };

  const submitClarifications = async (nextAnswers: FinanceAiClarificationAnswer[]) => {
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
      setErrorMessage(getAcademicReportErrorMessage(error, 'The updated Finance plan is not valid.'));
      setStage('failed');
    }
  };

  const generate = async () => {
    if (!review) return;
    setStage('generating');
    setErrorMessage(null);
    try {
      const response = await createExport(review.plan).unwrap();
      setStage('ready');
      onExportQueued(response.jobId);
    } catch (error: unknown) {
      setErrorMessage(getAcademicReportErrorMessage(error, 'The Finance export could not be queued.'));
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
  };

  return {
    stage, questions, review, errorMessage,
    planReport, submitClarifications, changeFormat, generate, reset,
  };
}
