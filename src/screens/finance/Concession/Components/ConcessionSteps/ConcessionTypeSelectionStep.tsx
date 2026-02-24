import React, { useMemo } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Grid, Card, Chip, Stack, Typography, CardContent } from '@mui/material'; // Merit/Default
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';

interface Props {
  formik: any;
  concessionTypes: any[];
}

const ConcessionTypeSelectionStep: React.FC<Props> = ({ formik, concessionTypes }) => {
  const { values, setFieldValue, errors, touched } = formik;
  const theme = useTheme();
  const selectedTypeIds = useMemo(() => values.concessionTypeIds || [], [values.concessionTypeIds]);

  const handleToggle = (id: string) => {
    const isSelected = selectedTypeIds.includes(id);
    let newIds = [];
    if (isSelected) {
      newIds = selectedTypeIds.filter((tid: string) => tid !== id);
    } else {
      newIds = [...selectedTypeIds, id];
    }
    setFieldValue('concessionTypeIds', newIds);
    // Reset downstream steps
    setFieldValue('selectedFeeHeads', {});
    setFieldValue('valueEntries', {});
  };

  const selectedConcessions = useMemo(
    () => concessionTypes.filter((ct: any) => selectedTypeIds.includes(ct.id)),
    [concessionTypes, selectedTypeIds]
  );

  return (
    <Box sx={{ p: 1 }}>
      {/* Error Message if any */}
      {touched.concessionTypeIds && errors.concessionTypeIds && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errors.concessionTypeIds}
        </Typography>
      )}

      {/* Grid of Cards */}
      <Grid container spacing={2}>
        {concessionTypes.map((concession) => {
          const isSelected = selectedTypeIds.includes(concession.id);
          // Use dynamic name/description/type from the API response
          const name = concession.concessionName || concession.name || 'Unknown Type';
          const description = concession.description || 'No description available';

          // concessionType might be 'fixed', 'percentage', or an enum value
          // We'll try to display it nicely if it's a string, or ignore if it's just an ID/enum number without mapping
          let typeTag = '';
          if (concession.concessionType && typeof concession.concessionType === 'string') {
            typeTag = concession.concessionType.toUpperCase();
          } else if (concession.concessionTypeName) {
            typeTag = concession.concessionTypeName.toUpperCase();
          }

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={concession.id}>
              <Card
                onClick={() => handleToggle(concession.id)}
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                  border: isSelected
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                  boxShadow: isSelected ? theme.shadows[4] : 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    borderColor: isSelected ? theme.palette.primary.main : theme.palette.grey[400],
                  },
                  height: '100%',
                }}
              >
                {/* Check Icon when selected */}
                {isSelected && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: theme.palette.primary.main,
                    }}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </Box>
                )}

                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack spacing={2} alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {name}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{
                          minHeight: 20, // Ensure consistent height if desc is empty
                          mt: 0.5,
                          mb: 1,
                        }}
                      >
                        {description}
                      </Typography>

                      {typeTag && (
                        <Chip
                          label={typeTag}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            color: theme.palette.text.secondary,
                            borderColor: theme.palette.divider,
                          }}
                        />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Selected Concessions Section */}
      {selectedConcessions.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            SELECTED CONCESSIONS
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {selectedConcessions.map((concession: any) => (
              <Chip
                key={concession.id}
                label={concession.concessionName || concession.name}
                color="primary"
                variant="filled"
                onDelete={() => handleToggle(concession.id)}
                deleteIcon={<Iconify icon={GlobalIcons.cancel} />}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ConcessionTypeSelectionStep;
