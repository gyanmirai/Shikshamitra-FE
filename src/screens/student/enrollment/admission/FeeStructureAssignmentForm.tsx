'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useMemo, useEffect } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetFinanceFeeStructureQuery } from 'src/redux/finance/financeFeeStructure';
import {
  Grid,
  Card,
  Stack,
  Checkbox,
  Typography,
  CardContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import type { IInquiryData } from '../Inquiry/type';

interface FeeHeadItem {
  feeHead: string;
  amount: number;
  required: boolean;
  isOneTime: boolean;
  feeCategory: string;
}

interface Props {
  student: IInquiryData | null;
  handleClose: (e: any, isSubmit: boolean) => void;
}

const DUMMY_STRUCTURES = [
  {
    id: '1',
    feeStructureName: 'Standard 1st - Annual (5,000)',
    feeStructureClasses: {
      'std-1': [
        {
          feeItems: [
            {
              feeHead: 'Admission Fee',
              amount: 5000,
              required: true,
              isOneTime: true,
              feeCategory: 'One-Time',
            },
            {
              feeHead: 'Tuition Fee',
              amount: 35000,
              required: true,
              isOneTime: false,
              feeCategory: 'Academic',
            },
            {
              feeHead: 'Library Fee',
              amount: 1500,
              required: true,
              isOneTime: false,
              feeCategory: 'Academic',
            },
            {
              feeHead: 'Sports & Arts Fee',
              amount: 2000,
              required: false,
              isOneTime: false,
              feeCategory: 'Co-Curricular',
            },
            {
              feeHead: 'Transport Fee',
              amount: 12000,
              required: false,
              isOneTime: false,
              feeCategory: 'Services',
            },
          ],
        },
      ],
    },
  },
  {
    id: '2',
    feeStructureName: 'Standard 2nd - Annual (5,000)',
    feeStructureClasses: {
      'std-2': [
        {
          feeItems: [
            {
              feeHead: 'Tuition Fee',
              amount: 38000,
              required: true,
              isOneTime: false,
              feeCategory: 'Academic',
            },
            {
              feeHead: 'Exam Fee',
              amount: 1000,
              required: true,
              isOneTime: false,
              feeCategory: 'Academic',
            },
            {
              feeHead: 'Lab Maintenance',
              amount: 2500,
              required: false,
              isOneTime: false,
              feeCategory: 'Academic',
            },
            {
              feeHead: 'Lunch Service',
              amount: 15000,
              required: false,
              isOneTime: false,
              feeCategory: 'Services',
            },
          ],
        },
      ],
    },
  },
];

const FeeStructureAssignmentForm = ({ student, handleClose }: Props) => {
  const theme = useTheme();
  const { data: structuresData, isLoading: structuresLoading } = useGetFinanceFeeStructureQuery({});

  // Use simulated data if API doesn't provide it
  const activeStructures = useMemo(() => {
    if (structuresData && (structuresData as any).length > 0) return structuresData as any;
    return DUMMY_STRUCTURES;
  }, [structuresData]);

  // const [assignFeeStructure, { isLoading: isSubmitting }] = useQueryAndMutation({
  //     type: 'mutation',
  //     currentQueryAndMutation: useAssignFeeStructureMutation,
  // });

  const formik = useFormik({
    initialValues: {
      feeStructureId: '',
      selectedFeeHeads: [] as { feeHeadId: string; isSelected: boolean }[],
    },
    validationSchema: Yup.object({
      feeStructureId: Yup.string().required('Fee Structure is required'),
    }),
    onSubmit: async (values) => {
      try {
        // await assignFeeStructure({
        //     studentId: student?.studentId,
        //     ...values,
        // }).unwrap();
        shikshaMitraToast.success({ message: 'Fee structure assigned successfully' });
        handleClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });

  const selectedStructure = useMemo(() => {
    if (!formik.values.feeStructureId) return null;
    return activeStructures.find((s: any) => s.id === formik.values.feeStructureId);
  }, [formik.values.feeStructureId, activeStructures]);

  const feeHeads = useMemo(() => {
    if (!selectedStructure) return [];

    // For dummy data, we simulate selection logic
    // In real app, we'd use student?.standardId
    const standardKey = selectedStructure.id === '1' ? 'std-1' : 'std-2';
    const classStructures = selectedStructure.feeStructureClasses?.[standardKey] || [];

    if (classStructures.length === 0) return [];
    return classStructures[0].feeItems || [];
  }, [selectedStructure]);

  useEffect(() => {
    if (feeHeads.length > 0) {
      const initialSelected = feeHeads.map((item: FeeHeadItem) => ({
        feeHeadId: item.feeHead,
        isSelected: item.required,
      }));
      formik.setFieldValue('selectedFeeHeads', initialSelected);
    } else {
      formik.setFieldValue('selectedFeeHeads', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeHeads]);

  const handleToggleFeeHead = (feeHeadId: string) => {
    const updated = formik.values.selectedFeeHeads.map((item) =>
      item.feeHeadId === feeHeadId ? { ...item, isSelected: !item.isSelected } : item
    );
    formik.setFieldValue('selectedFeeHeads', updated);
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3} sx={{ pt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              fullWidth
              label="Select Fee Structure *"
              options={activeStructures}
              value={formik.values.feeStructureId}
              onChange={(value) => formik.setFieldValue('feeStructureId', value)}
              labelKey="feeStructureName"
              valueKey="id"
              isLoading={structuresLoading}
              error={formik.touched.feeStructureId && Boolean(formik.errors.feeStructureId)}
              helperText={
                (formik.touched.feeStructureId && (formik.errors.feeStructureId as string)) || ''
              }
            />
          </Grid>

          {formik.values.feeStructureId && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Fee Heads
              </Typography>
              <Grid container spacing={2}>
                {feeHeads.map((item: FeeHeadItem) => {
                  const isSelected = formik.values.selectedFeeHeads.find(
                    (f) => f.feeHeadId === item.feeHead
                  )?.isSelected;

                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={item.feeHead}>
                      <Card
                        variant="outlined"
                        sx={{
                          position: 'relative',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? 'grey.100' : 'background.paper',
                          transition: 'all 0.3s',
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2">{item.feeHead}</Typography>
                              <Typography variant="h6">₹ {formatNumber(item.amount)}</Typography>
                              <Stack direction="row" spacing={1}>
                                {item.isOneTime && <Label color="info">One-Time</Label>}
                                <Label
                                  color={
                                    item.required ? 'error' : isSelected ? 'success' : 'default'
                                  }
                                >
                                  {item.required
                                    ? 'Mandatory'
                                    : isSelected
                                      ? 'Selected'
                                      : 'Optional'}
                                </Label>
                              </Stack>
                            </Stack>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={!!isSelected}
                                  disabled={item.required}
                                  onChange={() => handleToggleFeeHead(item.feeHead)}
                                />
                              }
                              label=""
                              sx={{ mr: 0 }}
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          )}
        </Grid>
      </DialogScrollContent>

      <DialogActions>
        <CancelButton onClick={() => handleClose(null, false)} />
        <LoadingButton
          loading={false}
          onClick={(e: any) => formik.handleSubmit(e)}
          disabled={!formik.values.feeStructureId}
          variant="contained"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Assign Structure
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default FeeStructureAssignmentForm;
