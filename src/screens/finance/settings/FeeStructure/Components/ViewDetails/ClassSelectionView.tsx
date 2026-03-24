import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Button, Skeleton, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

interface ClassSelectionViewProps {
  classList: any[];
  selectedClass: string | null;
  onSelectClass: (classId: string) => void;
  isLoading?: boolean;
}

const ClassSelectionView: React.FC<ClassSelectionViewProps> = ({
  classList,
  selectedClass,
  onSelectClass,
  isLoading,
}) => (
  <Grid size={{ xs: 12, md: 2.4 }}>
    <SectionCard title="Classes" paperProps={{ sx: { p: 1 } }}>
      <Scrollbar sx={{ height: '480px' }}>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {isLoading ? (
            Array.from(new Array(6)).map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                sx={{
                  width: 95,
                  height: 36,
                  borderRadius: 1,
                }}
              />
            ))
          ) : classList.length > 0 ? (
            classList.map((cls) => {
              const className = cls.name;
              const classId = cls.id;

              return (
                <Box key={classId} textAlign="center">
                  <Button
                    variant={selectedClass === classId ? 'contained' : 'outlined'}
                    color={selectedClass === classId ? 'primary' : undefined}
                    sx={{
                      minWidth: 95,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                    onClick={() => {
                      onSelectClass(classId);
                    }}
                  >
                    {className.replace('Class ', '')}
                  </Button>
                </Box>
              );
            })
          ) : (
            <Box sx={{ p: 2, width: '100%', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No classes available
              </Typography>
            </Box>
          )}
        </Box>
      </Scrollbar>
    </SectionCard>
  </Grid>
);

export default ClassSelectionView;
