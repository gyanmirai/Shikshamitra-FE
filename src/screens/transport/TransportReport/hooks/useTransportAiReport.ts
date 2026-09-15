'use client';

import type { AiReportStage } from 'src/screens/academic/curriculum-management/reports/ai-report-workflow-types';
import type {
  TransportReportResult,
  TransportAiClarificationAnswer,
  TransportAiReportExecutionPlan,
  TransportAiClarificationQuestion,
} from 'src/redux/transport/vehicle-management/dashboard-report-api';

import { useState } from 'react';
import { getAcademicReportErrorMessage } from 'src/screens/academic/curriculum-management/reports/ai-report-utils';
import {
  useLazyGetTransportReportQuery,
  useLazyExportTransportReportQuery,
  useCreateTransportAiReportPlanMutation,
} from 'src/redux/transport/vehicle-management/dashboard-report-api';

export type TransportAiReview = {
  plan: TransportAiReportExecutionPlan;
  preview: TransportReportResult;
  interpretedRequest: string;
  summary: string;
  permissionSummary: string;
  assumptions: string[];
  confidence: number;
};

type AcademicContext = {
  academicMediumId: string;
  academicYearId?: string;
};

const saveBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export function useTransportAiReport(
  context: AcademicContext,
  onGenerated: (plan: TransportAiReportExecutionPlan) => void
) {
  const [stage, setStage] = useState<AiReportStage>('idle');
  const [prompt, setPrompt] = useState('');
  const [answers, setAnswers] = useState<TransportAiClarificationAnswer[]>([]);
  const [questions, setQuestions] = useState<TransportAiClarificationQuestion[]>([]);
  const [review, setReview] = useState<TransportAiReview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createPlan] = useCreateTransportAiReportPlanMutation();
  const [previewReport] = useLazyGetTransportReportQuery();
  const [exportReport] = useLazyExportTransportReportQuery();

  const previewPlan = async (
    plan: TransportAiReportExecutionPlan,
    metadata: Omit<TransportAiReview, 'plan' | 'preview'>
  ) => {
    setStage('previewing');
    const preview = await previewReport(
      { reportKey: plan.reportKey, ...plan.query },
      false
    ).unwrap();
    setReview({ plan, preview, ...metadata });
    setStage('planned');
  };

  const planReport = async (
    nextPrompt: string,
    nextAnswers: TransportAiClarificationAnswer[] = answers
  ) => {
    setStage('planning');
    setErrorMessage(null);
    try {
      const response = await createPlan({
        prompt: nextPrompt,
        academicMediumId: context.academicMediumId,
        academicYearId: context.academicYearId,
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
        getAcademicReportErrorMessage(
          error,
          'ShikshaMitra AI could not prepare this Transport report.'
        )
      );
      setStage('failed');
    }
  };

  const submitClarifications = async (nextAnswers: TransportAiClarificationAnswer[]) => {
    await planReport(prompt, [...answers, ...nextAnswers]);
  };

  const generate = async () => {
    if (!review) return;
    setStage('generating');
    setErrorMessage(null);
    try {
      const blob = await exportReport({
        reportKey: review.plan.reportKey,
        ...review.plan.query,
      }).unwrap();
      saveBlob(blob, `${review.plan.reportKey}.csv`);
      onGenerated(review.plan);
      setStage('ready');
    } catch (error: unknown) {
      setErrorMessage(
        getAcademicReportErrorMessage(error, 'The Transport CSV could not be generated.')
      );
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
    generate,
    reset,
  };
}
