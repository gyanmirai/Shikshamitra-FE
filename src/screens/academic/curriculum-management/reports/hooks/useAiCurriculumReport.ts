'use client';

import type {
  AcademicAiReportPlanRequest,
  AcademicDynamicReportSpec,
  AcademicAiReportExportResponse,
} from 'src/redux/academicAPI/AcademicReportApi';
import type { RootState } from 'src/redux/store';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useCreateAcademicReportAiPlanMutation,
  useLazyGetAcademicReportExportJobQuery,
  useCreateAcademicReportAiExportMutation,
} from 'src/redux/academicAPI/AcademicReportApi';

import { startAcademicReportDownload, getAcademicReportErrorMessage } from '../ai-report-utils';

export type AiReportStage =
  'idle' | 'planning' | 'planned' | 'generating' | 'queued' | 'processing' | 'ready' | 'failed';

export function useAiCurriculumReport() {
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );
  const [stage, setStage] = useState<AiReportStage>('idle');
  const [result, setResult] = useState<AcademicAiReportExportResponse | null>(null);
  const [plan, setPlan] = useState<AcademicDynamicReportSpec | null>(null);
  const [request, setRequest] = useState<AcademicAiReportPlanRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollTick, setPollTick] = useState(0);
  const [createAiPlan, { isLoading: isPlanning }] = useCreateAcademicReportAiPlanMutation();
  const [createAiExport, { isLoading: isGenerating }] = useCreateAcademicReportAiExportMutation();
  const [getJob] = useLazyGetAcademicReportExportJobQuery();
  const isDownloading = false;

  useEffect(() => {
    if (!result?.jobId || !['queued', 'processing'].includes(stage)) return undefined;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const job = await getJob({ jobId: result.jobId }, false).unwrap();
        if (cancelled) return;

        if (job.status === 'Completed') {
          setStage('ready');
        } else if (job.status === 'Failed') {
          setErrorMessage(job.errorMessage || 'The report could not be generated.');
          setStage('failed');
        } else {
          setStage(job.status === 'Processing' ? 'processing' : 'queued');
          setPollTick((current) => current + 1);
        }
      } catch {
        if (!cancelled) setPollTick((current) => current + 1);
      }
    }, 2000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [getJob, pollTick, result?.jobId, stage]);

  const planReport = async (prompt: string) => {
    setStage('planning');
    setErrorMessage(null);
    setResult(null);
    setPlan(null);
    setPollTick(0);

    if (!currentYear?.id || !currentBoard?.id || !currentMedium?.id) {
      setErrorMessage('Select an Academic Year, Board, and Medium before creating the report.');
      setStage('failed');
      return;
    }

    const aiRequest: AcademicAiReportPlanRequest = {
      prompt,
      academicYearId: currentYear.id,
      educationBoardId: currentBoard.id,
      educationMediumId: currentMedium.id,
      module: 'Curriculum',
    };

    try {
      const response = await createAiPlan(aiRequest).unwrap();
      setRequest(aiRequest);
      setPlan(response.plan);
      setStage('planned');
    } catch (error: unknown) {
      setErrorMessage(
        getAcademicReportErrorMessage(error, 'ShikshaMitra AI could not prepare this report.')
      );
      setStage('failed');
    }
  };

  const generate = async () => {
    if (!request || !plan) return;

    setStage('generating');
    setErrorMessage(null);
    try {
      const response = await createAiExport({
        ...request,
        plan,
      }).unwrap();
      setResult(response);
      setStage(response.status === 'Processing' ? 'processing' : 'queued');
    } catch (error: unknown) {
      setErrorMessage(
        getAcademicReportErrorMessage(error, 'ShikshaMitra AI could not prepare this report.')
      );
      setStage('failed');
    }
  };

  const download = () => {
    if (!result?.jobId) return;

    try {
      startAcademicReportDownload(result.jobId);
      shikshaMitraToast.success({ message: 'Your AI-generated report download has started.' });
    } catch (error: unknown) {
      shikshaMitraToast.error({
        message: getAcademicReportErrorMessage(error, 'The report download failed.'),
      });
    }
  };

  const reset = () => {
    setStage('idle');
    setResult(null);
    setPlan(null);
    setRequest(null);
    setErrorMessage(null);
    setPollTick(0);
  };

  return {
    stage,
    plan,
    result,
    errorMessage,
    isPlanning,
    isGenerating,
    isDownloading,
    planReport,
    generate,
    download,
    reset,
  };
}
