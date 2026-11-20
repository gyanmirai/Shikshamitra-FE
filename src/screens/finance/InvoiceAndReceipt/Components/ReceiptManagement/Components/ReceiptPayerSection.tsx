import type { FeeReceiptDetail } from 'src/redux/invoiceAndReceipt/feeReceiptApi';

import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

export function ReceiptPayerSection({ receipt }: { receipt: FeeReceiptDetail }) {
  if (receipt.employeeId)
    return (
      <DetailSection
        title="Staff information"
        icon="mdi:account-tie-outline"
        helpText="Staff identity saved with the collection evidence."
      >
        <DetailGrid>
          <DetailField label="Staff name" value={receipt.payerName || 'Not recorded'} />
          <DetailField label="Staff code" value={receipt.payerCode} />
        </DetailGrid>
      </DetailSection>
    );
  if (!receipt.studentId && receipt.financeFeeAccountId)
    return (
      <DetailSection
        title="Applicant information"
        icon="mdi:account-outline"
        helpText="Applicant account associated with this receipt."
      >
        <DetailGrid>
          <DetailField label="Applicant name" value={receipt.payerName || receipt.studentName} />
        </DetailGrid>
      </DetailSection>
    );
  return (
    <DetailSection
      title="Student Information"
      icon="mdi:account-school-outline"
      helpText="Student and academic context associated with this receipt."
    >
      <DetailGrid>
        <DetailField label="Student name" value={receipt.payerName || receipt.studentName} />
        <DetailField label="GR number" value={receipt.grNo} />
        <DetailField
          label="Class / division"
          value={[receipt.className, receipt.division].filter(Boolean).join(' / ')}
        />
        <DetailField label="Roll number" value={receipt.rollNo} />
        <DetailField label="Board" value={receipt.boardName} />
        <DetailField label="Medium" value={receipt.mediumName} />
      </DetailGrid>
    </DetailSection>
  );
}
