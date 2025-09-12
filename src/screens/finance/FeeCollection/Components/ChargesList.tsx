import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Box, Checkbox, Typography } from '@mui/material';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import type { ITerm, IFeeHead, IFeeCharge } from './type';

interface ChargesListProps {
  charges?: IFeeCharge[] | null;
  selectedCharges: (IFeeCharge | ITerm | IFeeHead)[];
  toggleSelect: (id: ITerm) => void;
}

const ChargesList: React.FC<ChargesListProps> = ({ charges, selectedCharges, toggleSelect }) => (
  // const onChangeCharge = (selectedId: string) => {
  //   const newSelected = selectedCharges.includes(selectedId)
  //     ? selectedCharges.filter((c) => c !== selectedId) // remove
  //     : [...selectedCharges, selectedId]; // add
  //   toggleSelect(newSelected); // notify parent too
  // };

  <Box mt={2}>
    {(charges ?? []).length > 0 && (
      <Typography variant="subtitle1" fontWeight={600} color="error" mb={1}>
        Charges - (₹ {charges?.reduce((sum, charge) => sum + charge.total, 0).toLocaleString()})
      </Typography>
    )}

    {charges?.map((ch, idx) => (
      <Box
        key={ch.id ?? idx}
        sx={{
          border: '1px solid #f28c82', // red highlight for charges
          borderRadius: 2,
          mb: 1.5,
          overflow: 'hidden',
        }}
      >
        {/* Row */}
        <Box display="flex" alignItems="center" justifyContent="space-between" p={1}>
          <Box display="flex" gap={1}>
            <Checkbox
              checked={selectedCharges?.some((t) => t.id === `charges${idx}`) || false}
              onChange={() => toggleSelect({ ...ch, id: `charges${idx}` } as any)}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {ch.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Due: {ch.dueDate}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontWeight={400}>
              ₹ {ch.paid.toLocaleString()} / ₹ {ch.total.toLocaleString()}
            </Typography>
            <Label
              color={
                FeeCollectionStatusTypeColors[
                  ch.status as unknown as FeeCollectionStatusType
                ] as LabelColor
              }
            >
              {FeeCollectionStatusType[ch.status as unknown as FeeCollectionStatusType]}
            </Label>
          </Box>
        </Box>
      </Box>
    ))}
  </Box>
);
export default ChargesList;
