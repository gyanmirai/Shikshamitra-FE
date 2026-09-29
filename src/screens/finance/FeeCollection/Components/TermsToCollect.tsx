import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Box, Card, Divider, Checkbox, Collapse, Typography, IconButton } from '@mui/material';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
  feeInstallmentStatusLabel,
} from 'src/enums/fee-collection-type';

import ChargesList from './ChargesList';

import type { IFeeTerm, IFeeHead, ITermsToCollectDetailedProps } from './type';

const TermsToCollect: React.FC<ITermsToCollectDetailedProps> = ({
  terms = [],
  selectedTerms,
  onTermSelect,
  showError,
  errorMessage,
}) => {
  const [expanded, setExpanded] = useState<string | number | null>(null);
  const theme = useTheme();

  const toggleExpand = (id: string | number) => {
    setExpanded(expanded === id ? null : id);
  };

  const toggleSelect = (id: string | number) => {
    const newSelected = selectedTerms.includes(id)
      ? selectedTerms.filter((t) => t !== id)
      : [...selectedTerms, id];
    onTermSelect(newSelected);
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
        bgcolor: theme.vars.palette.background.paper,
        mb: 2,
        mt: 2,
      }}
    >
      <Typography variant="h6" color="primary.main" fontWeight={600} mb={2}>
        Select Installment to Collect Fees
      </Typography>
      {terms?.map((term: IFeeTerm) => (
        <Box
          key={term.id}
          sx={{ border: '1px solid #ddd', borderRadius: 2, mb: 1.5, overflow: 'hidden' }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Checkbox
                checked={selectedTerms.includes(term.id)}
                onChange={() => toggleSelect(term.id)}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {term.name ?? term.termName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Due: {term.dueDate}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography fontWeight={600}>
                ₹ {(term.paid ?? term.paidAmount ?? 0).toLocaleString()} / ₹{' '}
                {(term.total ?? term.totalAmount ?? 0).toLocaleString()}
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
                Fee Head Breakdown
              </Typography>
              {term.feeHeads.map((head: IFeeHead) => (
                <Box
                  key={head.feeHeadId ?? head.name}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={1}
                  sx={{ border: '1px solid #eee', borderRadius: 1, mb: 1 }}
                >
                  <Typography>{head.name ?? head.feeHeadName}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight={500}>
                      ₹ {(head.paid ?? head.paidAmount ?? 0).toLocaleString()} / ₹{' '}
                      {(head.total ?? head.totalAmount ?? 0).toLocaleString()}
                    </Typography>
                    <Label
                      color={
                        FeeCollectionStatusTypeColors[
                          head.status as unknown as FeeCollectionStatusType
                        ] as LabelColor
                      }
                    >
                      {feeInstallmentStatusLabel(head.status as unknown as FeeCollectionStatusType)}
                    </Label>
                  </Box>
                </Box>
              ))}
              <ChargesList charges={term.charges} selectedCharges={[]} toggleSelect={() => {}} />
            </Box>
          </Collapse>
        </Box>
      ))}
      {showError && errorMessage && (
        <Typography variant="caption" color="error" mt={1}>
          {errorMessage}
        </Typography>
      )}
    </Card>
  );
};

export default TermsToCollect;
