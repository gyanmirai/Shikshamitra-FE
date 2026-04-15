import { styled } from '@mui/material/styles';
import React, { useMemo, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentFeeStructureQuery } from 'src/redux/student/admission/admission-api';
import { Box, Card, Grid, Chip, Stack, Checkbox, Typography, CardContent } from '@mui/material';
import { useGetConcessionRequestFeeHeadsQuery } from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

// --- Interfaces based on provided JSON ---
interface IFeeHead {
  feeHeadId: string;
  feeHeadName: string;
  categoryName: string;
  amount: number;
  isOptional: boolean;
  isOneTime: boolean;
  isSelected?: boolean;
}

interface IAdmissionFeeStructure {
  studentFeeStructureId: string;
  standardFeeStructureId: string;
  studentId: string;
  standardId: string;
  structureName: string;
  feeHeads: IFeeHead[];
}

interface Props {
  formik: any;
  concessionTypes: any[];
}

// Custom styled card for the selected state visual
const SelectionCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  borderRadius: 8,
  marginBottom: theme.spacing(2),
  overflow: 'visible', // allows content to flow if needed, but usually hidden is safer
}));

const FeeHeadMappingStep: React.FC<Props> = ({ formik, concessionTypes }) => {
  const { values, setFieldValue, errors, touched } = formik;

  const { data: requestDetails } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionRequestFeeHeadsQuery,
    params: values.id,
    options: {
      skip: !values.id,
      refetchOnMountOrArgChange: true,
    },
  }) as { data: any };

  useEffect(() => {
    if (requestDetails?.data?.concessionTypes) {
      const hydratedFeeHeads: Record<string, string[]> = {};
      requestDetails.data.concessionTypes.forEach((ct: any) => {
        if (ct.feeHeadIds && ct.feeHeadIds.length > 0) {
          hydratedFeeHeads[ct.concessionTypeId] = ct.feeHeadIds;
        }
      });
      const currentKeys = Object.keys(values.selectedFeeHeads || {});
      if (currentKeys.length === 0 && Object.keys(hydratedFeeHeads).length > 0) {
        setFieldValue('selectedFeeHeads', hydratedFeeHeads);
      }
    }
  }, [requestDetails, setFieldValue, values.selectedFeeHeads]);

  const { data: assignedStructureData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentFeeStructureQuery,
    params: { studentId: values.studentId },
    options: { skip: !values.studentId },
  }) as { data: IAdmissionFeeStructure | undefined; isLoading: boolean };

  // Filter concession types that are selected in the previous step
  const selectedConcessionTypes = useMemo(
    () => (concessionTypes as any[])?.filter((ct: any) => values.concessionTypeIds.includes(ct.id)),
    [concessionTypes, values.concessionTypeIds]
  );

  const toggleFeeHead = useCallback(
    (concessionTypeId: string, feeHeadId: string) => {
      const currentSelected: string[] = values.selectedFeeHeads[concessionTypeId] || [];
      const isSelected = currentSelected.includes(feeHeadId);

      let updatedSelected;
      if (isSelected) {
        updatedSelected = currentSelected.filter((id) => id !== feeHeadId);
      } else {
        updatedSelected = [...currentSelected, feeHeadId];
      }

      setFieldValue(
        'selectedFeeHeads',
        {
          ...values.selectedFeeHeads,
          [concessionTypeId]: updatedSelected,
        },
        true
      ); // Enable validation to clear error
    },
    [values.selectedFeeHeads, setFieldValue]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  if (!values.studentId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Please select a student first.</Typography>
      </Box>
    );
  }

  if (isLoading && !assignedStructureData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading fee structure...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {selectedConcessionTypes.length === 0 ? (
        <Typography color="text.disabled" textAlign="center" py={4}>
          No concession types selected. Please go back and select at least one type.
        </Typography>
      ) : (
        selectedConcessionTypes.map((ct: any) => {
          const selectedHeadsForType: string[] = values.selectedFeeHeads[ct.id] || [];
          const selectedCount = selectedHeadsForType.length;
          const hasError =
            touched.selectedFeeHeads &&
            errors.selectedFeeHeads &&
            typeof errors.selectedFeeHeads === 'object' &&
            (errors.selectedFeeHeads as Record<string, string>)[ct.id];

          return (
            <SelectionCard
              key={ct.id}
              sx={{
                borderColor: hasError ? 'error.main' : 'divider',
              }}
            >
              {/* Header Section */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default', // or a light fill like in the image
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    {ct.concessionName || ct.name}
                  </Typography>
                  <Chip
                    label={`${selectedCount} selected`}
                    size="small"
                    color={hasError ? 'error' : 'primary'}
                    sx={{
                      fontWeight: 'bold',
                      height: 24,
                      fontSize: '0.75rem',
                      borderRadius: '12px',
                    }}
                  />
                </Stack>
                {hasError && (
                  <Typography variant="caption" color="error">
                    {(errors.selectedFeeHeads as Record<string, string>)[ct.id]}
                  </Typography>
                )}
              </Box>

              {/* Body Section */}
              <CardContent sx={{ p: 1 }}>
                {!assignedStructureData?.feeHeads?.length ? (
                  <Typography variant="body2" color="text.secondary">
                    No fee heads available.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {assignedStructureData.feeHeads.map((fh: IFeeHead) => {
                      const isChecked = selectedHeadsForType.includes(fh.feeHeadId);
                      return (
                        <Grid size={{ xs: 12, sm: 4 }} key={fh.feeHeadId}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: '1px solid',
                              borderColor: isChecked ? 'primary.main' : 'divider',
                              borderRadius: 1,
                              p: 1.5,
                              bgcolor: isChecked ? 'action.hover' : 'transparent',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Checkbox
                                size="small"
                                checked={isChecked}
                                onChange={() => toggleFeeHead(ct.id, fh.feeHeadId)}
                                sx={{ p: 0.5, mr: 1 }}
                              />
                              <Typography variant="body2" color="text.primary">
                                {fh.feeHeadName}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontWeight: 500 }}
                            >
                              {formatCurrency(fh.amount)}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </CardContent>
            </SelectionCard>
          );
        })
      )}
    </Box>
  );
};

export default FeeHeadMappingStep;
