import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  FeeStructureClassStatusType,
  FeeStructureClassStatusTypeColors,
} from 'src/enums/fee-structure-statusType';
import {
  Box,
  Grid,
  Chip,
  Button,
  Tooltip,
  Accordion,
  IconButton,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import FeeStructureCard from './FeeStructureCard';
import AddFeeStructureDialog from './FeeStructureDialog';

const FeeStructureStep = ({ formik }: { formik: any }) => {
  const theme = useTheme();
  const [editFeeStructure, setEditFeeStructure] = useState<{
    className: string;
    index: number;
  } | null>(null);
  const deleteFeeStructureDialog = useBoolean();
  const [selectedFeeStructure, setSelectedFeeStrcture] = useState<any>(null);
  const addNewFeeStructureDialog = useBoolean();
  const [selectedClass, setSelectedClass] = useState('');
  console.log('formik erroesss====', formik.errors);
  console.log('formik values======', formik.values);

  const [currentClickableClass, setCurrentClickableClass] = useState<string | null>(null);

  return (
    <>
      {/* Select Classes Section */}
      {Object.keys(formik.values.feeStructureClasses).length > 0 && (
        <SectionCard title="Select Classes">
          <Grid size={12}>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {Object.keys(formik.values.feeStructureClasses).map((className) => {
                const firstFeeStructure = formik.values.feeStructureClasses[className]?.[0];

                // Check if class has actual fee structure data (fee items)
                const hasData =
                  firstFeeStructure?.feeItems && firstFeeStructure.feeItems.length > 0;

                // Determine status based on currentClickableClass and data availability
                let status;
                if (currentClickableClass === className) {
                  status = FeeStructureClassStatusType.Current;
                } else if (hasData) {
                  status = FeeStructureClassStatusType.Completed;
                } else {
                  status = FeeStructureClassStatusType.Remaining;
                }

                return (
                  <Box key={className} textAlign="center">
                    <Button
                      variant="contained"
                      color={
                        FeeStructureClassStatusTypeColors[status as FeeStructureClassStatusType] ??
                        'primary'
                      }
                      onClick={() => {
                        // Only allow clicking if class has data or is being set as current
                        if (hasData || currentClickableClass !== className) {
                          setCurrentClickableClass(className);

                          const updatedStatus = { ...formik.values.feeStructureClasses };

                          Object.keys(updatedStatus).forEach((cls) => {
                            updatedStatus[cls] = updatedStatus[cls].map((fs: any, idx: number) => {
                              const clsHasData = fs.feeItems && fs.feeItems.length > 0;

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
                        }
                        setSelectedClass(className);
                      }}
                      sx={{
                        minWidth: 80,
                        textTransform: 'none',
                        fontWeight: 500,
                        // Disable button if it has no data and is not current
                        ...(!hasData &&
                          currentClickableClass !== className && {
                            opacity: 0.6,
                          }),
                      }}
                    >
                      {className.replace('Class ', '')}
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Status Legend */}
          <Grid size={12}>
            <Box display="flex" alignItems="center" gap={3} mb={2}>
              {[
                FeeStructureClassStatusType.Current,
                FeeStructureClassStatusType.Completed,
                FeeStructureClassStatusType.Remaining,
              ].map((statusKey) => {
                const count = Object.values(formik.values.feeStructureClasses)
                  .flat()
                  .filter((cls: any) => cls.status === statusKey).length;

                const dotColor =
                  statusKey === FeeStructureClassStatusType.Current
                    ? theme.vars.palette.info.main
                    : statusKey === FeeStructureClassStatusType.Completed
                      ? theme.vars.palette.success.main
                      : theme.vars.palette.warning.main;

                return (
                  <Box key={statusKey} display="flex" alignItems="center" gap={1}>
                    <FiberManualRecordIcon sx={{ fontSize: 12, color: dotColor.toString() }} />
                    <Typography variant="body2" color="text.primary">
                      {FeeStructureClassStatusType[statusKey]}{' '}
                      {statusKey !== FeeStructureClassStatusType.Current &&
                        `(${String(count).padStart(2, '0')})`}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </SectionCard>
      )}

      {/* 🔹 Global Add Fee Structure Button */}
      {selectedClass && (
        <Box mb={2} display="flex" justifyContent="flex-end" alignItems="flex-end">
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => {
              addNewFeeStructureDialog.onTrue();
            }}
          >
            Fee Structure
          </Button>
        </Box>
      )}

      {/* Active Class Fee Structures */}
      {Object.entries(formik.values.feeStructureClasses)
        .filter(([_, feeStructures]: any) =>
          feeStructures.some((fs: any) => fs.status === FeeStructureClassStatusType.Current)
        )
        .map(([className, feeStructures]: any) => (
          <Box key={className}>
            {feeStructures.length > 0 &&
              feeStructures.map((structure: any, idx: number) => {
                const totalFeeAmount =
                  structure.feeItems?.reduce(
                    (sum: number, item: any) => sum + (item.amount || 0),
                    0
                  ) || 0;

                return (
                  <Accordion
                    key={idx}
                    defaultExpanded
                    sx={{
                      border: '1px solid #ccc',
                      boxShadow: 'none',
                      borderRadius: 1,
                      '&:before': { display: 'none' },
                      mb: 2,
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      {/* Left Side: Structure Name + Amount */}
                      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 600, mr: 1 }}>
                          {structure.feeStructureName || `Fee Structure ${idx + 1}`}
                        </Typography>

                        <Chip
                          label={`Total : ${formatNumber(totalFeeAmount, 'INR')}`}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      {/* Right Side: Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Edit Fee Structure">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditFeeStructure({ className, index: idx });
                            }}
                          >
                            <Iconify icon={GlobalIcons.edit} />
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
                            <Iconify icon={GlobalIcons.delete} color="error" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <FeeStructureCard
                          className={className}
                          feeItems={structure.feeItems || []}
                          structureIndex={idx}
                          formik={formik}
                        />
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
          </Box>
        ))}

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
