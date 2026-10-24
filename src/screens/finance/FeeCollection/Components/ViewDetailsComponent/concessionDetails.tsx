import type { ConcessionDetail } from 'src/redux/feeCollection/feeCollection';

import { Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

export default function ConcessionsCard({ concessions }: { concessions?: ConcessionDetail[] }) {
  return (
    <DetailSection
      title="Concessions"
      icon="mdi:tag-outline"
      helpText="Approved concession amounts for this academic year, after concession reversals."
    >
      {concessions?.length ? (
        <DetailGrid>
          {concessions.map((item, index) => (
            <DetailField
              key={index}
              label={item.concessionTypeName}
              value={formatNumber(item.amount ?? 0, 'INR')}
            />
          ))}
        </DetailGrid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No concessions applied.
        </Typography>
      )}
    </DetailSection>
  );
}
