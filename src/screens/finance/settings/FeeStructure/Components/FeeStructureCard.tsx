import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Grid, Button, IconButton, Typography } from '@mui/material';

import AddFeeHeadDialogContent from './AddFeeHeadForm';

import type { FeeStructureCardProps } from '../type';

const FeeStructureCard: React.FC<FeeStructureCardProps> = ({
  className,
  feeItems,
  structureIndex,
  formik,
  addFeeHeadDialog,
}) => {
  // State to track the index of fee head selected for deletion
  const [selectedFeeHead, setSelectedFeeHead] = useState<number>();

  // Dialog state for confirming fee structure deletion
  const deleteFeeStructureDialog = useBoolean();

  return (
    <Grid size={12} key={className} sx={{ mt: 2, px: 2 }}>
      {feeItems.length > 0 ? (
        <Scrollbar sx={{ height: '150px', mb: 2 }}>
          {feeItems.map((item, index) => (
            <Grid
              container
              key={index}
              sx={{
                border: '1px dashed',
                borderColor: 'text.disabled',
                borderRadius: 1,
                alignItems: 'center',
                px: 1.5,
                py: 0.5, // Reduced padding
                mb: 1, // Reduced margin
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'primary.main',
                },
              }}
            >
              <Grid size={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {index + 1}.
                </Typography>
              </Grid>
              <Grid size={5} sx={{ pr: 1 }}>
                <Typography variant="body2" noWrap>
                  {item.feeHeadName}
                </Typography>
              </Grid>
              <Grid size={2} sx={{ pr: 2 }}>
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  placeholder="0.00"
                  name={`feeStructureClasses.${className}[${structureIndex}].feeHeads[${index}].amount`}
                  value={item.amount || ''}
                  onChange={(e) => {
                    let val = e.target.value;
                    val = val.replace(/[₹,\s]/g, '');
                    if (!/^\d*$/.test(val)) return;
                    if (val.length > 5) return;

                    formik.setFieldValue(
                      `feeStructureClasses.${className}[${structureIndex}].feeHeads[${index}].amount`,
                      Number(val)
                    );
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 36, // Force compact height
                      bgcolor: 'background.paper',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent', // Cleaner look
                      bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.08),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'text.disabled',
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      bgcolor: 'transparent',
                    },
                  }}
                  // error/helperText logic remains...
                  error={
                    !!(
                      (formik?.touched?.feeStructureClasses as any)?.[className]?.[structureIndex]
                        ?.feeHeads?.[index]?.amount &&
                      (formik?.errors?.feeStructureClasses as any)?.[className]?.[structureIndex]
                        ?.feeHeads?.[index]?.amount
                    )
                  }
                />
              </Grid>

              {/* One Time Fee Toggle */}
              <Grid size={2} display="flex" justifyContent="center">
                <Box
                  component="div"
                  onClick={() => {
                    formik.setFieldValue(
                      `feeStructureClasses.${className}[${structureIndex}].feeHeads[${index}].isOneTime`,
                      !item.isOneTime
                    );
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    color: item.isOneTime ? 'primary.main' : 'text.disabled',
                    bgcolor: item.isOneTime
                      ? (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08)
                      : 'transparent',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: item.isOneTime
                      ? (theme) => varAlpha(theme.palette.primary.mainChannel, 0.2)
                      : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.12),
                    },
                  }}
                >
                  <Iconify
                    icon={
                      item.isOneTime ? 'solar:calendar-date-bold' : 'solar:calendar-date-outline'
                    }
                    width={16}
                  />
                  <Typography variant="caption" fontWeight={600}>
                    One Time
                  </Typography>
                </Box>
              </Grid>

              {/* Optional Fee Toggle */}
              <Grid size={2} display="flex" justifyContent="center">
                <Box
                  component="div"
                  onClick={() => {
                    formik.setFieldValue(
                      `feeStructureClasses.${className}[${structureIndex}].feeHeads[${index}].isOptional`,
                      !item.isOptional
                    );
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    color: item.isOptional ? 'info.main' : 'text.disabled',
                    bgcolor: item.isOptional
                      ? (theme) => varAlpha(theme.palette.info.mainChannel, 0.08)
                      : 'transparent',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: item.isOptional
                      ? (theme) => varAlpha(theme.palette.info.mainChannel, 0.2)
                      : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: (theme) => varAlpha(theme.palette.info.mainChannel, 0.12),
                    },
                  }}
                >
                  <Iconify
                    icon={
                      item.isOptional ? 'solar:check-circle-bold' : 'solar:check-circle-outline'
                    }
                    width={16}
                  />
                  <Typography variant="caption" fontWeight={600}>
                    Optional
                  </Typography>
                </Box>
              </Grid>

              <Grid size={0.5} display="flex" justifyContent="flex-end">
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => {
                    deleteFeeStructureDialog.onTrue();
                    setSelectedFeeHead(index);
                  }}
                  sx={{
                    opacity: 0.6,
                    '&:hover': {
                      opacity: 1,
                      bgcolor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.08),
                    },
                  }}
                >
                  <Iconify icon={GlobalIcons.delete} width={18} />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Scrollbar>
      ) : (
        <EmptyContent
          title="No Fee Heads Added"
          description="Add fee heads to define the fee structure."
          filled
          sx={{ py: 5, mb: 2 }}
          action={
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="lucide:plus" />}
              onClick={() => addFeeHeadDialog.onTrue()}
            >
              Fee Head
            </Button>
          }
        />
      )}

      <CustomDialog
        open={addFeeHeadDialog.value}
        handleClose={addFeeHeadDialog.onFalse}
        title="Add Fee Head"
      >
        <AddFeeHeadDialogContent
          formik={formik}
          className={className}
          feeStructureIndex={structureIndex}
          onClose={addFeeHeadDialog.onFalse}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteFeeStructureDialog.value}
        onClose={() => {
          deleteFeeStructureDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete fee head{' '}
            <strong>
              {typeof selectedFeeHead === 'number'
                ? formik.values.feeStructureClasses[className][structureIndex]?.feeHeads[
                    selectedFeeHead
                  ]?.feeHeadName
                : ''}
            </strong>
            ?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              const updatedHeads = [...feeItems];
              if (typeof selectedFeeHead === 'number') {
                updatedHeads.splice(selectedFeeHead, 1);
              }
              setSelectedFeeHead(undefined);
              formik.setFieldValue(
                `feeStructureClasses.${className}[${structureIndex}].feeHeads`,
                updatedHeads
              );
              deleteFeeStructureDialog.onFalse();
            }}
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Yes
          </Button>
        }
      />
    </Grid>
  );
};

export default FeeStructureCard;
