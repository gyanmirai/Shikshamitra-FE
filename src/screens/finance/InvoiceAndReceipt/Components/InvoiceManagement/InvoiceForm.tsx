import { FinanceFieldSkeleton } from 'src/screens/finance/components/FinanceFormSkeleton';
import type { Board, Division, Standards, AcademicYear } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Button,
  Divider,
  Accordion,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import type { InvoiceFormProps } from './type';

// Billing cycle constants
const BILLING_CYCLES = [
  { id: 'Monthly', name: 'Monthly' },
  { id: 'Quarterly', name: 'Quarterly' },
  { id: 'Half-Yearly', name: 'Half-Yearly' },
  { id: 'Annually', name: 'Annually' },
];

const MONTHS = [
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
];

const QUARTERS = [
  { id: 'Q1 (Apr-Jun)', name: 'Q1 (Apr-Jun)' },
  { id: 'Q2 (Jul-Sep)', name: 'Q2 (Jul-Sep)' },
  { id: 'Q3 (Oct-Dec)', name: 'Q3 (Oct-Dec)' },
  { id: 'Q4 (Jan-Mar)', name: 'Q4 (Jan-Mar)' },
];

const HALF_YEARLY = [
  { id: 'First Half (Apr-Sep)', name: 'First Half (Apr-Sep)' },
  { id: 'Second Half (Oct-Mar)', name: 'Second Half (Oct-Mar)' },
];

// Mock fee structure — in production this comes from API
const MOCK_FEE_ITEMS = [
  { name: 'Tuition Fee', amount: 5000 },
  { name: 'Exam Fee', amount: 800 },
  { name: 'Library Fee', amount: 300 },
];

const InvoiceForm = ({ open, onClose }: InvoiceFormProps) => {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    invoiceDetails: true,
  });

  const handleAccordionToggle = useCallback((panel: string) => {
    setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }, []);
  const formik = useFormik({
    initialValues: {
      academicYear: '',
      board: '',
      medium: '',
      class: '',
      divisions: [] as string[],
      students: [] as any[],
      billingCycle: '',
      billingPeriod: '' as string | string[],
    },
    validationSchema: Yup.object({
      academicYear: Yup.string().required('Academic Year is required'),
      board: Yup.string().required('Board is required'),
      medium: Yup.string().required('Medium is required'),
      class: Yup.string().required('Class is required'),
      divisions: Yup.array().min(1, 'Select at least one division'),
      students: Yup.array().min(1, 'Select at least one student'),
      billingCycle: Yup.string().required('Billing Cycle is required'),
    }),
    onSubmit: (_values) => {
      onClose(null, true);
    },
  });

  const { values, touched, errors, setFieldValue, setFieldTouched, initialValues } = formik;

  const handlePreview = useCallback(() => {
    formik.validateForm().then((validationErrors) => {
      const errorKeys = Object.keys(validationErrors);
      if (errorKeys.length > 0) {
        setExpandedPanels((prev) => ({ ...prev, invoiceDetails: true }));
        formik.setTouched(errorKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      } else {
        setStep('preview');
      }
    });
  }, [formik]);

  // Computed values for preview
  const feeItems = MOCK_FEE_ITEMS;
  const netTotal = useMemo(() => feeItems.reduce((sum, f) => sum + f.amount, 0), [feeItems]);

  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  const [boards, setBoards] = useState([]);

  // Fetch students when division, class and medium are all selected
  useEffect(() => {
    if (values.divisions.length > 0 && values.class && values.medium) {
      const studentPromises = values.divisions.map((divisionId) =>
        getStudents({
          educationMediumStageId: values.medium,
          standardId: values.class,
          divisionId,
        })
      );
      Promise.all(studentPromises).catch((error) => {
        console.error('Error fetching students:', error);
      });
    }
  }, [values.divisions, values.class, values.medium, getStudents]);

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });

  useEffect(() => {
    if (board?.items) {
      const findBoards = board.items.filter(
        (item: Board) => item.academicYearId === values.academicYear
      );
      setBoards(findBoards);
    }
  }, [board?.items, values.academicYear]);

  // Render the billing period selector based on selected billing cycle
  const renderBillingPeriodSelector = () => {
    switch (values.billingCycle) {
      case 'Monthly':
        return (
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Select Months *
            </Typography>
            <Grid container spacing={1}>
              {MONTHS.map((month) => {
                const selected = Array.isArray(values.billingPeriod)
                  ? values.billingPeriod.includes(month)
                  : false;
                return (
                  <Grid size="auto" key={month}>
                    <Chip
                      label={month}
                      variant={selected ? 'filled' : 'outlined'}
                      color={selected ? 'primary' : 'default'}
                      onClick={() => {
                        const current = Array.isArray(values.billingPeriod)
                          ? values.billingPeriod
                          : [];
                        const updated = selected
                          ? current.filter((m) => m !== month)
                          : [...current, month];
                        setFieldValue('billingPeriod', updated);
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        );

      case 'Quarterly':
        return (
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomSelect
              name="billingPeriod"
              label="Quarter *"
              options={QUARTERS}
              labelKey="name"
              valueKey="id"
              value={typeof values.billingPeriod === 'string' ? values.billingPeriod : ''}
              onChange={(value) => setFieldValue('billingPeriod', value)}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            />
          </Grid>
        );

      case 'Half-Yearly':
        return (
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomSelect
              name="billingPeriod"
              label="Half *"
              options={HALF_YEARLY}
              labelKey="name"
              valueKey="id"
              value={typeof values.billingPeriod === 'string' ? values.billingPeriod : ''}
              onChange={(value) => setFieldValue('billingPeriod', value)}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            />
          </Grid>
        );

      case 'Annually':
        return null; // No picker needed for annually

      default:
        return null;
    }
  };

  // Resolved display names for preview
  const selectedAcademicYearName = useMemo(
    () => academicYear?.items?.find((y: AcademicYear) => y.id === values.academicYear)?.name || '',
    [academicYear?.items, values.academicYear]
  );

  const selectedClassName = useMemo(
    () => classes?.find((c: Standards) => c.id === values.class)?.name || '',
    [classes, values.class]
  );

  const selectedDivisionName = useMemo(
    () => allDivision?.find((d: Division) => values.divisions.includes(d.id))?.name || '',
    [allDivision, values.divisions]
  );

  const billingPeriodDisplay = useMemo(() => {
    if (values.billingCycle === 'Monthly' && Array.isArray(values.billingPeriod)) {
      return values.billingPeriod.join(', ');
    }
    if (values.billingCycle === 'Annually') return 'Full Year (Apr-Mar)';
    return (values.billingPeriod as string) || '-';
  }, [values.billingCycle, values.billingPeriod]);

  const selectedStudentName = useMemo(() => values.students?.[0]?.name || '-', [values.students]);

  // ─── Preview Step ──────────────────────────────────────────────
  const renderPreviewStep = () => (
    <>
      <DialogScrollContent>
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Green gradient header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #00A76F 0%, #5BE49B 100%)',
              px: 3,
              py: 2.5,
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box>
              <Typography
                variant="overline"
                fontWeight={700}
                letterSpacing={2}
                sx={{ opacity: 0.9, display: 'block', mb: 0.25 }}
              >
                Invoice Preview
              </Typography>
              <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
                Draft Invoice
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {selectedAcademicYearName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {new Date().toISOString().split('T')[0]}
              </Typography>
            </Box>
          </Box>

          {/* Card body */}
          <Box sx={{ p: 2 }}>
            {/* Billing Period pill */}
            <Box
              sx={{
                border: '1.5px solid',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                borderRadius: 2,
                px: 2.5,
                py: 1.25,
                mb: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Billing Period
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Iconify icon="mdi:calendar-month" width={18} color="primary.main" />
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  {billingPeriodDisplay}
                </Typography>
              </Box>
            </Box>

            {/* Student & class info grid */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              {[
                { label: 'Student', value: selectedStudentName },
                {
                  label: 'Class',
                  value: `${selectedClassName} — Div ${selectedDivisionName}`,
                },
                { label: 'Billing Cycle', value: values.billingCycle },
                { label: 'Academic Year', value: selectedAcademicYearName },
              ].map((field) => (
                <Grid size={{ xs: 6 }} key={field.label}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    fontWeight={500}
                    sx={{ display: 'block', mb: 0.25 }}
                  >
                    {field.label}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {field.value || '-'}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Divider />

            {/* Fee items */}
            <Box sx={{ mt: 2, mb: 1 }}>
              {feeItems.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.25,
                    px: 0.5,
                    borderBottom: idx < feeItems.length - 1 ? '1px dashed' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{item.amount.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Total Due box */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1,
                px: 2,
                py: 1.5,
                bgcolor: '#FFF8E1',
                borderRadius: 2,
                border: '1px solid #FFE082',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} color="error.main">
                Total Due
              </Typography>
              <Typography variant="subtitle1" fontWeight={800} color="success.dark">
                ₹{netTotal.toLocaleString()}
              </Typography>
            </Box>

            {/* Info alert */}
          </Box>
        </Paper>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, gap: 1, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon="mdi:arrow-left" />}
          onClick={() => setStep('form')}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
          type="button"
          variant="contained"
          size="small"
          sx={{
            bgcolor: 'grey.900',
            '&:hover': { bgcolor: 'grey.800' },
          }}
          onClick={() => formik.handleSubmit()}
        >
          Generate Invoice
        </Button>
      </DialogActions>
    </>
  );

  if (step === 'preview') {
    return (
      <BackPopUpChecked initialValues={initialValues} currentValues={values}>
        {renderPreviewStep()}
      </BackPopUpChecked>
    );
  }

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <DialogScrollContent>
        <Accordion
          expanded={expandedPanels.invoiceDetails}
          onChange={() => handleAccordionToggle('invoiceDetails')}
          disableGutters
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px !important',
            mb: 1.5,
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
            <Typography variant="subtitle2" fontWeight={700}>
              Invoice Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {/* Academic Year */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(touched.academicYear && errors.academicYear)}>
                  <CustomSelect
                    name="academicYear"
                    label="Academic Year *"
                    isLoading={yearLoading}
                    options={academicYear?.items || []}
                    value={values.academicYear}
                    labelKey="name"
                    valueKey="id"
                    onChange={(value) => {
                      const findBoards = board?.items.filter(
                        (item: Board) => item.academicYearId === value
                      );
                      setBoards(findBoards);
                      setFieldValue('board', '');
                      setFieldValue('medium', '');
                      setFieldValue('class', '');
                      setFieldValue('divisions', []);
                      setFieldValue('students', []);
                      setFieldValue('academicYear', value);
                    }}
                    error={!!(touched.academicYear && errors.academicYear)}
                    helperText={(touched.academicYear && errors.academicYear) || undefined}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Board */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(touched.board && errors.board)}>
                  <CustomSelect
                    name="board"
                    label="Board *"
                    isLoading={boardLoading}
                    options={boards || []}
                    labelKey="name"
                    valueKey="id"
                    value={values.board}
                    onChange={(value) => {
                      setFieldValue('medium', '');
                      setFieldValue('class', '');
                      setFieldValue('divisions', []);
                      setFieldValue('students', []);
                      setFieldValue('board', value);
                    }}
                    error={!!(touched.board && errors.board)}
                    helperText={(touched.board && errors.board) || undefined}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    disabled={!values.academicYear}
                  />
                </ShakingTextField>
              </Grid>

              {/* Medium */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(touched.medium && errors.medium)}>
                  <CustomSelect
                    name="medium"
                    label="Medium *"
                    disabled={!values.board}
                    options={
                      board?.items?.find((item: Board) => item.id === values.board)
                        ?.educationMediums || []
                    }
                    value={values.medium}
                    labelKey="name"
                    valueKey="id"
                    onChange={async (value) => {
                      setFieldValue('medium', value);
                      setFieldValue('class', '');
                      setFieldValue('divisions', []);
                      setFieldValue('students', []);
                      setFieldTouched('medium', false);
                      await getClassByMedium(value);
                    }}
                    error={!!(touched.medium && errors.medium)}
                    helperText={(touched.medium && errors.medium) || undefined}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Class */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(touched.class && errors.class)}>
                  <CustomSelect
                    name="class"
                    label="Class *"
                    disabled={!values.medium}
                    isLoading={classLoading}
                    labelKey="name"
                    valueKey="id"
                    options={classes || []}
                    value={values.class}
                    onChange={(value) => {
                      setFieldValue('class', value);
                      setFieldValue('divisions', []);
                      setFieldValue('students', []);
                      const selectedClass = classes?.find((c: Standards) => c.id === value);
                      if (selectedClass?.divisions) {
                        setAllDivision(selectedClass.divisions);
                      }
                    }}
                    error={!!(touched.class && errors.class)}
                    helperText={(touched.class && errors.class) || undefined}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Division (multi) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(touched.divisions && errors.divisions)}>
                  <CustomSelect
                    options={allDivision}
                    label="Division *"
                    value={values.divisions}
                    onChange={(val) => {
                      setFieldValue('divisions', val);
                      setFieldValue('students', []);
                    }}
                    onBlur={() => setFieldTouched('divisions', true)}
                    error={touched.divisions && Boolean(errors.divisions)}
                    helperText={((touched.divisions && errors.divisions) as string) || undefined}
                    labelKey="name"
                    valueKey="id"
                    multiple
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    disabled={!values.class}
                  />
                </ShakingTextField>
              </Grid>

              {/* Student (multi autocomplete) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(touched.students && errors.students)}>
                  <FinanceFieldSkeleton
                    loading={isLoading && !formik.isSubmitting}
                    label="Loading students"
                  >
                    <Autocomplete
                      loading={isLoading}
                      noOptionsText={<Typography variant="caption">No students found</Typography>}
                      multiple
                      fullWidth
                      value={values.students}
                      onChange={(_e, value: any) => setFieldValue('students', value)}
                      onBlur={() => setFieldTouched('students', true)}
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip
                              key={key}
                              label={option.name}
                              variant="soft"
                              size="small"
                              {...tagProps}
                            />
                          );
                        })
                      }
                      options={tableData}
                      getOptionLabel={(option: any) => option?.name || ''}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Student *"
                          fullWidth
                          error={!!(touched.students && errors.students)}
                          helperText={
                            ((touched.students && errors.students) as string) || undefined
                          }
                        />
                      )}
                      renderOption={(prop: any, option: any) => (
                        <li {...prop} key={option.id}>
                          {option.name}
                        </li>
                      )}
                      disabled={values.divisions.length === 0}
                    />
                  </FinanceFieldSkeleton>
                </ShakingTextField>
              </Grid>

              {/* Billing Cycle */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(touched.billingCycle && errors.billingCycle)}>
                  <CustomSelect
                    name="billingCycle"
                    label="Billing Cycle *"
                    options={BILLING_CYCLES}
                    labelKey="name"
                    valueKey="id"
                    value={values.billingCycle}
                    onChange={(value) => {
                      setFieldValue('billingCycle', value);
                      // Reset period when cycle changes
                      setFieldValue(
                        'billingPeriod',
                        value === 'Monthly' ? [] : value === 'Annually' ? 'Full Year (Apr-Mar)' : ''
                      );
                    }}
                    error={!!(touched.billingCycle && errors.billingCycle)}
                    helperText={(touched.billingCycle && errors.billingCycle) || undefined}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Billing Period (dynamic based on cycle) */}
              {renderBillingPeriodSelector()}

              {/* Fee Structure Preview — shows when student is selected */}
              {values.students.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 2,
                      mt: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      textTransform="uppercase"
                      color="primary.main"
                      letterSpacing={1}
                    >
                      Fee Structure Preview
                    </Typography>

                    <Box sx={{ mt: 1.5 }}>
                      {feeItems.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            py: 0.75,
                            borderBottom: idx < feeItems.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="body2">{item.name}</Typography>
                          <Typography variant="body2">₹{item.amount.toLocaleString()}</Typography>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Net Total
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        ₹{netTotal.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon="mdi:file-eye-outline" />}
          endIcon={<Iconify icon="mdi:arrow-right" />}
          type="button"
          variant="contained"
          size="small"
          onClick={handlePreview}
        >
          Preview Invoice
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default InvoiceForm;
