import type { IColumn } from 'src/components/customizabaleTable/type';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
/* eslint-disable import/order */
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import React, { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CloseIcon from '@mui/icons-material/Close';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Step,
  Paper,
  Button,
  Divider,
  Stepper,
  Checkbox,
  StepLabel,
  TextField,
  IconButton,
  Typography,
  StepContent,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import AdditionalFilters from './AdditionalFilters';
import HierarchyTextView from './HorizonatalTreeView';
import AcademicFilterDrawer from './AcademicFilterDrawer';
import { getGroupInitialValues } from './getGroupInitialValues';

import type { IGroup } from './type';
// import HorizontalTreeView from './HorizonatalTreeView'; // legacy tree view not used in new flow
import type { AcademicFilterDrawerProps } from './AcademicFilterDrawer';

// Validation schema (reused)
export const groupValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Group Name is required'),
  description: Yup.string().nullable(),
  ruleBased: Yup.object().shape({
    academicRules: Yup.array(),
    roles: Yup.array(),
    studentFilters: Yup.array(),
    employeeFilters: Yup.array(),
  }),
  nameBased: Yup.object().shape({
    selectedUserIds: Yup.array(),
  }),
});

const isRuleBasedEmpty = (ruleBased: any) => {
  if (!ruleBased) return true;
  const hasAcademic = ruleBased.academicRules?.some(
    (r: any) =>
      (r.boards?.length || 0) > 0 ||
      (r.mediums?.length || 0) > 0 ||
      (r.stages?.length || 0) > 0 ||
      (r.classes?.length || 0) > 0 ||
      (r.divisions?.length || 0) > 0
  );
  const hasRoles = (ruleBased.roles?.length || 0) > 0;
  const hasStudentFilters = (ruleBased.studentFilters?.length || 0) > 0;
  const hasEmployeeFilters = (ruleBased.employeeFilters?.length || 0) > 0;
  return !hasAcademic && !hasRoles && !hasStudentFilters && !hasEmployeeFilters;
};

interface GroupFormProps {
  initialValues?: any; // TODO: replace with accurate type
  isEdit?: boolean;
  onClose?: (value: any, success: boolean) => void;
}

// Fields per step for selective validation
const STEP_FIELDS: string[][] = [
  ['name', 'description'], // General Information
  [], // Filters (currently no required fields gating progress)
  [], // Final Preview
];

const cardStyle = {
  p: 3,
  borderRadius: 2,
  boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
  border: '1px solid rgba(145, 158, 171, 0.08)',
};
// Dummy data rows for selection table (mix of students and employees)
const dummyRows = [
  {
    id: 'stu-001',
    type: 'Student',
    role: 'Learner',
    firstName: 'Amit',
    lastName: 'Shah',
    fullName: 'Amit Shah',
    class: '5',
    division: 'A',
    rollNo: '12',
    board: 'CBSE',
    medium: 'English',
    status: 'Active',
  },
  {
    id: 'stu-002',
    type: 'Student',
    role: 'Learner',
    firstName: 'Neha',
    lastName: 'Patel',
    fullName: 'Neha Patel',
    class: '6',
    division: 'B',
    rollNo: '7',
    board: 'GSEB',
    medium: 'Gujarati',
    status: 'Inactive',
  },
  {
    id: 'emp-101',
    type: 'Employee',
    role: 'Faculty',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    fullName: 'Rajesh Kumar',
    department: 'Teaching',
    designation: 'Math Teacher',
    employeeCode: 'EMP101',
    status: 'Active',
  },
  {
    id: 'emp-102',
    type: 'Employee',
    role: 'Staff',
    firstName: 'Priya',
    lastName: 'Verma',
    fullName: 'Priya Verma',
    department: 'Admin',
    designation: 'Clerk',
    employeeCode: 'EMP102',
    status: 'Active',
  },
];

// Dummy table columns will be created inside component to access formik safely.

interface IGroupFormValues extends IGroup {
  searchQuery: string;
  searchTriggered: boolean;
  selection: string; // Dummy field for global selection error
}

const GroupForm: React.FC<GroupFormProps> = ({ initialValues, isEdit, onClose }) => {
  const academicDrawer = useBoolean();
  const [activeStep, setActiveStep] = useState(0);
  const [filterTab, setFilterTab] = useState(0); // 0 = Condition Based, 1 = Selection Based
  const formikRef = useRef<any>(null);
  const [currentFilterName, setCurrentFilterName] = useState('');

  const formik = useFormik<IGroupFormValues>({
    initialValues: {
      ...getGroupInitialValues(initialValues),
      searchQuery: '',
      searchTriggered: false,
      selection: '',
    } as IGroupFormValues,
    validationSchema: groupValidationSchema,
    validate: (values) => {
      const errors: any = {};
      if (isRuleBasedEmpty(values.ruleBased) && values.nameBased.selectedUserIds.length === 0) {
        errors.selection =
          'At least one selection is required (either via Rules or Name Based Selection)';
      }
      return errors;
    },
    onSubmit: (values) => {
      // Placeholder submit logic
      onClose?.(values, true);
    },
  });
  // attach formik to ref for table render access
  formikRef.current = formik;
  // Keep computed total in sync (number of selected users)
  // useEffect(() => {
  //   const total = (formik.values.nameBased.selectedUserIds || []).length;
  //   if (formik.values.total !== total) {
  //     formik.setFieldValue('total', total, false);
  //   }
  // }, [formik, formik.values.nameBased.selectedUserIds]);

  // Selection table columns
  const allIds = dummyRows.map((r) => r.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => formik.values.nameBased.selectedUserIds.includes(id));
  const selectionColumns: IColumn[] = [
    {
      id: 'select',
      label: ' ',
      minWidth: 20,
      isSort: false,
      isFilter: false,
      align: 'left' as const,
      sticky: true,
      render: (_: any, row: any) => (
        <Checkbox
          size="small"
          checked={formik.values.nameBased.selectedUserIds.includes(row.id)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const current = new Set(formik.values.nameBased.selectedUserIds);
            if (e.target.checked) current.add(row.id);
            else current.delete(row.id);
            formik.setFieldValue('nameBased.selectedUserIds', Array.from(current));
          }}
        />
      ),
      renderColumn: () => {
        const selectedCount = formik.values.nameBased.selectedUserIds.length;
        const indeterminate = selectedCount > 0 && !allSelected;
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={indeterminate}
              onChange={() => {
                if (allSelected) formik.setFieldValue('nameBased.selectedUserIds', []);
                else formik.setFieldValue('nameBased.selectedUserIds', allIds);
              }}
            />
          </Box>
        );
      },
    },
    { id: 'fullName', label: 'Full Name', minWidth: 160, align: 'left' as const, sticky: true },
    { id: 'type', label: 'Role', minWidth: 100, align: 'left' as const },
    { id: 'class', label: 'Class', minWidth: 80, align: 'left' as const },
    { id: 'division', label: 'Division', minWidth: 90, align: 'left' as const },
    { id: 'rollNo', label: 'Roll No', minWidth: 90, align: 'left' as const },
    { id: 'board', label: 'Board', minWidth: 110, align: 'left' as const },
    { id: 'medium', label: 'Medium', minWidth: 110, align: 'left' as const },
    { id: 'department', label: 'Department', minWidth: 140, align: 'left' as const },
    { id: 'designation', label: 'Designation', minWidth: 160, align: 'left' as const },
    { id: 'employeeCode', label: 'Emp Code', minWidth: 110, align: 'left' as const },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      align: 'left' as const,
      sticky: true,
      render(value, row) {
        return (
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 0.75,
              typography: 'caption',
              fontWeight: 700,
              bgcolor: (theme) =>
                alpha(theme.palette[value === 'Active' ? 'success' : 'error'].main, 0.1),
              color: (theme) => theme.palette[value === 'Active' ? 'success' : 'error'].dark,
              display: 'inline-flex',
            }}
          >
            {value}
          </Box>
        );
      },
    },
  ];

  const gotoNext = async () => {
    const fields = STEP_FIELDS[activeStep];
    if (activeStep === 0 && fields.length) {
      // Mark touched
      fields.forEach((f: string) => formik.setFieldTouched(f, true, false));
      const errors = await formik.validateForm();
      const stepErrors = Object.keys(errors).filter((e) => fields.includes(e));
      if (stepErrors.length) {
        return; // Abort progression if errors
      }
    }

    if (activeStep === 1) {
      const errors = await formik.validateForm();
      if (errors.selection) {
        formik.setFieldTouched('selection', true, false);
        return;
      }
    }
    setActiveStep((prev: number) => prev + 1);
  };

  const gotoBack = () => {
    setActiveStep((prev: number) => prev - 1);
  };

  console.log('formik----', formik.values);

  const renderGeneralInformation = () => (
    <SectionCard
      title="General Information"
      paperProps={{
        sx: {
          ...cardStyle,
          mb: 3,
        },
      }}
      gridProps={{ sx: { alignItems: 'stretch', gap: 3 } }}
    >
      <Grid size={{ xs: 12 }}>
        <Typography variant="body2" color="text.secondary">
          Provide a unique name and a brief description for this group.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
          <TextField
            fullWidth
            label="Group Name *"
            name="name"
            value={formik.values.name}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('name', value);
            }}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={(formik.touched.name && (formik.errors.name as string)) || ''}
            size="small"
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Editor
          value={formik.values.description}
          onChange={(value) => formik.setFieldValue('description', value)}
          placeholder="Write a description..."
          sx={{
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 1,
            '&:hover': { borderColor: 'text.primary' },
            ...(!!formik.touched.description &&
              !!formik.errors.description && {
                borderColor: 'error.main',
              }),
            '&:focus-within': {
              borderColor: 'primary.main',
            },
            minHeight: 120,
            overflow: 'hidden',
          }}
        />
      </Grid>
    </SectionCard>
  );

  const handleAcademicApply: AcademicFilterDrawerProps['onApply'] = (
    _ids,
    _breakdown,
    _nodes,
    _breakdownNodes,
    hierarchicalSelectedTree,
    currentFilter
  ) => {
    const extractIds = (nodes: any[], targetType: string): string[] => {
      let ids: string[] = [];
      nodes.forEach((n) => {
        if (n.type === targetType) ids.push(n.id);
        if (n.children) ids = ids.concat(extractIds(n.children, targetType));
      });
      return Array.from(new Set(ids));
    };

    const newRule = {
      boards: extractIds(hierarchicalSelectedTree || [], 'boards'),
      mediums: extractIds(hierarchicalSelectedTree || [], 'mediums'),
      stages: extractIds(hierarchicalSelectedTree || [], 'organizations'),
      classes: extractIds(hierarchicalSelectedTree || [], 'standards'),
      divisions: extractIds(hierarchicalSelectedTree || [], 'divisions'),
    };

    if (currentFilter === 'ruleBased') {
      formik.setFieldValue('ruleBased.academicRules', [newRule]);
      formik.setFieldValue('ruleBased.academicTree', hierarchicalSelectedTree || []);
    } else if (currentFilter === 'nameBased') {
      formik.setFieldValue('nameBased.academicRules', [newRule]);
      formik.setFieldValue('nameBased.academicTree', hierarchicalSelectedTree || []);
    }
  };

  const renderFilters = () => (
    <SectionCard
      title=""
      paperProps={{
        sx: {
          ...cardStyle,
          p: 0, // Reset padding for cleaner tab integration
          overflow: 'hidden',
          mb: 3,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Grid size={{ xs: 12 }}>
        {/* Tabs Row - Modernized */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            borderBottom: (theme) => `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 0.5,
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            }}
          >
            {[
              { label: 'Rule Based', value: 0 },
              { label: 'Name Based', value: 1 },
            ].map((tab) => {
              const isSelected = filterTab === tab.value;
              return (
                <Box
                  key={tab.value}
                  onClick={() => setFilterTab(tab.value)}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 0.75,
                    cursor: 'pointer',
                    typography: 'subtitle2',
                    fontWeight: isSelected ? 700 : 500,
                    transition: (theme) =>
                      theme.transitions.create(['background-color', 'color', 'box-shadow']),
                    bgcolor: isSelected ? 'background.paper' : 'transparent',
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    boxShadow: isSelected ? (theme) => theme.customShadows.z4 : 'none',
                    '&:hover': {
                      color: isSelected ? 'primary.main' : 'text.primary',
                      bgcolor: isSelected
                        ? 'background.paper'
                        : (theme) => alpha(theme.palette.grey[500], 0.04),
                    },
                  }}
                >
                  {tab.label}
                </Box>
              );
            })}
          </Box>
        </Box>
        {formik.errors.selection && (
          <Box
            sx={{
              px: 3,
              py: 1,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
              borderBottom: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
            }}
          >
            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
              {formik.errors.selection as string}
            </Typography>
          </Box>
        )}
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Box sx={{ p: 3 }}>
          {filterTab === 0 && (
            <Box>
              <Grid container spacing={4}>
                <Grid
                  size={{ xs: 12, sm: 8 }}
                  sx={{
                    borderRight: (theme) => ({ sm: `1px dashed ${theme.palette.divider}` }),
                    pr: { sm: 4 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                      <Iconify
                        icon="solar:globus-outline"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Academic Selections
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={() => {
                        setCurrentFilterName('ruleBased');
                        academicDrawer.onTrue();
                      }}
                      sx={{ borderRadius: 1 }}
                    >
                      Add Selection
                    </Button>
                  </Box>

                  {formik.values.ruleBased.academicTree.length === 0 ? (
                    <Box
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: (theme) => `1px dashed ${theme.palette.divider}`,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                      }}
                    >
                      <Iconify
                        icon="solar:layers-minimalistic-bold-duotone"
                        width={48}
                        sx={{ color: 'text.disabled', mb: 1, opacity: 0.5 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        No academic rules applied. Click &quot;Add Selection&quot; to start.
                      </Typography>
                    </Box>
                  ) : (
                    <Scrollbar sx={{ maxHeight: 300 }}>
                      <HierarchyTextView data={formik.values.ruleBased.academicTree} />
                    </Scrollbar>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Iconify
                      icon="solar:users-group-rounded-bold-duotone"
                      width={20}
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Roles
                    </Typography>
                  </Box>
                  <Grid container spacing={0.5}>
                    {['Teacher', 'Principle', 'Cashier', 'Driver', 'Librarian', 'Peon'].map(
                      (role) => (
                        <Grid size={{ xs: 12 }} key={role}>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                              },
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={formik.values.ruleBased.roles?.includes(role)}
                                  onChange={(e) => {
                                    const current = new Set(formik.values.ruleBased.roles || []);
                                    if (e.target.checked) current.add(role);
                                    else current.delete(role);
                                    formik.setFieldValue('ruleBased.roles', Array.from(current));
                                  }}
                                />
                              }
                              label={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {role}
                                </Typography>
                              }
                              sx={{ mr: 0, width: '100%' }}
                            />
                          </Box>
                        </Grid>
                      )
                    )}
                  </Grid>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

              <Box>
                {/* <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Additional Filters
                </Typography> */}
                <AdditionalFilters formik={formik} basePath="ruleBased" />
              </Box>
            </Box>
          )}

          {filterTab === 1 && (
            <Box>
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid
                  size={{ xs: 12, sm: 8 }}
                  sx={{
                    borderRight: (theme) => ({ sm: `1px dashed ${theme.palette.divider}` }),
                    pr: { sm: 4 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                      <Iconify
                        icon="solar:globus-outline"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Academic Selections
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={() => {
                        setCurrentFilterName('nameBased');
                        academicDrawer.onTrue();
                      }}
                      sx={{ borderRadius: 1 }}
                    >
                      Add Selection
                    </Button>
                  </Box>

                  {formik.values.nameBased.academicTree.length === 0 ? (
                    <Box
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: (theme) => `1px dashed ${theme.palette.divider}`,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                      }}
                    >
                      <Iconify
                        icon="solar:layers-minimalistic-bold-duotone"
                        width={48}
                        sx={{ color: 'text.disabled', mb: 1, opacity: 0.5 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        No academic filters applied.
                      </Typography>
                    </Box>
                  ) : (
                    <Scrollbar sx={{ maxHeight: 300 }}>
                      <HierarchyTextView data={formik.values.nameBased.academicTree} />
                    </Scrollbar>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Iconify
                      icon="solar:users-group-rounded-bold-duotone"
                      width={20}
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Roles
                    </Typography>
                  </Box>
                  <Grid container spacing={0.5}>
                    {['Teacher', 'Principle', 'Cashier', 'Driver', 'Librarian', 'Peon'].map(
                      (role) => (
                        <Grid size={{ xs: 12 }} key={role}>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                              },
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={formik.values.nameBased.roles?.includes(role)}
                                  onChange={(e) => {
                                    const current = new Set(formik.values.nameBased.roles || []);
                                    if (e.target.checked) current.add(role);
                                    else current.delete(role);
                                    formik.setFieldValue('nameBased.roles', Array.from(current));
                                  }}
                                />
                              }
                              label={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {role}
                                </Typography>
                              }
                              sx={{ mr: 0, width: '100%' }}
                            />
                          </Box>
                        </Grid>
                      )
                    )}
                  </Grid>
                </Grid>
              </Grid>

              <AdditionalFilters formik={formik} basePath="nameBased" />

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Left side: Search & Table */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                    Search & Select Users
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder="Search by name, roll no, or ID..."
                    value={formik.values.searchQuery || ''}
                    onChange={({ target: { value } }) => {
                      formik.setFieldValue('searchQuery', value);
                      formik.setFieldValue('searchTriggered', value.trim().length > 0);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                      endAdornment: formik.values.searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              formik.setFieldValue('searchQuery', '');
                              formik.setFieldValue('searchTriggered', false);
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                    sx={{ mb: 2 }}
                    variant="outlined"
                  />

                  <Box
                    sx={{
                      minHeight: 400,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.02),
                    }}
                  >
                    {(() => {
                      const query = formik.values.searchQuery.trim().toLowerCase();
                      const showTable = query.length > 0 || formik.values.searchTriggered;
                      if (!showTable) {
                        return (
                          <Box sx={{ p: 5, textAlign: 'center' }}>
                            <Iconify
                              icon="eva:search-fill"
                              sx={{ width: 64, height: 64, mb: 2, opacity: 0.5 }}
                            />
                            <Typography variant="subtitle1" color="text.secondary">
                              Start typing to find users
                            </Typography>
                          </Box>
                        );
                      }
                      return (
                        <Box sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                          <CustomizableTable
                            tableId="group-selection-table"
                            noDataText="No users found matching your search."
                            data={dummyRows}
                            columns={selectionColumns}
                          />
                        </Box>
                      );
                    })()}
                  </Box>
                </Box>

                {/* Right side: Selected Users */}
                <Box
                  sx={{
                    width: { md: 350, xs: '100%' },
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: (theme) => ({ md: `1px dashed ${theme.palette.divider}` }),
                    pl: { md: 3 },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Selected ({formik.values.nameBased.selectedUserIds.length})
                    </Typography>
                    {formik.values.nameBased.selectedUserIds.length > 0 && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => formik.setFieldValue('nameBased.selectedUserIds', [])}
                        sx={{ fontSize: 12, minWidth: 'auto', px: 1 }}
                      >
                        Clear All
                      </Button>
                    )}
                  </Box>

                  <Paper
                    variant="outlined"
                    sx={{
                      flexGrow: 1,
                      maxHeight: 500,
                      overflow: 'auto',
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                      p: 1.5,
                      borderRadius: 1.5,
                      border: (theme) => `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    {formik.values.nameBased.selectedUserIds.length === 0 ? (
                      <Box
                        sx={{
                          py: 8,
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Iconify
                          icon="solar:users-group-two-rounded-bold-duotone"
                          width={48}
                          sx={{ color: 'text.disabled', opacity: 0.3 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          No users selected.
                        </Typography>
                      </Box>
                    ) : (
                      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                        {formik.values.nameBased.selectedUserIds.map((id: string) => {
                          const user = dummyRows.find((r) => r.id === id);
                          if (!user) return null;
                          const isStudent = user.type === 'Student';
                          return (
                            <Box
                              key={id}
                              component="li"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1.25,
                                bgcolor: 'background.paper',
                                border: (theme) =>
                                  `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                                boxShadow: (theme) => theme.customShadows.z1,
                                '&:last-child': { mb: 0 },
                                transition: 'all 0.2s',
                                '&:hover': {
                                  boxShadow: (theme) => theme.customShadows.z8,
                                  borderColor: 'primary.main',
                                  transform: 'translateX(4px)',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                {user.fullName.charAt(0)}
                              </Box>
                              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 600, display: 'block', fontSize: 13 }}
                                >
                                  {user.fullName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                  sx={{ display: 'block' }}
                                >
                                  {isStudent
                                    ? `Class ${user.class}-${user.division}`
                                    : user.designation}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  formik.setFieldValue(
                                    'nameBased.selectedUserIds',
                                    formik.values.nameBased.selectedUserIds.filter(
                                      (s: string) => s !== id
                                    )
                                  );
                                }}
                                sx={{
                                  color: 'text.disabled',
                                  '&:hover': {
                                    color: 'error.main',
                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                  },
                                }}
                              >
                                <Iconify icon="mingcute:close-line" width={16} />
                              </IconButton>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Grid>

      <AcademicFilterDrawer
        open={academicDrawer.value}
        onClose={academicDrawer.onFalse}
        currentFilterName={currentFilterName}
        onApply={handleAcademicApply}
      />
    </SectionCard>
  );

  const renderPreview = () => (
    <SectionCard
      title="Final Preview"
      paperProps={{
        sx: {
          ...cardStyle,
          mb: 3,
        },
      }}
    >
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2,
                mb: 3,
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  borderStyle: 'dashed',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    boxShadow: (theme) => theme.customShadows.primary,
                  }}
                >
                  <Iconify icon="solar:users-group-rounded-bold" width={32} />
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                    {formik.values.nameBased.selectedUserIds.length || 0}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Total Users selected
                  </Typography>
                </Box>
              </Paper>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                }}
              >
                {/* Calculate students count from selection */}
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  {
                    formik.values.nameBased.selectedUserIds.filter(
                      (id: string) => dummyRows.find((r) => r.id === id)?.type === 'Student'
                    ).length
                  }
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Students
                </Typography>
              </Paper>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                }}
              >
                {/* Calculate employee count from selection */}
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  {
                    formik.values.nameBased.selectedUserIds.filter(
                      (id: string) => dummyRows.find((r) => r.id === id)?.type === 'Employee'
                    ).length
                  }
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Employees
                </Typography>
              </Paper>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Group Details
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    Group Name
                  </Typography>
                  <Typography variant="subtitle1">{formik.values.name || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    Description
                  </Typography>
                  {formik.values.description ? (
                    <Typography
                      component="div"
                      variant="body2"
                      dangerouslySetInnerHTML={{ __html: formik.values.description }}
                      sx={{
                        '& p': { m: 0 },
                        color: 'text.primary',
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No description provided.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </SectionCard>
  );

  const steps = [
    { label: 'General Information', content: renderGeneralInformation() },
    { label: 'Select Audience', content: renderFilters() },
    { label: 'Final Preview', content: renderPreview() },
  ];

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.neutral',
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Scrollbar sx={{ height: '100%', p: 3 }}>
            <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
              <Stepper
                activeStep={activeStep}
                orientation="vertical"
                sx={{
                  '& .MuiStep-root': {
                    mb: 1,
                  },
                  '& .MuiStepLabel-label': {
                    typography: 'subtitle2',
                    fontWeight: 700,
                    color: 'text.disabled',
                    '&.Mui-active': { color: 'text.primary' },
                    '&.Mui-completed': { color: 'primary.main' },
                  },
                  '& .MuiStepIcon-root': {
                    width: 32,
                    height: 32,
                    color: (theme) => alpha(theme.palette.grey[500], 0.16),
                    '&.Mui-active': {
                      color: 'primary.main',
                      '& .MuiStepIcon-text': {
                        fill: 'common.white',
                      },
                    },
                    '&.Mui-completed': {
                      color: 'primary.main',
                    },
                  },
                  '& .MuiStepConnector-root': {
                    ml: '15px',
                  },
                  '& .MuiStepConnector-line': {
                    borderLeftWidth: 2,
                    borderColor: 'divider',
                  },
                }}
              >
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                    <StepContent
                      sx={{
                        ml: '15px',
                        pl: 4,
                        borderLeft: (theme) => `2px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ py: 3 }}>{step.content}</Box>

                      <Box sx={{ mb: 2, display: 'flex', gap: 1.5 }}>
                        {activeStep > 0 && (
                          <Button
                            color="inherit"
                            variant="outlined"
                            onClick={gotoBack}
                            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                            sx={{ px: 2, borderRadius: 1 }}
                          >
                            Back
                          </Button>
                        )}

                        {activeStep < 2 ? (
                          <Button
                            variant="contained"
                            onClick={gotoNext}
                            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                            sx={{
                              px: 3,
                              fontWeight: 700,
                              borderRadius: 1,
                              boxShadow: (theme) => theme.customShadows.primary,
                            }}
                          >
                            Next
                          </Button>
                        ) : (
                          <LoadingButton
                            variant="contained"
                            onClick={() => formik.handleSubmit()}
                            startIcon={<Iconify icon={GlobalIcons.submit} />}
                          >
                            {isEdit ? 'Update' : 'Create'}
                          </LoadingButton>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Scrollbar>
        </Box>
      </Box>

      <AcademicFilterDrawer
        open={academicDrawer.value}
        onClose={academicDrawer.onFalse}
        currentFilterName={currentFilterName}
        onApply={handleAcademicApply}
      />
    </BackPopUpChecked>
  );
};

export default GroupForm;
