import dayjs from 'dayjs';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

export default function RequestorInfoCard({ charge }: { charge?: any }) {
  return (
    <DetailSection title="Requestor Details" icon="mdi:account-details-outline">
      <DetailGrid>
        <DetailField label="Name" value={charge?.requestor?.requestorName} />
        <DetailField label="Role" value={charge?.requestor?.requestorRole} />
        <DetailField
          label="Requested on"
          value={
            charge?.requestor?.requestedOn
              ? dayjs(charge.requestor.requestedOn).format('DD-MM-YYYY')
              : null
          }
        />
      </DetailGrid>
    </DetailSection>
  );
}
