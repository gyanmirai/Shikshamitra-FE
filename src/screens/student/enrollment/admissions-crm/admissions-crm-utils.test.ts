import { it, expect, describe } from 'vitest';
import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  type AdmissionCrmLeadDto,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  EntranceExamStatusEnum,
  AdmissionCrmMessageChannel,
  AdmissionCrmEligibilityDecision,
  AdmissionCrmExamAttendanceStatus,
  type AdmissionCrmEntranceExamDto,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import type { AdmissionCrmPipelineStageDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import {
  getAdmissionCrmKpis,
  getAdmissionCrmLeadName,
  getAdmissionCrmChannelLabel,
  buildAdmissionCrmBoardColumns,
  canRetryAdmissionCrmDeliveryLog,
  getAdmissionCrmStageTooltipLines,
  getAdmissionCrmMessageChannelLabel,
  getAdmissionCrmDeliveryLogStatusLabel,
  getAdmissionCrmRecipientForMessageChannel,
} from './admissions-crm-utils';

const makeLead = (id: string, stage: AdmissionInquiryStage): AdmissionCrmLeadDto => ({
  id,
  applicantNumber: 1,
  academicYearId: 'year-1',
  channel: AdmissionInquiryChannel.QuickCallEntry,
  firstName: id,
  admissionIntent: 'Admission inquiry',
  stage,
  leadScore: 0,
  priority: AdmissionCrmLeadPriority.None,
  lastActivityTime: '2026-07-10T00:00:00Z',
  likelyDuplicateCount: 0,
  likelyDuplicates: [],
});

const makeStage = (
  systemStage: AdmissionInquiryStage,
  displayOrder: number,
  isEnabled = true
): AdmissionCrmPipelineStageDto => ({
  id: `${systemStage}`,
  academicYearId: 'year-1',
  systemStage,
  stageName: `${systemStage}`,
  displayOrder,
  isEnabled,
  isSystem: true,
  allowedNextStages: [],
});

const makeExam = (
  id: string,
  eligibilityDecision: AdmissionCrmEligibilityDecision
): AdmissionCrmEntranceExamDto => ({
  id,
  academicYearId: 'year-1',
  leadId: `lead-${id}`,
  applicantNumber: 1,
  applicantName: `Applicant ${id}`,
  entranceExamSlotId: 'slot-1',
  examStartTime: '2026-07-12T10:00:00Z',
  examEndTime: '2026-07-12T12:00:00Z',
  examRoomNo: 101,
  capacityOverrideUsed: false,
  scheduledAt: '2026-07-10T00:00:00Z',
  attendanceStatus: AdmissionCrmExamAttendanceStatus.NotMarked,
  examStatus: EntranceExamStatusEnum.Pending,
  eligibilityDecision,
  eligibilityOverrideUsed: false,
});

describe('admissions CRM workspace utilities', () => {
  it('uses the configured quick inquiry language for the saved lead channel', () => {
    expect(getAdmissionCrmChannelLabel(AdmissionInquiryChannel.QuickCallEntry)).toBe(
      'Quick inquiry'
    );
  });

  it('groups leads by enabled pipeline stages in display order', () => {
    const columns = buildAdmissionCrmBoardColumns(
      [
        makeStage(AdmissionInquiryStage.ExamScheduled, 30),
        makeStage(AdmissionInquiryStage.NewInquiry, 10),
        makeStage(AdmissionInquiryStage.Archived, 90, false),
      ],
      [
        makeLead('lead-a', AdmissionInquiryStage.NewInquiry),
        makeLead('lead-b', AdmissionInquiryStage.ExamScheduled),
        makeLead('lead-c', AdmissionInquiryStage.Archived),
      ]
    );

    expect(columns.map((column) => column.stage.systemStage)).toEqual([
      AdmissionInquiryStage.NewInquiry,
      AdmissionInquiryStage.ExamScheduled,
    ]);
    expect(columns[0].leads.map((lead) => lead.id)).toEqual(['lead-a']);
    expect(columns[1].leads.map((lead) => lead.id)).toEqual(['lead-b']);
  });

  it('calculates workspace KPIs from lead and exam status', () => {
    expect(
      getAdmissionCrmKpis(
        [
          makeLead('lead-a', AdmissionInquiryStage.NewInquiry),
          makeLead('lead-b', AdmissionInquiryStage.ExamScheduled),
          makeLead('lead-c', AdmissionInquiryStage.Stale),
          makeLead('lead-d', AdmissionInquiryStage.Archived),
          makeLead('lead-e', AdmissionInquiryStage.Rejected),
        ],
        [
          makeExam('exam-a', AdmissionCrmEligibilityDecision.Eligible),
          makeExam('exam-b', AdmissionCrmEligibilityDecision.Waitlisted),
        ]
      )
    ).toEqual({
      totalLeadCount: 5,
      activeLeadCount: 3,
      examScheduledCount: 1,
      staleOrArchivedCount: 2,
      eligibleCount: 1,
    });
  });

  it('uses contact fallback when a lead does not have student name details', () => {
    expect(
      getAdmissionCrmLeadName({
        ...makeLead('lead-a', AdmissionInquiryStage.NewInquiry),
        firstName: undefined,
        parentGuardianName: undefined,
        primaryContactNo: '9988776655',
      })
    ).toBe('9988776655');
  });

  it('labels communication delivery logs and limits retry actions to failed or blocked states', () => {
    expect(getAdmissionCrmMessageChannelLabel(AdmissionCrmMessageChannel.Sms)).toBe('SMS');
    expect(getAdmissionCrmDeliveryLogStatusLabel('ProviderNotConfigured')).toBe(
      'Provider not configured'
    );
    expect(getAdmissionCrmDeliveryLogStatusLabel('CustomProviderState')).toBe(
      'CustomProviderState'
    );
    expect(canRetryAdmissionCrmDeliveryLog('Failed')).toBe(true);
    expect(canRetryAdmissionCrmDeliveryLog('ProviderNotConfigured')).toBe(true);
    expect(canRetryAdmissionCrmDeliveryLog('BlockedByOptOut')).toBe(true);
    expect(canRetryAdmissionCrmDeliveryLog('Delivered')).toBe(false);
  });

  it('builds pipeline stage tooltip lines from configured metadata', () => {
    expect(
      getAdmissionCrmStageTooltipLines({
        ...makeStage(AdmissionInquiryStage.FollowUp, 20),
        ownerResponsibility: 'Admissions counselor',
        slaTargetHours: 24,
        allowedNextStages: [AdmissionInquiryStage.ExamReady, AdmissionInquiryStage.Archived],
      })
    ).toEqual(['Owner: Admissions counselor', 'SLA: 24h', 'Next: Exam Ready, Archived']);
  });

  it('selects the correct lead recipient for each communication channel', () => {
    const lead = {
      ...makeLead('lead-a', AdmissionInquiryStage.NewInquiry),
      primaryContactNo: '9988776655',
      email: 'parent@example.test',
    };

    expect(
      getAdmissionCrmRecipientForMessageChannel(lead, AdmissionCrmMessageChannel.WhatsApp)
    ).toBe('9988776655');
    expect(getAdmissionCrmRecipientForMessageChannel(lead, AdmissionCrmMessageChannel.Sms)).toBe(
      '9988776655'
    );
    expect(getAdmissionCrmRecipientForMessageChannel(lead, AdmissionCrmMessageChannel.Email)).toBe(
      'parent@example.test'
    );
  });
});
