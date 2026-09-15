'use client';

import type { LibraryReportPreview } from 'src/redux/library/library-adapters';
import type { AiReportStage } from 'src/screens/academic/curriculum-management/reports/ai-report-workflow-types';
import type {
  LibraryReportRequest,
  LibraryAiClarificationAnswer,
  LibraryAiClarificationQuestion,
} from 'src/redux/library/reports-api';

import { useState } from 'react';
import { getAcademicReportErrorMessage } from 'src/screens/academic/curriculum-management/reports/ai-report-utils';
import {
  usePreviewLibraryReportMutation,
  useCreateLibraryAiReportPlanMutation,
  useCreateLibraryReportExportMutation,
} from 'src/redux/library/reports-api';

export type LibraryAiReview = {
  plan: LibraryReportRequest;
  preview: LibraryReportPreview;
  interpretedRequest: string;
  summary: string;
  permissionSummary: string;
  assumptions: string[];
  confidence: number;
};

export function useLibraryAiReport(onExportQueued: (jobId: string) => void) {
  const [stage, setStage] = useState<AiReportStage>('idle');
  const [prompt, setPrompt] = useState('');
  const [answers, setAnswers] = useState<LibraryAiClarificationAnswer[]>([]);
  const [questions, setQuestions] = useState<LibraryAiClarificationQuestion[]>([]);
  const [review, setReview] = useState<LibraryAiReview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createPlan] = useCreateLibraryAiReportPlanMutation();
  const [previewReport] = usePreviewLibraryReportMutation();
  const [createExport] = useCreateLibraryReportExportMutation();

  const previewPlan = async (
    plan: LibraryReportRequest,
    metadata: Omit<LibraryAiReview, 'plan' | 'preview'>
  ) => {
    setStage('previewing');
    const preview = await previewReport(plan).unwrap();
    setReview({ plan, preview, ...metadata });
    setStage('planned');
  };

  const planReport = async (
    nextPrompt: string,
    nextAnswers: LibraryAiClarificationAnswer[] = answers
  ) => {
    setStage('planning');
    setErrorMessage(null);
    try {
      const response = await createPlan({ prompt: nextPrompt, clarificationAnswers: nextAnswers }).unwrap();
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
        getAcademicReportErrorMessage(error, 'ShikshaMitra AI could not prepare this Library report.')
      );
      setStage('failed');
    }
  };

  const submitClarifications = async (nextAnswers: LibraryAiClarificationAnswer[]) => {
    await planReport(prompt, [...answers, ...nextAnswers]);
  };

  const changeFormat = async (format: 'pdf' | 'excel') => {
    if (!review) return;
    setErrorMessage(null);
    try {
      await previewPlan(
        { ...review.plan, format },
        {
          interpretedRequest: review.interpretedRequest,
          summary: review.summary,
          permissionSummary: review.permissionSummary,
          assumptions: review.assumptions,
          confidence: review.confidence,
        }
      );
    } catch (error: unknown) {
      setErrorMessage(getAcademicReportErrorMessage(error, 'The updated Library plan is not valid.'));
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
      setErrorMessage(getAcademicReportErrorMessage(error, 'The Library export could not be queued.'));
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
    stage,
    questions,
    review,
    errorMessage,
    planReport,
    submitClarifications,
    changeFormat,
    generate,
    reset,
  };
}
