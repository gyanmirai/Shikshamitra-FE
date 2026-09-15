'use client';

import type {
  AcademicAiReportModule,
  AcademicAiReportExportResponse,
} from 'src/redux/academicAPI/AcademicReportApi';

import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useCreateAcademicReportAiExportMutation } from 'src/redux/academicAPI/AcademicReportApi';

import { useAiReportPlanning } from './useAiReportPlanning';
import { useAiReportExportPolling } from './useAiReportExportPolling';
import { startAcademicReportDownload, getAcademicReportErrorMessage } from '../ai-report-utils';

export type { AiReportStage } from '../ai-report-workflow-types';

export function useAiCurriculumReport(module: AcademicAiReportModule = 'Curriculum') {
  const planning = useAiReportPlanning(module);
  const { stage, setStage, setErrorMessage } = planning;
  const [result, setResult] = useState<AcademicAiReportExportResponse | null>(null);
  const [createAiExport, { isLoading: isGenerating }] = useCreateAcademicReportAiExportMutation();
  const polling = useAiReportExportPolling(
    result?.jobId,
    stage === 'queued' || stage === 'processing'
  );

  useEffect(() => {
    if (!result?.jobId || polling.jobId !== result.jobId) return;
    if (polling.status === 'Completed') setStage('ready');
    else if (polling.status === 'Failed' || polling.status === 'Cancelled') {
      setErrorMessage(polling.errorMessage || 'The report could not be generated.');
      setStage('failed');
    } else if (polling.status === 'Running' || polling.status === 'Processing') {
      setStage('processing');
    }
  }, [
    polling.errorMessage,
    polling.jobId,
    polling.status,
    result?.jobId,
    setErrorMessage,
    setStage,
  ]);

  const generate = async () => {
    if (!planning.request || !planning.review || !planning.approvalToken) return;
    planning.setStage('generating');
    planning.setErrorMessage(null);
    const { request, review, approvalToken } = planning;
    try {
      const response = await createAiExport({
        prompt: request.prompt,
        academicYearId: request.academicYearId,
        educationBoardId: request.educationBoardId,
        educationMediumId: request.educationMediumId,
        module: request.module,
        plan: review.plan,
        approvalToken,
      }).unwrap();
      setResult(response);
      planning.setStage(
        response.status === 'Running' || response.status === 'Processing' ? 'processing' : 'queued'
      );
    } catch (error: unknown) {
      planning.setErrorMessage(
        getAcademicReportErrorMessage(error, 'ShikshaMitra AI could not generate this report.')
      );
      planning.setStage('failed');
    }
  };

  const download = () => {
    if (!result?.jobId) return;
    startAcademicReportDownload(result.jobId);
    shikshaMitraToast.success({ message: 'Your AI-generated report download has started.' });
  };

  const reset = () => {
    setResult(null);
    planning.resetPlanning();
  };

  return { ...planning, result, isGenerating, isDownloading: false, generate, download, reset };
}
