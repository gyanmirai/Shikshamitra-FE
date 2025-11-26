import { Box, Checkbox, Typography } from '@mui/material';

import type { IFeeCharge } from '../../FeeCollection/Components/type';

interface ChargesListProps {
  charges?: IFeeCharge[] | null;
  selectedCharges: string[];
  toggleSelect: (charge: IFeeCharge) => void;
  termSelected?: boolean;
  termId?: string;
}

const RefundChargesList: React.FC<ChargesListProps> = ({
  charges,
  selectedCharges,
  toggleSelect,
  termSelected = false,
  termId,
}) => (
  <Box mt={2}>
    {(charges ?? []).length > 0 && (
      <Typography variant="subtitle1" fontWeight={600} color="error" mb={1}>
        Charges - (₹ {charges?.reduce((sum, c) => sum + c.total, 0).toLocaleString()})
      </Typography>
    )}

    {charges?.map((ch) => {
      const chargeId = `${termId}-${ch.id}`;
      const isChecked = termSelected || selectedCharges.includes(chargeId);

      return (
        <Box
          key={chargeId}
          sx={{
            border: `1px solid ${ch.status === 0 ? '#2e7d32' : '#d32f2f'}`,
            borderRadius: 2,
            mb: 1.5,
            overflow: 'hidden',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" p={1}>
            <Box display="flex" gap={1}>
              <Checkbox
                checked={isChecked}
                onChange={() => toggleSelect(ch)}
                disabled={termSelected} // ✅ disable if whole term is selected
              />
              <Typography variant="subtitle2" fontWeight={600}>
                {ch.name}
              </Typography>
            </Box>

            <Typography fontWeight={400}>
              ₹ {ch.paid.toLocaleString()} / ₹ {ch.total.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      );
    })}
  </Box>
);

export default RefundChargesList;
