import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Button, Typography } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  FeeStructureClassStatusType,
  FeeStructureClassStatusTypeColors,
} from 'src/enums/fee-structure-statusType';

import type { IClassWiseFeeData } from '../../type';

interface ClassSelectionViewProps {
  feeStructureClasses: Record<string, IClassWiseFeeData[]>; //  FIXED
  selectedClass: string | null;
  onSelectClass: (className: string) => void;
}

const ClassSelectionView: React.FC<ClassSelectionViewProps> = ({
  feeStructureClasses,
  selectedClass,
  onSelectClass,
}) => {
  const theme = useTheme();
  console.log('feeStructureClassesfeeStructureClasses---', feeStructureClasses);
  const classNames = Object.keys(feeStructureClasses);

  // Ensure the first class is selected by default
  useEffect(() => {
    if (classNames.length > 0 && !selectedClass) {
      onSelectClass(classNames[0]);
    }
  }, [classNames, selectedClass, onSelectClass]);
  if (!feeStructureClasses || Object.keys(feeStructureClasses).length === 0) return null;

  return (
    <SectionCard title="Selected Classes">
      <Grid size={12}>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {classNames.map((className) => {
            const firstFeeStructure = feeStructureClasses[className]?.[0];

            const hasData = firstFeeStructure?.feeItems && firstFeeStructure.feeItems.length > 0;

            let status;
            if (selectedClass === className) {
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
                  color={FeeStructureClassStatusTypeColors[status]}
                  sx={{
                    minWidth: 80,
                    textTransform: 'none',
                    fontWeight: 500,
                    ...(!hasData &&
                      selectedClass !== className && {
                        opacity: 0.6,
                      }),
                  }}
                  onClick={() => {
                    if (hasData || selectedClass !== className) {
                      onSelectClass(className);
                    }
                  }}
                >
                  {className.replace('Class ', '')}
                </Button>
              </Box>
            );
          })}
        </Box>
      </Grid>

      {/* Legend */}

      <Grid size={12}>
        <Box display="flex" alignItems="center" gap={3} mb={2}>
          {[
            FeeStructureClassStatusType.Current,
            FeeStructureClassStatusType.Completed,
            FeeStructureClassStatusType.Remaining,
          ].map((statusKey) => {
            const count = Object.values(feeStructureClasses)
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
  );
};

export default ClassSelectionView;
