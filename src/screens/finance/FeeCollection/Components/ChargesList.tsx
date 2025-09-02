import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';

import { Box, Checkbox, Typography } from '@mui/material';

import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import { Label } from 'src/components/label';

import type { IFeeCharge } from './type';

interface ChargesListProps {
  charges?: IFeeCharge[] | null;
  selectedCharges: string[];
  toggleSelect: (id: string[]) => void;
}

const ChargesList: React.FC<ChargesListProps> = ({ charges, selectedCharges, toggleSelect }) => {
  const [charge, setCharge] = useState<string[]>([]);

  const onChangeCharge = (selectedId: string) => {
    const newSelected = selectedCharges.includes(selectedId)
      ? selectedCharges.filter((c) => c !== selectedId) // remove
      : [...selectedCharges, selectedId]; // add
    toggleSelect(newSelected); // notify parent too
  };

  return (
    <Box mt={2}>
      <Typography variant="subtitle1" fontWeight={600} color="error" mb={1}>
        Charges
      </Typography>

      {charges?.map((ch) => (
        <Box
          key={ch.id}
          sx={{
            border: '1px solid #f28c82', // red highlight for charges
            borderRadius: 2,
            mb: 1.5,
            overflow: 'hidden',
          }}
        >
          {/* Row */}
          <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Checkbox
                checked={selectedCharges.includes(ch.id)}
                onChange={() => onChangeCharge(ch.id)}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {ch.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Due: {ch.dueDate}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Typography fontWeight={600}>
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
};

export default ChargesList;
