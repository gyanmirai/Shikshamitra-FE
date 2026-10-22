import { formatNumber } from 'src/utils/formate_number';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

type FeeOverviewProps = {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  concession: number;
};

export default function FeeOverview({
  total,
  paid,
  pending,
  overdue,
  concession,
}: FeeOverviewProps) {
  return (
    <DetailSection
      helpText="Fee totals and outstanding amounts for the selected academic year."
      title="Fee Overview"
      icon="mdi:cash-multiple"
    >
      <DetailGrid>
        <DetailField label="Total fee" value={formatNumber(total, 'INR')} />
        <DetailField label="Paid fee" value={formatNumber(paid, 'INR')} />
        <DetailField label="Pending fee" value={formatNumber(pending, 'INR')} />
        <DetailField label="Overdue fee" value={formatNumber(overdue, 'INR')} />
        <DetailField label="Concession" value={formatNumber(concession, 'INR')} />
      </DetailGrid>
    </DetailSection>
  );
}
