import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Paper, Stack, Button, Divider, Skeleton, Typography } from '@mui/material';

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
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        height: '100%',
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 4 },
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
        <Iconify icon="solar:notebook-bold-duotone" width={18} sx={{ color: 'primary.main' }} />
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            Classes
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Select a class to view fee details
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ mb: 1.5 }} />
      <Scrollbar sx={{ height: '480px' }}>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {isLoading ? (
            Array.from(new Array(6)).map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                sx={{ width: 90, height: 36, borderRadius: 1 }}
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
                    sx={{ minWidth: 90, textTransform: 'none', fontWeight: 500 }}
                    onClick={() => onSelectClass(classId)}
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
    </Paper>
  </Grid>
);

export default ClassSelectionView;
