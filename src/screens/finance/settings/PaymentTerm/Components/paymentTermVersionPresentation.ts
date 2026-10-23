import type { PolicyVersion } from 'src/screens/finance/policies/hooks/useFinancePolicyVersion';
import type {
  PaymentTermVersionResponse,
  PaymentTermVersionHistoryItem,
} from 'src/redux/finance/paymentTerm';

import { fDate } from 'src/utils/format-time';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';

import { getDemandGenerationRuleLabel, getHolidayShiftingMethodLabel } from '../paymentTermLabels';

// Compare recorded schedule facts. Identity/default fields belong to the term, not a version.
const calendarDate = (value?: string) => {
  const date = toDateOnly(parseDateOnly(value));
  return date ? fDate(date, 'DD-MM-YYYY') : null;
};

const snapshotFields = (version: PaymentTermVersionResponse): Record<string, unknown> => {
  const fields: Record<string, unknown> = {
    Version: version.versionNumber,
    InvoiceDateRule: getDemandGenerationRuleLabel(version.demandGenerationRule),
    DaysBeforeDue: version.demandOffsetDays ?? null,
    HolidayShift: getHolidayShiftingMethodLabel(version.holidayShiftingMethod),
    EffectiveFrom: toDateOnly(parseDateOnly(version.effectiveFrom)) || null,
    EffectiveTo: toDateOnly(parseDateOnly(version.effectiveTo)) || null,
    Installments: version.installments.length,
  };
  [...version.installments]
    .sort((a, b) => a.sequence - b.sequence)
    .forEach((item) => {
      const prefix = `Installment ${item.sequence} · `;
      Object.entries({
        Name: item.name,
        'Start date': calendarDate(item.coverageStartDate),
        'End date': calendarDate(item.coverageEndDate),
        'Invoice date': calendarDate(item.demandDate),
        'Due date': calendarDate(item.dueDate),
        'Allocation percentage': item.allocationPercentage,
        'Invoice creation': item.demandEnabled,
        Reminders: item.reminderEnabled,
        'Reminder date': calendarDate(item.reminderDate),
        'Partial payment override': item.allowPartialOverride ?? null,
        'Grace period days override': item.gracePeriodDaysOverride ?? null,
      }).forEach(([field, value]) => {
        fields[prefix + field] = value;
      });
    });
  return fields;
};

export function paymentTermVersionPresentation(
  versions: PaymentTermVersionResponse[],
  audits: PaymentTermVersionHistoryItem[] = []
): PolicyVersion[] {
  return [...versions]
    .sort((a, b) => b.versionNumber - a.versionNumber)
    .map((version) => {
      const previous = versions.find((item) => item.versionNumber === version.versionNumber - 1);
      const before = previous ? snapshotFields(previous) : {};
      const after = snapshotFields(version);
      const audit = audits.find(
        (item) => item.id === version.id || item.versionNumber === version.versionNumber
      );
      return {
        eventId: version.id,
        versionNumber: version.versionNumber,
        status: version.status,
        actor: audit
          ? audit.createdByName || (audit.creatorId ? 'Unknown user' : 'System')
          : 'Author unavailable',
        date: audit?.creationTime || version.publishedAt || '',
        createdAt: audit?.creationTime || '',
        action: audit?.changeAction || '',
        changeReason: audit?.changeReason || version.changeReason,
        summary: audit?.changeReason || version.changeReason || '',
        snapshotBefore: before,
        snapshotAfter: after,
        changedFields: [...new Set([...Object.keys(before), ...Object.keys(after)])]
          .filter(
            (field) =>
              JSON.stringify(before[field] ?? null) !== JSON.stringify(after[field] ?? null)
          )
          .map((field) => ({
            field,
            oldValue: before[field] ?? null,
            newValue: after[field] ?? null,
          })),
      };
    });
}
