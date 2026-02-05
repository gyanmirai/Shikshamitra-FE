import type { FormikProps } from 'formik';
import type { Organization } from 'src/types/school';

import React, { memo } from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Grid, TextField, IconButton } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';

import type { INotificationSendSchema } from './type';

interface AudienceFiltersProps {
  formik: FormikProps<INotificationSendSchema>;
  allOrganization: Organization[];
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

/**
 * Component: AudienceFilters
 * Responsibilities:
 * - Rendering Organization selection and Search fields
 */
const AudienceFilters = ({
  formik,
  allOrganization,
  searchTerm,
  handleSearchChange,
  onClearSearch,
}: AudienceFiltersProps) => {
  const theme = useTheme();

  return (
    <>
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField
          error={
            !!formik.errors.audience?.educationMediumStageId &&
            !!formik.touched.audience?.educationMediumStageId
          }
        >
          <ResponsiveMultiSelect
            label="Organizations"
            options={[{ id: 'all', name: 'All' }, ...allOrganization.filter((o) => o.id !== 'all')]}
            value={formik.values.audience?.educationMediumStageId}
            getOptionLabel={(opt) => opt?.name}
            getOptionValue={(opt) => opt?.id}
            onChange={(selectedValues) => {
              const allRealIds = allOrganization.filter((o) => o.id !== 'all').map((o) => o.id);

              const hasAllInSelection = selectedValues.includes('all');
              const wasAllPreviouslySelected =
                formik.values.audience?.educationMediumStageId.includes('all');

              let finalValues: string[] = [];

              if (hasAllInSelection && !wasAllPreviouslySelected) {
                finalValues = ['all', ...allRealIds];
              } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                finalValues = [];
              } else if (hasAllInSelection && wasAllPreviouslySelected) {
                finalValues = selectedValues.filter((id) => id !== 'all');
              } else {
                const allIndividuallySelected = allRealIds.every((id) =>
                  selectedValues.includes(id)
                );

                if (allIndividuallySelected && selectedValues.length === allRealIds.length) {
                  finalValues = ['all', ...allRealIds];
                } else {
                  finalValues = selectedValues;
                }
              }

              formik.setFieldValue('audience.educationMediumStageId', finalValues);
            }}
            error={
              !!(
                formik.touched.audience?.educationMediumStageId &&
                formik.errors.audience?.educationMediumStageId
              )
            }
            helperText={
              formik.touched.audience?.educationMediumStageId &&
              typeof formik.errors.audience?.educationMediumStageId === 'string'
                ? (formik.errors.audience?.educationMediumStageId as string)
                : undefined
            }
          />
        </ShakingTextField>
      </Grid>

      {/* Search */}
      <Grid size={{ xs: 12, md: 8 }}>
        <TextField
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />,
            endAdornment: searchTerm && (
              <IconButton size="small" onClick={onClearSearch} edge="end">
                <ClearIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ),
            sx: {
              borderRadius: 1.5,
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
              fontSize: '14px',
              '& fieldset': {
                border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
              },
              '&:hover fieldset': {
                borderColor: `${varAlpha(theme.vars.palette.grey['500Channel'], 0.4)} !important`,
              },
            },
          }}
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              pr: 1,
            },
          }}
        />
      </Grid>
    </>
  );
};

/**
 * Memoization Justification:
 * Pure UI component that receives many stable props like class and division lists.
 * Prevents re-renders unless the actual data or form state changes.
 */
export default memo(AudienceFilters);
