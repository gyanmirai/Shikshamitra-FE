import { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FeeStructureClassStatusType } from 'src/enums/fee-structure-statusType';
import {
  Box,
  Grid,
  Chip,
  Card,
  Button,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material';

import FeeStructureCard from './FeeStructureCard';
import FeeGeneralInfoCard from './GeneralFeeInfoCard';
import AddFeeStructureDialog from './FeeStructureDialog';

const FeeStructureStep = ({ formik }: { formik: any }) => {
  const [editFeeStructure, setEditFeeStructure] = useState<{
    className: string;
    index: number;
  } | null>(null);
  const deleteFeeStructureDialog = useBoolean();
  const [selectedFeeStructure, setSelectedFeeStrcture] = useState<any>(null);
  const addNewFeeStructureDialog = useBoolean();
  const [selectedClass, setSelectedClass] = useState('');

  const [, setCurrentClickableClass] = useState<string | null>(null);
  const addFeeHeadDialog = useBoolean();

  return (
    <>
      <Grid container spacing={1}>
        {/* 🔹 Select Classes Section */}
        <Grid size={{ xs: 12 }}>
          <FeeGeneralInfoCard feeStructure={formik.values} />
        </Grid>
        {/* {Object.keys(formik.values.feeStructureClasses).length > 0 && (
          <Grid size={{ xs: 1.3 }} sx={{ height: '100%' }}>
            <SectionCard title="Classes">
              <Grid container>
                <Grid size={{ xs: 12 }}>
                  
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>
        )} */}

        {/* 🔹 Global Add Fee Structure Button */}

        {/* 🔹 Active Class Fee Structures */}
        <Grid size={{ xs: 12 }} mt={1}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            pb={selectedClass ? 2 : 0}
          >
            <Autocomplete
              size="small"
              fullWidth
              options={Object.keys(formik.values.feeStructureClasses)}
              value={selectedClass || null}
              onChange={(event, className) => {
                if (className === null) {
                  setSelectedClass('');
                  setCurrentClickableClass(null);
                  return;
                }

                setSelectedClass(className);
                setCurrentClickableClass(className);

                const updatedStatus = { ...formik.values.feeStructureClasses };

                Object.keys(updatedStatus).forEach((cls) => {
                  updatedStatus[cls] = updatedStatus[cls].map((fs: any, idx: any) => {
                    const clsHasData = fs.feeItems?.length > 0;

                    if (cls === className && idx === 0) {
                      return { ...fs, status: FeeStructureClassStatusType.Current };
                    }

                    if (clsHasData) {
                      return { ...fs, status: FeeStructureClassStatusType.Completed };
                    }

                    return { ...fs, status: FeeStructureClassStatusType.Remaining };
                  });
                });

                formik.setFieldValue('feeStructureClasses', updatedStatus);
              }}
              renderInput={(params) => <TextField {...params} label="Class" />}
              getOptionLabel={(option) => option.replace('Class ', '')}
              sx={{ width: '250px' }}
            />

            {/* <Box display="flex" justifyContent="flex-end"> */}
            {selectedClass && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="lucide:plus" />}
                onClick={() => addNewFeeStructureDialog.onTrue()}
              >
                Fee Structure
              </Button>
            )}
            {/* </Box> */}
          </Box>

          <>
            {selectedClass && (
              <>
                {(() => {
                  const filtered = Object.entries(formik.values.feeStructureClasses).filter(
                    ([className, feeStructures]: any) =>
                      className === selectedClass &&
                      feeStructures.some(
                        (fs: any) => fs.status === FeeStructureClassStatusType.Current
                      )
                  );

                  // CASE 2: No fee structures match → show EmptyContent
                  if (filtered.length === 0) {
                    return (
                      <EmptyContent
                        filled
                        title="No Fee Structure Created"
                        description="Click the 'Fee Structure' button above to create a new fee structure for this class."
                        sx={{ mt: 2, py: 10 }}
                      />
                    );
                  }

                  // CASE 1: Render actual fee structures
                  return filtered.map(([className, feeStructures]: any) => (
                    <Box key={className}>
                      {feeStructures.length > 0 ? (
                        feeStructures.map((structure: any, idx: number) => {
                          const totalFeeAmount =
                            structure.feeItems?.reduce(
                              (sum: number, item: any) => sum + (item.amount || 0),
                              0
                            ) || 0;

                          return (
                            <Card
                              key={idx}
                              sx={{
                                borderRadius: 1.5, // Reduced radius
                                mb: 2, // Reduced margin
                                border: (theme) =>
                                  `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
                                boxShadow: (theme) =>
                                  `0 2px 8px ${varAlpha(theme.palette.grey['500Channel'], 0.08)}`, // Softer shadow
                                overflow: 'visible',
                              }}
                              elevation={0}
                            >
                              <Box
                                sx={{
                                  p: 1.5, // Reduced padding
                                  pb: 1.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  borderBottom: (theme) =>
                                    `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.1)}`,
                                  bgcolor: (theme) =>
                                    varAlpha(theme.palette.background.neutralChannel, 0.4),
                                }}
                              >
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {structure.feeStructureName || `Fee Structure ${idx + 1}`}
                                  </Typography>
                                  <Chip
                                    label={`Total: ${formatNumber(totalFeeAmount, 'INR')}`}
                                    color="success"
                                    size="small"
                                    variant="soft"
                                    sx={{ fontWeight: 600, borderRadius: 1 }}
                                  />
                                </Box>

                                <Box display="flex" alignItems="center" gap={1}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    startIcon={<Iconify icon="lucide:plus" />}
                                    onClick={(e) => {
                                      addFeeHeadDialog.onTrue();
                                      e.stopPropagation();
                                    }}
                                  >
                                    Add Fee Head
                                  </Button>

                                  <Tooltip title="Edit Fee Structure">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditFeeStructure({ className, index: idx });
                                      }}
                                    >
                                      <Iconify icon={GlobalIcons.edit} width={18} />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Delete Fee Structure">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFeeStructureDialog.onTrue();
                                        setSelectedFeeStrcture(structure);
                                      }}
                                    >
                                      <Iconify icon={GlobalIcons.delete} color="error" width={18} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>

                              <Box sx={{ p: 0 }}>
                                <FeeStructureCard
                                  className={className}
                                  feeItems={structure.feeItems || []}
                                  structureIndex={idx}
                                  formik={formik}
                                  addFeeHeadDialog={addFeeHeadDialog}
                                />
                              </Box>
                            </Card>
                          );
                        })
                      ) : (
                        <EmptyContent title="No Fee Structure Created" />
                      )}
                    </Box>
                  ));
                })()}
              </>
            )}
          </>
        </Grid>
      </Grid>

      {/* Add New */}
      <CustomDialog
        open={addNewFeeStructureDialog.value}
        handleClose={addNewFeeStructureDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Fee Structure</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Create a new fee structure by defining fee items and their amounts. This helps organize class-wise fee collection by grouping related fee components together into a structured format."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AddFeeStructureDialog
          formik={formik}
          className={selectedClass}
          onClose={addNewFeeStructureDialog.onFalse}
        />
      </CustomDialog>

      {/* Edit Existing */}
      <CustomDialog
        open={!!editFeeStructure}
        handleClose={() => setEditFeeStructure(null)}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Edit Fee Structure</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Modify an existing fee structure by updating fee items and their amounts. You can adjust the structure name, add/remove fee items, and update amounts as needed."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {editFeeStructure && (
          <AddFeeStructureDialog
            formik={formik}
            className={editFeeStructure.className}
            editIndex={editFeeStructure.index}
            onClose={() => setEditFeeStructure(null)}
          />
        )}
      </CustomDialog>

      {/* Delete Fee Structure Confirm */}
      <ConfirmDialog
        open={deleteFeeStructureDialog.value}
        icon="error"
        onClose={() => {
          deleteFeeStructureDialog.onFalse();
          setTimeout(() => {
            setSelectedFeeStrcture(null);
          }, 200);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete fee structure{' '}
            <strong>{selectedFeeStructure?.feeStructureName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              if (selectedFeeStructure) {
                const updated = { ...formik.values.feeStructureClasses };

                // Find className that contains this structure
                const className = Object.keys(updated).find((cls) =>
                  updated[cls].some((fs: any) => fs === selectedFeeStructure)
                );

                if (className) {
                  updated[className] = updated[className].filter(
                    (fs: any) => fs !== selectedFeeStructure
                  );

                  // Update formik values
                  formik.setFieldValue('feeStructureClasses', updated);
                }
              }

              deleteFeeStructureDialog.onFalse();
              setSelectedFeeStrcture(null);
            }}
          >
            Yes
          </Button>
        }
      />
    </>
  );
};

export default FeeStructureStep;
