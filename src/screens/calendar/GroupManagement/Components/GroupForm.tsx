import type { IColumn } from 'src/components/customizabaleTable/type';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import CloseIcon from '@mui/icons-material/Close';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
/* eslint-disable import/order */
import React, { useRef, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Tab,
  Grid,
  Step,
  Tabs,
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

// import HorizontalTreeView from './HorizonatalTreeView'; // legacy tree view not used in new flow
import type { AcademicFilterDrawerProps } from './AcademicFilterDrawer';

// Validation schema (reused)
export const groupValidationSchema = Yup.object().shape({
  groupName: Yup.string().trim().required('Group Name is required'),
  description: Yup.string().nullable(),
});

interface GroupFormProps {
  initialValues?: any; // TODO: replace with accurate type
  isEdit?: boolean;
  onClose?: (value: any, success: boolean) => void;
}

// Fields per step for selective validation
const STEP_FIELDS: string[][] = [
  ['groupName', 'description'], // General Information
  [], // Filters (currently no required fields gating progress)
  [], // Final Preview
];
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

const GroupForm: React.FC<GroupFormProps> = ({ initialValues, isEdit, onClose }) => {
  const academicDrawer = useBoolean();
  const [activeStep, setActiveStep] = useState(0);
  const [filterTab, setFilterTab] = useState(0); // 0 = Condition Based, 1 = Selection Based
  const formikRef = useRef<any>(null);
  const [currentFilterName, setCurrentFilterName] = useState('');

  // const [conditionAcademicSelection, setConditionAcademicSelection] = useState<TreeNodeData[]>([]);
  // const [selectionAcademicSelection, setSelectionAcademicSelection] = useState<TreeNodeData[]>([]);

  const formik = useFormik({
    initialValues: {
      ...getGroupInitialValues(initialValues),
      conditions: (initialValues?.conditions as any[]) || [],
      selections: (initialValues?.selections as any[]) || [],
      searchQuery: '',
      searchTriggered: false,
      academicSelections: (initialValues?.academicSelections as string[]) || [], // flattened IDs from academic hierarchy
      conditionAcademicSelection: [],
      selectionAcademicSelection: [],
    },
    validationSchema: groupValidationSchema,
    onSubmit: (values) => {
      // Placeholder submit logic

      onClose?.(values, true);
    },
  });
  // attach formik to ref for table render access
  formikRef.current = formik;

  // Keep computed total in sync (number of selected users)
  useEffect(() => {
    const total = (formik.values.selections || []).length;
    if (formik.values.total !== total) {
      formik.setFieldValue('total', total, false);
    }
  }, [formik, formik.values.selections]);

  // Selection table columns
  const allIds = dummyRows.map((r) => r.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => formik.values.selections.includes(id));
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
          checked={formik.values.selections.includes(row.id)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const current = new Set(formik.values.selections);
            if (e.target.checked) current.add(row.id);
            else current.delete(row.id);
            formik.setFieldValue('selections', Array.from(current));
          }}
        />
      ),
      renderColumn: () => {
        const selectedCount = formik.values.selections.length;
        const indeterminate = selectedCount > 0 && !allSelected;
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={indeterminate}
              onChange={() => {
                if (allSelected) formik.setFieldValue('selections', []);
                else formik.setFieldValue('selections', allIds);
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
        return <Label color={value === 'Active' ? 'success' : 'error'}>{value}</Label>;
      },
    },
  ];

  const gotoNext = async () => {
    // Validate only fields for current step to allow partial progress
    const fields = STEP_FIELDS[activeStep];
    if (fields.length) {
      // Mark touched
      fields.forEach((f: string) => formik.setFieldTouched(f, true, false));
      const errors = await formik.validateForm();
      const stepErrors = Object.keys(errors).filter((e) => fields.includes(e));
      if (stepErrors.length) {
        return; // Abort progression if errors
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const gotoBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleTabChange = (_: React.SyntheticEvent, value: number) => setFilterTab(value);

  const renderGeneralInformation = () => (
    <SectionCard
      title="General Information"
      paperProps={{
        sx: {
          p: 3,
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          mb: 3,
        },
      }}
      gridProps={{ sx: { alignItems: 'stretch', gap: 3 } }}
    >
      <Grid size={{ xs: 12 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Provide a unique name and a brief description for this group.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <ShakingTextField error={!!(formik.touched.groupName && formik.errors.groupName)}>
          <TextField
            fullWidth
            label="Group Name *"
            name="groupName"
            value={formik.values.groupName}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('groupName', value);
            }}
            error={formik.touched.groupName && Boolean(formik.errors.groupName)}
            helperText={formik.touched.groupName && formik.errors.groupName}
            // size="small" // Removed to use default (medium) for better touch target or keep consistent if small is required. Using default often looks more premium.
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
    _a,
    _b,
    _c,
    _d,
    selectedData,
    currentFilter
  ) => {
    if (currentFilter === 'Condition-Academic-Selections') {
      formik.setFieldValue('conditionAcademicSelection', selectedData || []);
    } else if (currentFilter === 'Selection-Academic-Selections') {
      formik.setFieldValue('selectionAcademicSelection', selectedData || []);
    }
  };

  const renderFilters = () => (
    <SectionCard
      title=""
      paperProps={{
        sx: {
          p: 0, // Reset padding for cleaner tab integration
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          mb: 3,
        },
      }}
    >
      <Grid size={{ xs: 12 }}>
        {/* Tabs Row */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.neutral',
            px: 2,
            pt: 1,
          }}
        >
          <Tabs
            value={filterTab}
            onChange={handleTabChange}
            variant="standard"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontWeight: 600,
                textTransform: 'none',
              },
            }}
          >
            <Tab label="Rule Based" />
            <Tab label="Name Based" />
          </Tabs>
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Box sx={{ p: 3 }}>
          {filterTab === 0 && (
            <Box>
              <Grid container spacing={4}>
                <Grid
                  size={{ xs: 12, sm: 8 }}
                  sx={{
                    borderRight: (t) => ({ sm: `1px solid ${t.palette.divider}` }),
                    pr: { sm: 4 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>
                      Academic Selections
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => {
                        setCurrentFilterName('Condition-Academic-Selections');
                        academicDrawer.onTrue();
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Add Selection
                    </Button>
                  </Box>

                  {formik.values?.conditionAcademicSelection?.length === 0 ? (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        borderStyle: 'dashed',
                        bgcolor: 'background.default',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No academic rules applied. Click &quot;Add Selection&quot; to start.
                      </Typography>
                    </Paper>
                  ) : (
                    <Scrollbar sx={{ maxHeight: 250 }}>
                      <HierarchyTextView data={formik.values.conditionAcademicSelection} />
                    </Scrollbar>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                    Roles
                  </Typography>
                  <Grid container spacing={1}>
                    {['Teacher', 'Principle', 'Cashier', 'Driver', 'Librarian', 'Peon'].map(
                      (role) => (
                        <Grid size={{ xs: 12 }} key={role}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={formik.values.roles?.includes(role)}
                                onChange={(e) => {
                                  const current = new Set(formik.values.roles || []);
                                  if (e.target.checked) current.add(role);
                                  else current.delete(role);
                                  formik.setFieldValue('roles', Array.from(current));
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
                <AdditionalFilters />
              </Box>
            </Box>
          )}

          {filterTab === 1 && (
            <Box>
              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid
                  size={{ xs: 12, sm: 8 }}
                  sx={{
                    borderRight: (t) => ({ sm: `1px solid ${t.palette.divider}` }),
                    pr: { sm: 4 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>
                      Academic Selections
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => {
                        setCurrentFilterName('Selection-Academic-Selections');
                        academicDrawer.onTrue();
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Add Selection
                    </Button>
                  </Box>

                  {formik.values.selectionAcademicSelection?.length === 0 ? (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        borderStyle: 'dashed',
                        bgcolor: 'background.default',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No academic filters applied.
                      </Typography>
                    </Paper>
                  ) : (
                    <Scrollbar sx={{ maxHeight: 250 }}>
                      <HierarchyTextView data={formik.values.selectionAcademicSelection} />
                    </Scrollbar>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                    Roles
                  </Typography>
                  <Grid container spacing={1}>
                    {['Teacher', 'Principle', 'Cashier', 'Driver', 'Librarian', 'Peon'].map(
                      (role) => (
                        <Grid size={{ xs: 12 }} key={role}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={formik.values.roles?.includes(role)}
                                onChange={(e) => {
                                  const current = new Set(formik.values.roles || []);
                                  if (e.target.checked) current.add(role);
                                  else current.delete(role);
                                  formik.setFieldValue('roles', Array.from(current));
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
                        </Grid>
                      )
                    )}
                  </Grid>
                </Grid>
              </Grid>

              <AdditionalFilters />

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
                      borderRadius: 1,
                      overflow: 'hidden',
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
                    width: { md: 320, xs: '100%' },
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: (t) => ({ md: `1px solid ${t.palette.divider}` }),
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
                      Selected ({formik.values.selections.length})
                    </Typography>
                    {formik.values.selections.length > 0 && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => formik.setFieldValue('selections', [])}
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
                      bgcolor: 'background.default',
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    {formik.values.selections.length === 0 ? (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          No users selected.
                        </Typography>
                      </Box>
                    ) : (
                      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                        {formik.values.selections.map((id: string) => {
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
                                opacity: 0.9,
                                p: 1,
                                mb: 1,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                '&:last-child': { mb: 0 },
                                transition: 'all 0.2s',
                                '&:hover': {
                                  opacity: 1,
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                  transform: 'translateY(-1px)',
                                },
                              }}
                            >
                              {/* Avatar placeholder or initials could go here */}
                              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600, display: 'block' }}
                                >
                                  {user.fullName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {isStudent
                                    ? `Class ${user.class}-${user.division}`
                                    : user.designation}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  formik.setFieldValue(
                                    'selections',
                                    formik.values.selections.filter((s: string) => s !== id)
                                  );
                                }}
                                sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
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
          p: 3,
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
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
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'primary.lighter',
                  borderColor: 'primary.lighter',
                  color: 'primary.darker',
                }}
              >
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  {formik.values.total || 0}
                </Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                  Total Users selected
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
                {/* Calculate students count from selection */}
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  {
                    formik.values.selections.filter(
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
                    formik.values.selections.filter(
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
                  <Typography variant="subtitle1">{formik.values.groupName || '—'}</Typography>
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
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          // Handle Enter key to advance steps (except last) without submitting prematurely
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const isLast = activeStep === steps.length - 1;
              const target = e.target as HTMLElement;
              const { isContentEditable, tagName } = target;
              const isTextArea = tagName === 'TEXTAREA';
              if (!isLast && !isContentEditable && !isTextArea) {
                e.preventDefault();
                gotoNext();
              }
            }
          }}
        >
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
            <Stepper
              activeStep={activeStep}
              orientation="vertical"
              connector={
                <Box
                  sx={{
                    height: 20,
                    borderLeft: (t) => `2px solid ${t.palette.divider}`,
                    ml: '11px',
                    my: 0.5,
                  }}
                />
              }
            >
              {steps.map((step, index) => (
                <Step key={step.label} expanded={activeStep === index}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-completed': { color: 'primary.main' },
                        '&.Mui-active': {
                          color: 'primary.main',
                          '& .MuiStepIcon-text': { fill: '#fff' },
                        },
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: activeStep === index ? 700 : 600,
                        color: activeStep === index ? 'text.primary' : 'text.disabled',
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent
                    TransitionProps={{ unmountOnExit: false }}
                    sx={{
                      borderLeft: (t) => `2px solid ${t.palette.divider}`,
                      ml: '11px',
                      pl: 3,
                      pb: 3,
                    }}
                  >
                    {step.content}
                    <Box sx={{ mb: 2, mt: 3, display: 'flex', gap: 1.5 }}>
                      {index > 0 && (
                        <Button variant="outlined" onClick={gotoBack} sx={{ minWidth: 100 }}>
                          Back
                        </Button>
                      )}
                      {index < steps.length - 1 && (
                        <Button
                          variant="contained"
                          onClick={gotoNext}
                          sx={{ minWidth: 100, boxShadow: '0 8px 16px 0 rgba(0, 171, 85, 0.24)' }}
                        >
                          Next
                        </Button>
                      )}
                      {index === steps.length - 1 && (
                        <Button
                          variant="contained"
                          type="submit"
                          startIcon={
                            <Iconify
                              icon={initialValues ? GlobalIcons.edit : GlobalIcons.submit}
                              width={20}
                              height={20}
                            />
                          }
                          sx={{ minWidth: 120, boxShadow: '0 8px 16px 0 rgba(0, 171, 85, 0.24)' }}
                        >
                          {initialValues ? 'Update Group' : 'Create Group'}
                        </Button>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default GroupForm;
