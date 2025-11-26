import type { IColumn } from 'src/components/customizabaleTable/type';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
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
      paperProps={{ sx: { mb: 2 } }}
      gridProps={{ sx: { alignItems: 'start' } }}
    >
      <Grid size={{ xs: 4 }}>
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
            size="small"
          />
        </ShakingTextField>
      </Grid>
      {/* <Grid size={{ xs: 1 }}>
        <Divider orientation="vertical" flexItem sx={{ mx: 2, height: '100%' }} />
      </Grid> */}
      <Grid size={{ xs: 8 }}>
        <Editor
          value={formik.values.description}
          onChange={(value) => formik.setFieldValue('description', value)}
          placeholder="Description"
          sx={{
            border: `1px solid ${theme.vars.palette.grey[500]}`,
            borderRadius: 1,
            '&:hover': { borderColor: theme.vars.palette.text.primary },
            ...(!!formik.touched.description &&
              !!formik.errors.description && {
                borderColor: theme.palette.error.main,
              }),
            '&:focus-within': {
              borderColor: theme.vars.palette.text.primary,
              borderWidth: 2,
            },

            minHeight: 120,
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
    <SectionCard title="Select Audience" paperProps={{ sx: { mb: 2 } }}>
      <Grid size={{ xs: 12 }}>
        {/* Tabs Row */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
          <Tabs
            value={filterTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Rule Based" />
            <Tab label="Name Based" />
          </Tabs>
        </Box>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
          }}
        >
          {filterTab === 0 && (
            <Box>
              <Box>
                <Grid container spacing={2}>
                  <Grid
                    size={{ xs: 12, sm: 8 }}
                    sx={{ borderRight: '2px solid', borderColor: 'primary.main', pr: 2 }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="primary.main"
                      sx={{ mb: 1, display: 'flex', alignItems: 'center', color: 'primary.main' }}
                    >
                      Academic Selections
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setCurrentFilterName('Condition-Academic-Selections');
                          academicDrawer.onTrue();
                        }}
                        sx={{ ml: 1 }}
                        aria-label="add-selection-filter"
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Typography>
                    {/* Applied selections list */}
                    {formik.values?.conditionAcademicSelection?.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No academic selections applied yet.
                      </Typography>
                    ) : (
                      <Scrollbar sx={{ maxHeight: 200 }}>
                        <HierarchyTextView data={formik.values.conditionAcademicSelection} />
                      </Scrollbar>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                        Roles
                      </Typography>
                      <Grid container>
                        {['Teacher', 'Principle', 'Cashier', 'Driver', 'Librarian', 'Peon'].map(
                          (role) => (
                            <Grid
                              size={{ xs: 6 }}
                              key={role}
                              sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                            >
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
                                label={role}
                              />
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />
              {/* Reuse existing AdditionalFilters component */}
              <AdditionalFilters />
            </Box>
          )}
          {filterTab === 1 && (
            <Box>
              {/* Existing selection filters */}
              <Box>
                <Grid container spacing={2}>
                  <Grid
                    size={{ xs: 12, sm: 8 }}
                    sx={{ borderRight: '2px solid', borderColor: 'primary.main', pr: 2 }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      sx={{ mb: 1, display: 'flex', alignItems: 'center' }}
                    >
                      Academic Selections
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setCurrentFilterName('Selection-Academic-Selections');
                          academicDrawer.onTrue();
                        }}
                        sx={{ ml: 1 }}
                        aria-label="add-selection-filter"
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Typography>
                    {formik.values.selectionAcademicSelection?.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No academic selections applied yet.
                      </Typography>
                    ) : (
                      <Scrollbar sx={{ maxHeight: 200 }}>
                        <HierarchyTextView data={formik.values.selectionAcademicSelection} />
                      </Scrollbar>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="subtitle1" color="primary.main" sx={{ mb: 1 }}>
                        Roles
                      </Typography>
                      <Grid container>
                        {['Teacher', 'Principle', 'Cashier', 'Driver', 'Librarian', 'Peon'].map(
                          (role) => (
                            <Grid
                              size={{ xs: 6 }}
                              key={role}
                              sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                            >
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
                                label={role}
                              />
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />
              <AdditionalFilters />
              <Divider sx={{ my: 2 }} />
              {/* Search + Table (70%) and Selected Users (30%) layout */}
              <Box
                sx={
                  {
                    // display: 'flex',
                    // flexDirection: { xs: 'column', md: 'row' },
                    // gap: 2,
                    // alignItems: 'stretch',
                  }
                }
              >
                {/* Left side: search + table */}
                <Box
                  sx={{
                    flexBasis: { md: '100%' },
                    flexGrow: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }} color="primary">
                    Search & Select Users (Students / Employees)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Users"
                    placeholder="Start typing a name..."
                    value={formik.values.searchQuery || ''}
                    onChange={({ target: { value } }) => {
                      formik.setFieldValue('searchQuery', value);
                      formik.setFieldValue('searchTriggered', value.trim().length > 0);
                    }}
                    InputProps={{
                      endAdornment: formik.values.searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            aria-label="clear query"
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
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    alignItems: 'stretch',
                  }}
                >
                  <Box sx={{ flexGrow: 1, minHeight: 240, flexBasis: { md: '70%' } }}>
                    {(() => {
                      const query = formik.values.searchQuery.trim().toLowerCase();
                      const showTable = query.length > 0 || formik.values.searchTriggered;
                      if (!showTable) {
                        return (
                          <Paper
                            variant="outlined"
                            sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}
                          >
                            Start typing to search users.
                          </Paper>
                        );
                      }
                      // const filtered = dummyRows.filter(
                      //   (r) => !query || r.fullName.toLowerCase().includes(query)
                      // );
                      return (
                        <CustomizableTable
                          tableId="group-selection-table"
                          noDataText={dummyRows.length ? undefined : 'No matching users'}
                          data={dummyRows}
                          columns={selectionColumns}
                        />
                      );
                    })()}
                  </Box>
                  {/* Right side: selected users panel */}
                  <Box
                    sx={{
                      flexBasis: { md: '30%' },
                      flexGrow: { md: 0, xs: 1 },
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1.5,
                      bgcolor: 'background.paper',
                      maxHeight: 400,
                      overflow: 'auto',
                      boxShadow: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Selected Users ({formik.values.selections.length || 0})
                      </Typography>
                      {formik.values.selections.length > 0 && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => formik.setFieldValue('selections', [])}
                        >
                          Clear All
                        </Button>
                      )}
                    </Box>
                    {formik.values.selections.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No users selected yet.
                      </Typography>
                    ) : (
                      <Box>
                        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                          {formik.values.selections.map((id: string) => {
                            const user = dummyRows.find((r) => r.id === id);
                            if (!user) return null;
                            const extra =
                              user.type === 'Student'
                                ? `Class ${user.class}${user.division ? `-${user.division}` : ''}`
                                : `${user.designation}${user.department ? ` • ${user.department}` : ''}`;
                            return (
                              <Box
                                key={id}
                                component="li"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  border: 1,
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 0.75,
                                  mb: 0.75,
                                  bgcolor: 'background.default',
                                  gap: 1,
                                }}
                              >
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {user.fullName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {user.type === 'Student'
                                      ? `${extra}${user.role ? ` • ${user.role}` : ''}`
                                      : `${extra}${user.role ? ` • ${user.role}` : ''}`}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    formik.setFieldValue(
                                      'selections',
                                      formik.values.selections.filter((s: string) => s !== id)
                                    );
                                  }}
                                  aria-label="remove-user"
                                >
                                  <Iconify icon="mdi:minus" />
                                </IconButton>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
      {/* Content Panel */}
      <AcademicFilterDrawer
        open={academicDrawer.value}
        onClose={academicDrawer.onFalse}
        currentFilterName={currentFilterName}
        onApply={handleAcademicApply}
      />
    </SectionCard>
  );

  const renderPreview = () => (
    <SectionCard title="Final Preview" paperProps={{ sx: { mb: 2 } }}>
      <Grid size={{ xs: 12 }}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            General Information
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2">Name: {formik.values.groupName || '—'}</Typography>
          <Typography variant="subtitle2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
            Description:{' '}
            {formik.values.description ? (
              <Typography
                component="small"
                variant="subtitle2"
                sx={{
                  m: 0,
                  '& *': {
                    m: 0,
                  },
                }}
                dangerouslySetInnerHTML={{ __html: formik.values.description }}
              />
            ) : (
              '—'
            )}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Filters & Selection Summary
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  Total User
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  50
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  Students
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  30
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  Employees
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  20
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      {/* <Chip label={`Total Users : ${selectedUsers.length}`} /> */}
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
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label} expanded={activeStep === index}>
                  <StepLabel>{step.label}</StepLabel>
                  <StepContent TransitionProps={{ unmountOnExit: false }}>
                    {step.content}
                    <Box sx={{ mb: 2, mt: 1, display: 'flex', gap: 1 }}>
                      {index > 0 && (
                        <Button variant="outlined" size="small" onClick={gotoBack}>
                          Back
                        </Button>
                      )}
                      {index < steps.length - 1 && (
                        <Button variant="contained" size="small" onClick={gotoNext}>
                          Next
                        </Button>
                      )}
                      {index === steps.length - 1 && (
                        <Button
                          variant="contained"
                          size="small"
                          type="submit"
                          startIcon={
                            <Iconify
                              icon={initialValues ? GlobalIcons.edit : GlobalIcons.submit}
                              width={initialValues ? 16 : 20}
                              height={initialValues ? 16 : 20}
                            />
                          }
                        >
                          {initialValues ? 'Update' : 'Submit'}
                        </Button>
                      )}
                      {/* <Button
                        variant="text"
                        size="small"
                        color="inherit"
                        onClick={() => onClose?.(null, false)}
                        startIcon={<Iconify icon={GlobalIcons.cancel} />}
                      >
                        Cancel
                      </Button> */}
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
