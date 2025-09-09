// TermsToRefund.tsx
import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Box, Card, Divider, Checkbox, Collapse, Typography, IconButton } from '@mui/material';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import ChargesList from '../../FeeCollection/Components/ChargesList';

import type { ITerm } from '../../FeeCollection/Components/type';

export interface ITermsToRefundProps {
  terms: ITerm[] | null;

  selectedTerms: string[]; // ["term1", "term2"]
  onTermSelect: (selected: string[]) => void;

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

  const toggleTerm = (id: string, term: ITerm) => {
    let updatedTerms = [...selectedTerms];
    let updatedHeads = [...selectedFeeHeads];
    let updatedCharges = [...selectedCharges];

    if (updatedTerms.includes(id)) {
      // remove term
      updatedTerms = updatedTerms.filter((t) => t !== id);

      // also deselect all its heads and charges
      updatedHeads = updatedHeads.filter((key) => !key.startsWith(`${id}-`));
      updatedCharges = updatedCharges.filter((key) => !key.startsWith(`${id}-`));
    } else {
      // add term
      updatedTerms.push(id);

      // collect all heads
      const termHeads = term.feeHeads.map((h) => `${id}-${h.name}`);
      termHeads.forEach((key) => {
        if (!updatedHeads.includes(key)) updatedHeads.push(key);
      });

      // collect all charges
      const termCharges = term?.charges?.map((c) => `${id}-${c.id}`);
      termCharges?.forEach((key) => {
        if (!updatedCharges.includes(key)) updatedCharges.push(key);
      });
    }

    // update all at once
    onTermSelect(updatedTerms);
    onFeeHeadSelect?.(updatedHeads);
    onChargeSelect?.(updatedCharges);
  };

  return (
    <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2, bgcolor: theme.palette.background.paper }}>
      <Typography variant="h6" color="primary.main" fontWeight={600} mb={2}>
        Select Installment to Refund Fees
      </Typography>
      <Scrollbar sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        {terms?.map((term) => (
          <Box key={term.id} sx={{ border: '1px solid #ddd', borderRadius: 2, mb: 1.5 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Checkbox
                  checked={selectedTerms.includes(term.id)}
                  onChange={() => toggleTerm(term.id, term)}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {term.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Due: {term.dueDate}
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

                {term.feeHeads.map((head) => {
                  const key = `${term.id}-${head.name}`;
                  const isSelected = selectedFeeHeads.includes(key);

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
                          checked={selectedFeeHeads.includes(key)}
                          onChange={handleToggleHead}
                        />
                        <Typography>{head.name}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={500}>
                          ₹ {head.paid.toLocaleString()}/ ₹ {head.total.toLocaleString()}
                        </Typography>
                        <Label
                          color={
                            FeeCollectionStatusTypeColors[
                              head.status as FeeCollectionStatusType
                            ] as LabelColor
                          }
                        >
                          {FeeCollectionStatusType[head.status as FeeCollectionStatusType]}
                        </Label>
                      </Box>
                    </Card>
                  );
                })}

                <ChargesList
                  charges={term.charges}
                  selectedCharges={selectedCharges}
                  toggleSelect={(chargeId) => {
                    const key = `${term.id}-${chargeId}`;
                    let updated = [...selectedCharges];
                    if (updated.includes(key)) {
                      updated = updated.filter((k) => k !== key);
                    } else {
                      updated.push(key);
                    }
                    onChargeSelect(updated); // ✅ send full array
                  }}
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
