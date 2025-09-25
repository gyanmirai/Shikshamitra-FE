import React from 'react';
import { Box, Checkbox, Typography } from '@mui/material';

import type { ITerm, IFeeHead, IFeeCharge } from './type';

interface ChargesListProps {
  charges?: IFeeCharge[] | null;
  selectedCharges: (IFeeCharge | ITerm | IFeeHead)[];
  toggleSelect: (id: ITerm) => void;
}

const ChargesList: React.FC<ChargesListProps> = ({ charges, selectedCharges, toggleSelect }) => {
  console.log('charges---', charges);

  return (
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
            border: `1px solid ${ch.status === 0 ? '#2e7d32' : '#d32f2f'}`,
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
                disabled={ch.status === 0}
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
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
export default ChargesList;
