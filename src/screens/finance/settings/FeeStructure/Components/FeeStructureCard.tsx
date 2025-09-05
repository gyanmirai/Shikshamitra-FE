import React, { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Box, Grid, Button, Switch, TextField, IconButton, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import AddFeeHeadDialogContent from './AddFeeHeadForm';

import type { FeeStructureCardProps } from '../type';

const FeeStructureCard: React.FC<FeeStructureCardProps> = ({
  className,
  feeItems,
  structureIndex,
  formik,
}) => {
  // Dialog state for adding new fee head
  const addFeeHeadDialog = useBoolean();
  // State to track the index of fee head selected for deletion
  const [selectedFeeHead, setSelectedFeeHead] = useState<number>();

  // Dialog state for confirming fee structure deletion
  const deleteFeeStructureDialog = useBoolean();

  return (
    <Grid size={12} key={className} sx={{ ml: 3, mt: 2 }}>
      {feeItems.length > 0 && (
        <Scrollbar sx={{ height: '150px', mb: 2 }}>
          {feeItems.map((item, index) => (
            <Grid
              container
              key={index}
              sx={{
                border: '1px dashed #000',
                borderRadius: 1,
                spacing: 3,
                alignItems: 'center',
                p: 1,
                gap: 2,
                mb: 4,
              }}
            >
              <Grid size={0.1}>
                <Typography variant="h6">{index + 1}.</Typography>
              </Grid>
              <Grid size={2} pt={0}>
                <TextField
                  label="Category"
                  size="small"
                  disabled
                  value={item.feeCategory}
                  onChange={(e) => {
                    const updatedItems = [...feeItems];
                    updatedItems[index].feeCategory = e.target.value;
                    const currentClassData = formik.values.feeStructureClasses[className];

                    formik.setFieldValue(`feeStructureClasses.${className}`, {
                      ...currentClassData,
                      feeItems: updatedItems,
                    });
                  }}
                  fullWidth
                />
              </Grid>
              <Grid size={2} pt={0}>
                <TextField
                  label="Fee Head"
                  disabled
                  size="small"
                  value={item.feeHead}
                  onChange={(e) => {
                    const updatedItems = [...feeItems];
                    updatedItems[index].feeHead = e.target.value;
                    formik.setFieldValue(`feeStructureClasses.${className}.feeItems`, updatedItems);
                  }}
                  fullWidth
                />
              </Grid>
              <Grid size={2} pt={0}>
                <NumericFormatCustom
                  size="small"
                  fullWidth
                  label="Amount"
                  name={`feeStructureClasses.${className}[${index}].feeItems.${index}.amount`}
                  value={item.amount || ''}
                  onChange={(e) => {
                    let val = e.target.value;
                    val = val.replace(/[₹,\s]/g, '');
                    const updatedItems = [...feeItems];
                    updatedItems[index].amount = Number(val);
                    formik.setFieldValue(
                      `feeStructureClasses.${className}[${structureIndex}].feeItems[${index}].amount`,
                      Number(val)
                    );
                  }}
                  sx={{
                    width: '100%',
                    padding: '0',
                    borderRadius: 1,
                  }}
                  // error={
                  //   !!(
                  //     formik?.touched?.feeStructureClasses?.[className]?.feeItems?.[index]
                  //       ?.amount &&
                  //     formik?.errors?.feeStructureClasses?.[className]?.feeItems?.[index]?.amount
                  //   )
                  // }
                  // helperText={
                  //   formik?.touched?.feeStructureClasses?.[className]?.feeItems?.[index]?.amount &&
                  //   formik?.errors?.feeStructureClasses?.[className]?.feeItems?.[index]?.amount
                  //     ? formik.errors.feeStructureClasses[className].feeItems[index].amount
                  //     : ''
                  // }
                />
              </Grid>
              <Grid size={2} pt={0} display="flex" alignItems="center">
                <Switch
                  checked={item.isOneTime}
                  onChange={(event) => {
                    formik.setFieldValue(
                      `feeStructureClasses.${className}[${structureIndex}].feeItems[${index}].isOneTime`,
                      event.target.checked
                    );
                  }}
                />
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  One Time Fee
                </Typography>
              </Grid>
              <Grid size={2} pt={0} display="flex" alignItems="center">
                <Switch
                  checked={item.required}
                  onChange={(event) => {
                    formik.setFieldValue(
                      `feeStructureClasses.${className}[${structureIndex}].feeItems[${index}].required`,
                      event.target.checked
                    );
                  }}
                />
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  Optional
                </Typography>
              </Grid>
              <Grid size={0.5} ml={2}>
                <IconButton
                  color="error"
                  onClick={() => {
                    deleteFeeStructureDialog.onTrue();
                    setSelectedFeeHead(index);
                  }}
                >
                  <Iconify icon={GlobalIcons.delete} />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Scrollbar>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          border: '1px dashed #000',
          borderRadius: 1,
          p: 1,
          mt: 2,
        }}
      >
        <Button
          onClick={() => {
            addFeeHeadDialog.onTrue();
          }}
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
        >
          Fee Head
        </Button>
      </Box>

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
            Are you sure you want to delete fee structure <strong>{className}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              const updatedItems = [...feeItems];
              if (typeof selectedFeeHead === 'number') {
                updatedItems.splice(selectedFeeHead, 1);
              }
              setSelectedFeeHead(undefined);
              formik.setFieldValue(`feeStructureClasses.${className}.feeItems`, updatedItems);
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
