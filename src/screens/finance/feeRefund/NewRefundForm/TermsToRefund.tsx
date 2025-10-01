// TermsToRefund.tsx

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Box, Card, Divider, Checkbox, Collapse, Typography, IconButton } from '@mui/material';

import ChargesList from './RefundChargesList';

import type { ITerm, IFeeHead, IFeeCharge } from '../../FeeCollection/Components/type';

export interface ITermsToRefundProps {
  terms: ITerm[] | null;

  selectedTerms: (ITerm | IFeeHead)[]; // ["term1", "term2"]
  onTermSelect: (selected: (ITerm | IFeeHead)[]) => void;

  selectedFeeHeads: string[]; // ["termId-headName"]
  onFeeHeadSelect: (selected: string[]) => void;

  selectedCharges: string[]; // ["termId-chargeName"]
  onChargeSelect: (selected: string[]) => void;

  showError?: boolean;
  errorMessage?: string;
}

const TermsToRefund: React.FC<ITermsToRefundProps> = ({
  terms = [],
  selectedTerms = [],
  onTermSelect,
  selectedFeeHeads = [],
  onFeeHeadSelect,
  onChargeSelect,
  selectedCharges = [],
  showError,
  errorMessage,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const theme = useTheme();

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id);

  const toggleTerm = (term: ITerm) => {
    const isSelected = selectedTerms.some((t) => t.id === term.id);

    if (isSelected) {
      // Deselect term and all children
      onTermSelect(selectedTerms.filter((t) => t.id !== term.id));
      onFeeHeadSelect(selectedFeeHeads.filter((k) => !k.startsWith(term.id)));
      onChargeSelect(selectedCharges.filter((k) => !k.startsWith(term.id)));
    } else {
      // Select term and all children
      onTermSelect([...selectedTerms, term]);

      const allHeads = term.feeHeads.map((h) => `${term.id}-${h.name}`);
      const allCharges = term?.charges?.map((c) => `${term.id}-${c.id}`) || [];

      onFeeHeadSelect(Array.from(new Set([...selectedFeeHeads, ...allHeads])));
      onChargeSelect(Array.from(new Set([...selectedCharges, ...allCharges])));
    }
  };

  // This handles a single charge toggle
  const toggleCharge = (termId: string, charge: IFeeCharge) => {
    const chargeId = `${termId}-${charge.id}`;
    const isSelected = selectedCharges.includes(chargeId);

    if (isSelected) {
      // Deselect this one charge
      onChargeSelect(selectedCharges.filter((c) => c !== chargeId));
    } else {
      // Select this one charge
      onChargeSelect([...selectedCharges, chargeId]);
    }
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        height: '100%',
        boxShadow: 2,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Typography variant="h6" color="primary.main" fontWeight={600} mb={2}>
        Select Installment to Refund Fees
      </Typography>
      <Scrollbar
        sx={{
          height: '400px',
        }}
      >
        {terms?.map((term) => (
          <Box key={term.id} sx={{ border: '1px solid #ddd', borderRadius: 2, mb: 1.5 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Checkbox
                  checked={selectedTerms?.some((t) => t.id === term.id) || false}
                  onChange={() => toggleTerm(term)}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {term.name}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontWeight={600}>
                  ₹ {term.paid.toLocaleString()}/ ₹ {term.total.toLocaleString()}
                </Typography>
                <IconButton size="small" onClick={() => toggleExpand(term.id)}>
                  {expanded === term.id ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expanded === term.id}>
              <Divider />
              <Box px={2} py={1.5}>
                <Typography variant="body2" color="primary" fontWeight={600} mb={1}>
                  Select Fee Heads to Refund
                </Typography>

                {term.feeHeads.map((head, indx) => {
                  const key = `${term.id}-${head.name}`;
                  const isSelected = selectedFeeHeads.includes(key);
                  const termSelected = selectedTerms.some((t) => t.id === term.id);

                  const handleToggleHead = () => {
                    let updated = [...selectedFeeHeads];
                    if (isSelected) {
                      updated = updated.filter((k) => k !== key);
                    } else {
                      updated.push(key);
                    }
                    onFeeHeadSelect(updated); // ✅ send full array
                  };
                  return (
                    <Card
                      key={head.name}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        border: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Checkbox
                          checked={isSelected || termSelected}
                          disabled={termSelected}
                          onChange={handleToggleHead}
                        />
                        <Typography>{head.name}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={500}>
                          ₹ {head.paid.toLocaleString()}/ ₹ {head.total.toLocaleString()}
                        </Typography>
                      </Box>
                    </Card>
                  );
                })}

                <ChargesList
                  charges={term.charges}
                  selectedCharges={selectedCharges}
                  toggleSelect={(charge) => toggleCharge(term.id, charge)}
                  termSelected={selectedTerms.some((t) => t.id === term.id)} // ✅ tells list whole term is selected
                  termId={term.id}
                />
              </Box>
            </Collapse>
          </Box>
        ))}

        {showError && errorMessage && (
          <Typography variant="caption" color="error" mt={1}>
            {errorMessage}
          </Typography>
        )}
      </Scrollbar>
    </Card>
  );
};

export default TermsToRefund;
