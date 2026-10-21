import type { RootState } from 'src/redux/store';
import type { AcademicAiReportClarificationAnswer } from 'src/redux/academicAPI/AcademicReportApi';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useInstituteReportAiPlanMutation, useInstituteReportAiExportMutation, useInstituteReportAiPreviewMutation,
} from 'src/redux/InstituteSetup/instituteReportsApi';

import { reportError } from '../types';

import type { AiPlanResult, ReportPreview } from '../types';

export function useAiReport(onQueued: () => void) {
  const year = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const [plan, setPlan] = useState<AiPlanResult | null>(null);
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<AcademicAiReportClarificationAnswer[]>([]);
  const [makePlan, planning] = useInstituteReportAiPlanMutation();
  const [makePreview, previewing] = useInstituteReportAiPreviewMutation();
  const [makeExport, exporting] = useInstituteReportAiExportMutation();
  async function submit(prompt: string, clarification: AcademicAiReportClarificationAnswer[] = []) {
    setError(''); setPreview(null); setPlan(null);
    const nextAnswers = [...answers, ...clarification].slice(-6);
    setAnswers(nextAnswers);
    try {
      const result = await makePlan({ prompt, academicYearId: year, clarificationAnswers: nextAnswers }).unwrap();
      setPlan(result);
      if (result.status === 'Ready' && result.plan && result.approvalToken) {
        setPreview(await makePreview({ plan: result.plan, approvalToken: result.approvalToken }).unwrap());
      }
    } catch (failure) { setError(reportError(failure)); }
  }
  async function generate() {
    if (!plan?.plan || !plan.approvalToken) return;
    setError('');
    try {
      await makeExport({ plan: plan.plan, approvalToken: plan.approvalToken }).unwrap();
      onQueued();
    } catch (failure) { setError(reportError(failure)); }
  }
  function reset() { setPlan(null); setPreview(null); setAnswers([]); setError(''); }
  return { plan, preview, error, submit, generate, reset, busy: planning.isLoading || previewing.isLoading || exporting.isLoading,
    stage: planning.isLoading ? 'planning' as const : previewing.isLoading ? 'previewing' as const : exporting.isLoading ? 'creating' as const : null };
}
