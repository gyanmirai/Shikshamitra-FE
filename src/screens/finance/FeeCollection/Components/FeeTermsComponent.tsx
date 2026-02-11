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
    // <Card sx={{ boxShadow: 'var(--shadows-4)', ml: 0.5, mt: 0.5 }}>
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ml: 0.5,
        mt: 0.5,
        boxShadow: 'var(--shadows-4)',
      }}
    >
      {/* HEADER SECTION */}
      <Box
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px dashed ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Payment Terms
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Select terms to collect fees
          </Typography>
        </Box>

        {selectedTerms.length > 0 && (
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              borderColor: 'divider',
              bgcolor: 'background.neutral',
            }}
          >
            <Switch
              size="small"
              checked={formik.values.includeCharges}
              onChange={(e) => formik.setFieldValue('includeCharges', e.target.checked)}
              sx={{ ml: -0.5 }}
            />
            <Typography variant="subtitle2" sx={{ fontSize: '0.875rem' }}>
              Include Charges
            </Typography>
            <CustomTooltip title="If enabled, pending charges are added to the payable amount first, followed by fee heads. If disabled, pending charges move to the next term.">
              <Iconify
                icon={GlobalIcons.question}
                width={16}
                color="text.disabled"
                sx={{ cursor: 'help', '&:hover': { color: 'text.primary' } }}
              />
            </CustomTooltip>
          </Paper>
        )}
      </Box>

      {/* LIST SECTION */}
      <Scrollbar sx={{ flexGrow: 1, p: 1, height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1.5} pb={1}>
          {terms?.map((term: any) => {
            const isSelected = selectedTerms?.some((t) => t.id === term.id);
            const isPaid = FeeCollectionStatusType.Paid === term.status;

            return (
              <Card
                key={term.id}
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  backgroundColor: isSelected
                    ? alpha(theme.palette.primary.main, 0.04)
                    : theme.palette.background.default,
                  boxShadow: isSelected
                    ? `0 0 0 1px ${theme.palette.primary.main}`
                    : 'var(--shadows-4)',
                  ...(isPaid && {
                    opacity: 0.7,
                    backgroundColor: alpha(theme.palette.grey[500], 0.04),
                    borderColor: 'transparent',
                  }),
                  '&:hover': {
                    borderColor: !isPaid ? 'primary.main' : 'transparent',
                    boxShadow: !isPaid ? theme.customShadows?.z4 : 'none',
                    transform: !isPaid ? 'translateY(-1px)' : 'none',
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  {/* LEFT: Checkbox + Details */}
                  <Box display="flex" gap={2} alignItems="center">
                    <Checkbox
                      disabled={isPaid}
                      checked={isSelected || isPaid}
                      onChange={() => toggleSelect(term)}
                      sx={{
                        p: 0,
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />

                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: isPaid ? 'text.disabled' : 'text.primary',
                          mb: 0.5,
                        }}
                      >
                        {term.name}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Iconify icon={GlobalIcons.calenderIcon} width={14} color="text.disabled" />
                        <Typography variant="body2" color="text.secondary">
                          Due: {term.dueDate}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* RIGHT: Status + Amount + Action */}
                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                    <Label
                      color={
                        FeeCollectionStatusTypeColors[
                          term.status as FeeCollectionStatusType
                        ] as LabelColor
                      }
                      variant="soft"
                    >
                      {FeeCollectionStatusType[term.status as FeeCollectionStatusType]}
                    </Label>

                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: 'text.primary' }}
                      >
                        ₹ {term.total.toLocaleString()}
                      </Typography>
                      {term.paid > 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          ₹ {term.paid.toLocaleString()}
                        </Typography>
                      )}

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTermDialog.onTrue();
                          setSelectedTerm(term);
                        }}
                        sx={{
                          ml: 0.5,
                          width: 28,
                          height: 28,
                          color: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          },
                        }}
                      >
                        <Iconify icon={GlobalIcons.eye} width={16} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Card>
            );
          })}

          {showError && errorMessage && (
            <Paper
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.error.main, 0.08),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Iconify icon="solar:danger-circle-bold" color="error.main" width={20} />
              <Typography variant="subtitle2" color="error.main">
                {errorMessage}
              </Typography>
            </Paper>
          )}
        </Box>
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
