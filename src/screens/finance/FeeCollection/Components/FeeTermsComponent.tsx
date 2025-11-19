import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Paper, Switch, Checkbox, Typography, IconButton } from '@mui/material';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import FeeInstallmentDialog from './FeeInstallmentDialog';

import type { ITerm, IFeeCharge, ITermsToCollectProps } from './type';

const TermsToCollect: React.FC<ITermsToCollectProps> = ({
  formik,
  terms = [],
  selectedTerms,
  onTermSelect,
  showError,
  errorMessage,
}) => {
  // State to track which term is currently expanded (only one at a time)
  // const [expanded, setExpanded] = useState<string | null>(null);
  const openTermDialog = useBoolean();
  const [selectedTerm, setSelectedTerm] = useState<ITerm | null>(null);
  // Get the current theme for styling
  const theme = useTheme();

  // Toggle expansion of a term's details (collapse if already expanded, expand if collapsed)
  // const toggleExpand = (id: string) => {
  //   setExpanded(expanded === id ? null : id);
  // };

  // Handle term selection/deselection for fee collection
  const toggleSelect = (term: ITerm | IFeeCharge) => {
    // const newSelected = selectedTerms.includes(id)
    //   ? selectedTerms.filter((t) => t !== id) // Remove from selection if already selected
    //   : [...selectedTerms, id]; // Add to selection if not selected
    // onTermSelect(newSelected);

    if (selectedTerms.some((t) => t.id === term.id)) {
      const newSelected: (ITerm | IFeeCharge)[] = selectedTerms.filter((t) => t.id !== term.id);
      onTermSelect(newSelected);
    } else {
      onTermSelect([...selectedTerms, term]);
    }
  };
  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: 'var(--shadows-4)',
        bgcolor: theme.vars.palette.background.paper,
        height: '100%',
        p: 1.5,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" color="primary.main">
          Payment Term
        </Typography>

        {selectedTerms.length > 0 && (
          <Box display="flex" alignItems="center" gap={0.2}>
            <Switch
              size="small"
              checked={formik.values.includeCharges}
              onChange={(e) => formik.setFieldValue('includeCharges', e.target.checked)}
            />
            <Typography variant="body2" color="text.secondary">
              Include Charges
            </Typography>
            <Box ml={0.5} mt={0.6}>
              <CustomTooltip title="If this switch is enabled, pending charges amount will be added to the payable amount first, and then fee heads amount will be added. If disabled, pending charges amount will be moved to the next payment term.">
                <Iconify
                  icon={GlobalIcons.question}
                  width={16}
                  height={16}
                  color="text.secondary"
                  sx={{ cursor: 'pointer' }}
                />
              </CustomTooltip>
            </Box>
          </Box>
        )}
      </Box>
      <Scrollbar sx={{ height: '300px', p: 1 }}>
        {terms?.map((term) => (
          <Paper
            key={term.id}
            elevation={4}
            sx={{
              p: 1,
              border: selectedTerms?.some((t) => t.id === term.id) ? '1px solid' : '',
              borderColor: selectedTerms?.some((t) => t.id === term.id)
                ? 'primary.main'
                : 'transparent',
              mb: 1.5,
              backgroundColor:
                FeeCollectionStatusType.Paid === term.status
                  ? alpha(theme.palette.grey[500], 0.08)
                  : undefined,
              borderRadius: 2,
              cursor: 'pointer',
            }}
          >
            {/* TOP SECTION */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" gap={1.2} alignItems="center">
                <Checkbox
                  disabled={FeeCollectionStatusType.Paid === term.status}
                  checked={
                    selectedTerms?.some((t) => t.id === term.id) ||
                    FeeCollectionStatusType.Paid === term.status
                  }
                  onChange={() => toggleSelect(term)}
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

              {/* Amount + Eye Icon */}
              <Box display="flex" flexDirection="column">
                {/* Status Label on top */}
                <Box display="flex" justifyContent="flex-end">
                  <Label
                    color={
                      FeeCollectionStatusTypeColors[
                        term.status as FeeCollectionStatusType
                      ] as LabelColor
                    }
                  >
                    {FeeCollectionStatusType[term.status as FeeCollectionStatusType]}
                  </Label>
                </Box>

                {/* Amount in center */}
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2" fontWeight={300}>
                    ₹ {term.paid.toLocaleString()} / ₹ {term.total.toLocaleString()}
                  </Typography>
                  <IconButton
                    size="small"
                    color="default"
                    onClick={() => {
                      openTermDialog.onTrue();
                      setSelectedTerm(term);
                    }}
                  >
                    <Iconify icon={GlobalIcons.eye} width={16} height={16} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}

        {showError && errorMessage && (
          <Typography variant="caption" color="error" mt={1}>
            {errorMessage}
          </Typography>
        )}
      </Scrollbar>
      <FeeInstallmentDialog
        open={openTermDialog}
        onClose={() => {
          openTermDialog.onFalse();
          setSelectedTerm(null);
        }}
        selectedTerm={selectedTerm}
      />
    </Card>
  );
};

export default TermsToCollect;
