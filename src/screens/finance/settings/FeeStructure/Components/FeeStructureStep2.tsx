import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import FeeStructureCard from './FeeStructureCard';
import AddFeeStructureDialog from './FeeStructureDialog';

const FeeStructureStep = ({ formik }: { formik: any }) => {
  const theme = useTheme();
  const addNewFeeStructureDialog = useBoolean();
  const [selectedClass, setSelectedClass] = useState('');
  // 🔹 Handle Add Fee Structure globally
  console.log('formik values----', formik.values);

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
                      variant={currentClickableClass === className ? 'contained' : 'outlined'}
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
                    ? theme.vars.palette.success.main
                    : statusKey === FeeStructureClassStatusType.Completed
                      ? theme.vars.palette.success.light
                      : theme.vars.palette.grey[400];

                return (
                  <Box key={statusKey} display="flex" alignItems="center" gap={1}>
                    <FiberManualRecordIcon sx={{ fontSize: 12, color: dotColor }} />
                    <Typography variant="body2" color="text.primary">
                      {FeeStructureClassStatusType[statusKey]} ({String(count).padStart(2, '0')})
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </SectionCard>
      )}

      {/* 🔹 Global Add Fee Structure Button */}
      <Box mb={2}>
        {Object.entries(formik.values.feeStructureClasses)
          .filter(([_, feeStructures]: any) =>
            feeStructures.some((fs: any) => fs.status === FeeStructureClassStatusType.Current)
          )
          .map(([className]) => (
            <Button
              key={className}
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => {
                addNewFeeStructureDialog.onTrue();
                setSelectedClass(className);
              }}
            >
              Fee Structure
            </Button>
          ))}
      </Box>

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
                    defaultExpanded
                    sx={{
                      border: '1px solid #ccc',
                      boxShadow: 'none', // optional, remove default shadow
                      borderRadius: 1, // optional, round corners
                      '&:before': {
                        display: 'none', // remove default divider line at top
                      },
                      mb: 2,
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
                        {structure.feeStructureName || `Fee Structure ${idx + 1}`}
                      </Typography>
                      <Chip
                        label={`Total Fee Amount : ₹${totalFeeAmount}`}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
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
                  //   </Paper>
                );
              })}
          </Box>
        ))}

      <CustomDialog
        open={addNewFeeStructureDialog.value}
        handleClose={addNewFeeStructureDialog.onFalse}
        title="Add Fee Head"
      >
        <AddFeeStructureDialog
          formik={formik}
          className={selectedClass}
          onClose={addNewFeeStructureDialog.onFalse}
        />
      </CustomDialog>
    </>
  );
};

export default FeeStructureStep;
