import { Box, Grid, Button, useTheme, Typography } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  FeeStructureClassStatusType,
  FeeStructureClassStatusTypeColors,
} from 'src/enums/fee-structure-statusType';

import type { IClassWiseFeeData } from '../../type';

interface ClassSelectionViewProps {
  feeStructureClasses: Record<string, IClassWiseFeeData[]>; // ✅ FIXED
  selectedClass: string | null;
  onSelectClass: (className: string) => void;
}

const ClassSelectionView: React.FC<ClassSelectionViewProps> = ({
  feeStructureClasses,
  selectedClass,
  onSelectClass,
}) => {
  const theme = useTheme();

  if (!feeStructureClasses || Object.keys(feeStructureClasses).length === 0) return null;

  return (
    <SectionCard title="Selected Classes">
      <Grid item xs={12}>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {Object.keys(feeStructureClasses).map((className) => {
            // take the first structure’s status for display
            const status = feeStructureClasses[className][0]?.status;
            const isSelected = selectedClass === className;

            return (
              <Box key={className} textAlign="center">
                <Button
                  variant={isSelected ? 'contained' : 'outlined'}
                  color={
                    FeeStructureClassStatusTypeColors[
                      status as keyof typeof FeeStructureClassStatusTypeColors
                    ]
                  }
                  sx={{
                    minWidth: 80,
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                  onClick={() => onSelectClass(className)}
                >
                  {className.replace('Class ', '')}
                </Button>
              </Box>
            );
          })}
        </Box>
      </Grid>

      {/* Legend */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="center" gap={3} mb={2}>
          {[
            FeeStructureClassStatusType.Current,
            FeeStructureClassStatusType.Completed,
            FeeStructureClassStatusType.Remaining,
          ].map((statusKey) => {
            // count how many classes have first structure with this status
            const count = Object.values(feeStructureClasses).filter(
              (cls) => cls[0]?.status === statusKey
            ).length;

            const dotColor =
              statusKey === FeeStructureClassStatusType.Current
                ? theme.palette.success.main
                : statusKey === FeeStructureClassStatusType.Completed
                  ? theme.palette.success.light
                  : theme.palette.grey[400];

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
  );
};

export default ClassSelectionView;
