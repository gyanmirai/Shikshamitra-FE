import { Scrollbar } from 'src/components/scrollbar';
import React, { useState, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Search,
  TrendingUp,
  ArrowUpward,
  KeyboardTab,
  TrendingDown,
  ArrowDownward,
  SwipeRightAlt,
  DoNotDisturbAlt,
  CheckCircleOutline,
  FormatListBulleted,
} from '@mui/icons-material';
import {
  Box,
  Tab,
  Card,
  Chip,
  Grid,
  Tabs,
  Stack,
  Select,
  Divider,
  Checkbox,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import HierarchyTextView from './HorizonatalTreeView';

import type { IGroup } from './type';
import type { FilterRow, FieldOption, OperatorOption } from './AdditionalFilters';

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
const studentFieldOptions: FieldOption[] = [
  { value: 'class', label: 'Class', type: 'select', values: ['1', '2', '3', '4', '5'] },
  { value: 'section', label: 'Section', type: 'select', values: ['A', 'B', 'C'] },
  { value: 'gender', label: 'Gender', type: 'select', values: ['Male', 'Female', 'Other'] },
  {
    value: 'admissionStatus',
    label: 'Admission Status',
    type: 'select',
    values: ['Active', 'Inactive', 'Pending'],
  },
  { value: 'name', label: 'Name', type: 'text' },
];
const operatorOptions: OperatorOption[] = [
  { value: 'equals', label: 'Equals', icon: <CheckCircleOutline fontSize="inherit" /> },
  { value: 'notEquals', label: 'Not Equals', icon: <DoNotDisturbAlt fontSize="inherit" /> },
  { value: 'contains', label: 'Contains', icon: <Search fontSize="inherit" /> },
  { value: 'startsWith', label: 'Starts With', icon: <SwipeRightAlt fontSize="inherit" /> },
  { value: 'endsWith', label: 'Ends With', icon: <KeyboardTab fontSize="inherit" /> },
  { value: 'greaterThan', label: 'Greater Than', icon: <ArrowUpward fontSize="inherit" /> },
  { value: 'lessThan', label: 'Less Than', icon: <ArrowDownward fontSize="inherit" /> },
  {
    value: 'greaterOrEqual',
    label: 'Greater Or Equal',
    icon: <TrendingUp fontSize="inherit" />,
  },
  { value: 'lessOrEqual', label: 'Less Or Equal', icon: <TrendingDown fontSize="inherit" /> },
  { value: 'in', label: 'In', icon: <FormatListBulleted fontSize="inherit" /> },
];

const employeeFieldOptions: FieldOption[] = [
  {
    value: 'department',
    label: 'Department',
    type: 'select',
    values: ['Admin', 'Teaching', 'Finance', 'HR'],
  },
  {
    value: 'role',
    label: 'Role',
    type: 'select',
    values: ['Teacher', 'Principal', 'Accountant', 'Clerk'],
  },
  {
    value: 'employmentType',
    label: 'Employment Type',
    type: 'select',
    values: ['Full-time', 'Part-time', 'Contract'],
  },
  { value: 'name', label: 'Name', type: 'text' },
];

interface GroupViewDialogProps {
  open: boolean;
  group: IGroup | null;
  onClose: () => void;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', mb: 0.75 }}>
    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 140 }}>
      {label}:
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
      {value || '—'}
    </Typography>
  </Box>
);

const ChipsList: React.FC<{ items?: string[]; empty?: string }> = ({ items, empty = 'None' }) => {
  if (!items || items.length === 0)
    return (
      <Typography variant="caption" color="text.disabled">
        {empty}
      </Typography>
    );
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.75}>
      {items.map((i) => (
        <Chip key={i} label={i} size="small" variant="outlined" />
      ))}
    </Stack>
  );
};

const GroupViewDialog: React.FC<GroupViewDialogProps> = ({ open, group, onClose }) => {
  const [tab, setTab] = useState(0); // 0 = Rule Based, 1 = Name Based
  const [studentFilters] = useState<FilterRow[]>([
    { id: 'stu-filter-1', field: 'gender', value: 'Male', operator: 'equals' },
  ]);
  const [employeeFilters] = useState<FilterRow[]>([
    { id: 'emp-filter-1', field: 'employmentType', value: 'Full-time', operator: 'equals' },
  ]);
  const getFieldMeta = useCallback(
    (fieldValue: string | undefined, isStudent: boolean): FieldOption | undefined => {
      const source = isStudent ? studentFieldOptions : employeeFieldOptions;
      return source.find((f) => f.value === fieldValue);
    },
    []
  );
  const renderFilterRows = useCallback(
    (filters: FilterRow[], isStudent: boolean) => (
      <Stack spacing={1} mt={1}>
        {filters.map((f) => {
          const meta = getFieldMeta(f.field, isStudent);
          return (
            <Grid container spacing={1} key={f.id} alignItems="center">
              <Grid size={{ xs: 4 }}>
                <FormControl
                  fullWidth
                  size="small"
                  variant="standard"
                  sx={{
                    '& .MuiInputBase-input': { fontSize: 14 },
                    '& .MuiInputLabel-root': { fontSize: 14 },
                    '& .MuiMenuItem-root': { fontSize: 14 },
                  }}
                >
                  <InputLabel>Field</InputLabel>
                  <Select
                    size="small"
                    label="Field"
                    disabled
                    value={f.field || ''}
                    //   onChange={(e) => handleChange(f.id, 'field', e.target.value, isStudent)}
                  >
                    {(isStudent ? studentFieldOptions : employeeFieldOptions).map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <FormControl
                  fullWidth
                  size="small"
                  variant="standard"
                  sx={{
                    '& .MuiInputBase-input': { fontSize: 14 },
                    '& .MuiInputLabel-root': { fontSize: 14 },
                    '& .MuiMenuItem-root': { fontSize: 14 },
                  }}
                >
                  <InputLabel>Operator</InputLabel>
                  <Select
                    label="Operator"
                    value={f.operator || ''}
                    disabled
                    //   onChange={(e) => handleChange(f.id, 'operator', e.target.value, isStudent)}
                  >
                    {operatorOptions.map((op) => (
                      <MenuItem
                        key={op.value}
                        value={op.value}
                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                      >
                        {/* <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                            {op.icon}
                          </Box> */}
                        {op.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                {meta?.type === 'select' ? (
                  <FormControl
                    fullWidth
                    size="small"
                    variant="standard"
                    sx={{
                      '& .MuiInputBase-input': { fontSize: 14 },
                      '& .MuiInputLabel-root': { fontSize: 14 },
                      '& .MuiMenuItem-root': { fontSize: 14 },
                    }}
                  >
                    <InputLabel>Value</InputLabel>
                    <Select
                      label="Value"
                      value={f.value || ''}
                      // onChange={(e) => handleChange(f.id, 'value', e.target.value, isStudent)}
                      disabled
                      variant="standard"
                    >
                      {meta.values?.map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Value"
                    size="small"
                    variant="standard"
                    sx={{
                      '& .MuiInputBase-input': { fontSize: 14 },
                      '& .MuiInputLabel-root': { fontSize: 14 },
                    }}
                    fullWidth
                    value={f.value || ''}
                    disabled
                    //   onChange={(e) => handleChange(f.id, 'value', e.target.value, isStudent)}
                  />
                )}
              </Grid>
            </Grid>
          );
        })}
      </Stack>
    ),
    [getFieldMeta]
  );

  const selection = ['stu-001', 'stu-002', 'emp-101'];
  if (!group) return null;

  return (
    <CustomDialog
      title={group.groupName}
      open={open}
      handleClose={onClose}
      fullWidth
      maxWidth="xl"
      scroll="paper"
    >
      <DialogScrollContent dividers sx={{ bgcolor: 'background.default', p: 2 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
          {/* Left Card: Basic Details */}
          <Card
            sx={{
              flexBasis: { md: '35%' },
              flexGrow: 0,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Details
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <InfoRow label="Group Name" value={group.groupName} />
            <InfoRow label="Description" value={group.description || '—'} />
            {/* <InfoRow label="Total Audience" value={200} /> */}

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={4}>
                <Box component={Card} elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Total Users
                  </Typography>
                  <Typography variant="h5" color="primary" sx={{ mt: 0.5 }}>
                    200
                  </Typography>
                </Box>
              </Grid>
              <Grid size={4}>
                <Box component={Card} elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Students
                  </Typography>
                  <Typography variant="h5" color="primary" sx={{ mt: 0.5 }}>
                    120
                  </Typography>
                </Box>
              </Grid>
              <Grid size={4}>
                <Box component={Card} elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Employees
                  </Typography>
                  <Typography variant="h5" color="primary" sx={{ mt: 0.5 }}>
                    80
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
          {/* Right Card: Tabbed Static Data */}
          <Card
            sx={{ flexGrow: 1, p: 2, minHeight: 360, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons
                allowScrollButtonsMobile
              >
                <Tab label="Rule Based" />
                <Tab label="Name Based" />
              </Tabs>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {tab === 0 && (
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
                      </Typography>
                      {/* Applied selections list */}

                      <Scrollbar sx={{ maxHeight: 200 }}>
                        <HierarchyTextView
                          data={[
                            {
                              id: '3a18e4cb-42bb-e343-36b1-db695aa464d9',
                              name: 'CBSE',
                              type: 'boards',
                              parentId: null,
                              children: [
                                {
                                  id: '3a18e88d-099b-7b84-e3bb-6393ba4f3a51',
                                  name: 'English',
                                  type: 'mediums',
                                  parentId: '3a18e4cb-42bb-e343-36b1-db695aa464d9',
                                  children: [
                                    {
                                      id: '3a190322-7664-4197-552d-a7c1f823c69f',
                                      name: 'Higher secondary',
                                      type: 'organizations',
                                      parentId: '3a18e88d-099b-7b84-e3bb-6393ba4f3a51',
                                      children: [],
                                    },
                                    {
                                      id: '3a18e909-9d5e-d9a3-0f19-7c047129f9d8',
                                      name: 'Primary',
                                      type: 'organizations',
                                      parentId: '3a18e88d-099b-7b84-e3bb-6393ba4f3a51',
                                      children: [
                                        {
                                          id: '3a18ee92-3395-c001-c029-86323e1facd5',
                                          name: '1',
                                          type: 'standards',
                                          parentId: '3a18e909-9d5e-d9a3-0f19-7c047129f9d8',
                                          children: [
                                            {
                                              id: '3a18f304-0b52-a7a2-cd33-c9a23e3d5bbc',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a18ee92-3395-c001-c029-86323e1facd5',
                                            },
                                            {
                                              id: '3a1945a6-3803-eb88-bb9e-c86b67de63e9',
                                              name: 'B',
                                              type: 'divisions',
                                              parentId: '3a18ee92-3395-c001-c029-86323e1facd5',
                                            },
                                            {
                                              id: '3a195a7c-dea7-857b-9b77-f14761f6da1e',
                                              name: 'C',
                                              type: 'divisions',
                                              parentId: '3a18ee92-3395-c001-c029-86323e1facd5',
                                            },
                                          ],
                                        },
                                        {
                                          id: '3a18ee9b-6e99-3c0b-2ec2-d585216f6ef8',
                                          name: '2',
                                          type: 'standards',
                                          parentId: '3a18e909-9d5e-d9a3-0f19-7c047129f9d8',
                                          children: [
                                            {
                                              id: '3a1a6aaa-2ef1-413b-4112-34c194a874e4',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a18ee9b-6e99-3c0b-2ec2-d585216f6ef8',
                                            },
                                          ],
                                        },
                                        {
                                          id: '3a18ee9b-9049-87bb-951f-d4959c606312',
                                          name: '3',
                                          type: 'standards',
                                          parentId: '3a18e909-9d5e-d9a3-0f19-7c047129f9d8',
                                          children: [
                                            {
                                              id: '3a1a6aaa-7a1a-de93-c96b-a051f26eeac1',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a18ee9b-9049-87bb-951f-d4959c606312',
                                            },
                                          ],
                                        },
                                        {
                                          id: '3a18ee9b-acbb-9cec-ef08-4cba7bbc5570',
                                          name: '4',
                                          type: 'standards',
                                          parentId: '3a18e909-9d5e-d9a3-0f19-7c047129f9d8',
                                          children: [
                                            {
                                              id: '3a18f304-ba4c-50fe-b3a2-a2fcbe9638e8',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a18ee9b-acbb-9cec-ef08-4cba7bbc5570',
                                            },
                                            {
                                              id: '3a18f306-5def-6513-7156-0ba182e667d0',
                                              name: 'B',
                                              type: 'divisions',
                                              parentId: '3a18ee9b-acbb-9cec-ef08-4cba7bbc5570',
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  id: '3a1945a3-e05d-801a-a582-00528d6eeaf9',
                                  name: 'Gujarati',
                                  type: 'mediums',
                                  parentId: '3a18e4cb-42bb-e343-36b1-db695aa464d9',
                                  children: [
                                    {
                                      id: '3a1a614c-adc7-f7b5-6158-fa82b26a3152',
                                      name: 'Primary',
                                      type: 'organizations',
                                      parentId: '3a1945a3-e05d-801a-a582-00528d6eeaf9',
                                      children: [
                                        {
                                          id: '3a1a614c-d4da-3874-984e-5eff5b8af8d7',
                                          name: '1',
                                          type: 'standards',
                                          parentId: '3a1a614c-adc7-f7b5-6158-fa82b26a3152',
                                          children: [
                                            {
                                              id: '3a1a614d-02a3-46d7-204e-007496ee8d20',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a1a614c-d4da-3874-984e-5eff5b8af8d7',
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  id: '3a195a7b-b927-4af4-09a0-f3d2941f62eb',
                                  name: 'Marathi',
                                  type: 'mediums',
                                  parentId: '3a18e4cb-42bb-e343-36b1-db695aa464d9',
                                  children: [
                                    {
                                      id: '3a1a6159-13f8-ce56-a350-244b974b46ba',
                                      name: 'Primary',
                                      type: 'organizations',
                                      parentId: '3a195a7b-b927-4af4-09a0-f3d2941f62eb',
                                      children: [
                                        {
                                          id: '3a1a6159-2a72-1c82-4b0b-fd482752c873',
                                          name: '1',
                                          type: 'standards',
                                          parentId: '3a1a6159-13f8-ce56-a350-244b974b46ba',
                                          children: [
                                            {
                                              id: '3a1a6159-4bb6-26ef-5c86-c72c152e0af7',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a1a6159-2a72-1c82-4b0b-fd482752c873',
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ]}
                          isShowDelete={false}
                        />
                      </Scrollbar>
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
                                      disabled
                                      checked={role === 'Teacher' || role === 'Librarian'}
                                      // checked={formik.values.roles?.includes(role)}
                                      // onChange={(e) => {
                                      //   const current = new Set(formik.values.roles || []);
                                      //   if (e.target.checked) current.add(role);
                                      //   else current.delete(role);
                                      //   formik.setFieldValue('roles', Array.from(current));
                                      // }}
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

                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle1" color="primary">
                        Additional Filters
                      </Typography>
                    </Grid>

                    <Grid
                      size={{ xs: 6 }}
                      sx={{ borderRight: '2px solid', borderColor: 'primary.main', pr: 2 }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2">Students Filter</Typography>
                        {/* <IconButton
            size="small"
            color="primary"
            // onClick={() => handleAddFilter(true)}
            aria-label="add-student-filter"
          >
            <AddIcon fontSize="small" />
          </IconButton> */}
                      </Box>
                      {renderFilterRows(studentFilters, true)}
                    </Grid>
                    <Grid size={{ xs: 6 }} pl={2}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2">Employee Filters</Typography>
                        {/* <IconButton
            size="small"
            color="primary"
            onClick={() => handleAddFilter(false)}
            aria-label="add-employee-filter"
          >
            <AddIcon fontSize="small" />
          </IconButton> */}
                      </Box>
                      {renderFilterRows(employeeFilters, false)}
                    </Grid>
                  </Grid>
                </Box>
              )}
              {tab === 1 && (
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
                      </Typography>
                      {/* Applied selections list */}

                      <Scrollbar sx={{ maxHeight: 200 }}>
                        <HierarchyTextView
                          data={[
                            {
                              id: '3a18e4cb-42bb-e343-36b1-db695aa464d9',
                              name: 'CBSE',
                              type: 'boards',
                              parentId: null,
                              children: [
                                {
                                  id: '3a18e88d-099b-7b84-e3bb-6393ba4f3a51',
                                  name: 'English',
                                  type: 'mediums',
                                  parentId: '3a18e4cb-42bb-e343-36b1-db695aa464d9',
                                  children: [
                                    {
                                      id: '3a190322-7664-4197-552d-a7c1f823c69f',
                                      name: 'Higher secondary',
                                      type: 'organizations',
                                      parentId: '3a18e88d-099b-7b84-e3bb-6393ba4f3a51',
                                      children: [],
                                    },
                                    {
                                      id: '3a18e909-9d5e-d9a3-0f19-7c047129f9d8',
                                      name: 'Primary',
                                      type: 'organizations',
                                      parentId: '3a18e88d-099b-7b84-e3bb-6393ba4f3a51',
                                      children: [
                                        {
                                          id: '3a18ee92-3395-c001-c029-86323e1facd5',
                                          name: '1',
                                          type: 'standards',
                                          parentId: '3a18e909-9d5e-d9a3-0f19-7c047129f9d8',
                                          children: [
                                            {
                                              id: '3a18f304-0b52-a7a2-cd33-c9a23e3d5bbc',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a18ee92-3395-c001-c029-86323e1facd5',
                                            },
                                            {
                                              id: '3a1945a6-3803-eb88-bb9e-c86b67de63e9',
                                              name: 'B',
                                              type: 'divisions',
                                              parentId: '3a18ee92-3395-c001-c029-86323e1facd5',
                                            },
                                            {
                                              id: '3a195a7c-dea7-857b-9b77-f14761f6da1e',
                                              name: 'C',
                                              type: 'divisions',
                                              parentId: '3a18ee92-3395-c001-c029-86323e1facd5',
                                            },
                                          ],
                                        },
                                        {
                                          id: '3a18ee9b-6e99-3c0b-2ec2-d585216f6ef8',
                                          name: '2',
                                          type: 'standards',
                                          parentId: '3a18e909-9d5e-d9a3-0f19-7c047129f9d8',
                                          children: [
                                            {
                                              id: '3a1a6aaa-2ef1-413b-4112-34c194a874e4',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a18ee9b-6e99-3c0b-2ec2-d585216f6ef8',
                                            },
                                          ],
                                        },
                                        {
                                          id: '3a18ee9b-9049-87bb-951f-d4959c606312',
                                          name: '3',
                                          type: 'standards',
                                          parentId: '3a18e909-9d5e-d9a3-0f19-7c047129f9d8',
                                          children: [
                                            {
                                              id: '3a1a6aaa-7a1a-de93-c96b-a051f26eeac1',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a18ee9b-9049-87bb-951f-d4959c606312',
                                            },
                                          ],
                                        },
                                        {
                                          id: '3a18ee9b-acbb-9cec-ef08-4cba7bbc5570',
                                          name: '4',
                                          type: 'standards',
                                          parentId: '3a18e909-9d5e-d9a3-0f19-7c047129f9d8',
                                          children: [
                                            {
                                              id: '3a18f304-ba4c-50fe-b3a2-a2fcbe9638e8',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a18ee9b-acbb-9cec-ef08-4cba7bbc5570',
                                            },
                                            {
                                              id: '3a18f306-5def-6513-7156-0ba182e667d0',
                                              name: 'B',
                                              type: 'divisions',
                                              parentId: '3a18ee9b-acbb-9cec-ef08-4cba7bbc5570',
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  id: '3a1945a3-e05d-801a-a582-00528d6eeaf9',
                                  name: 'Gujarati',
                                  type: 'mediums',
                                  parentId: '3a18e4cb-42bb-e343-36b1-db695aa464d9',
                                  children: [
                                    {
                                      id: '3a1a614c-adc7-f7b5-6158-fa82b26a3152',
                                      name: 'Primary',
                                      type: 'organizations',
                                      parentId: '3a1945a3-e05d-801a-a582-00528d6eeaf9',
                                      children: [
                                        {
                                          id: '3a1a614c-d4da-3874-984e-5eff5b8af8d7',
                                          name: '1',
                                          type: 'standards',
                                          parentId: '3a1a614c-adc7-f7b5-6158-fa82b26a3152',
                                          children: [
                                            {
                                              id: '3a1a614d-02a3-46d7-204e-007496ee8d20',
                                              name: 'A',
                                              type: 'divisions',
                                              parentId: '3a1a614c-d4da-3874-984e-5eff5b8af8d7',
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ]}
                          isShowDelete={false}
                        />
                      </Scrollbar>
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
                                      disabled
                                      checked={role === 'Teacher' || role === 'Librarian'}
                                      // checked={formik.values.roles?.includes(role)}
                                      // onChange={(e) => {
                                      //   const current = new Set(formik.values.roles || []);
                                      //   if (e.target.checked) current.add(role);
                                      //   else current.delete(role);
                                      //   formik.setFieldValue('roles', Array.from(current));
                                      // }}
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

                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle1" color="primary">
                        Additional Filters
                      </Typography>
                    </Grid>

                    <Grid
                      size={{ xs: 6 }}
                      sx={{ borderRight: '2px solid', borderColor: 'primary.main', pr: 2 }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2">Students Filter</Typography>
                        {/* <IconButton
            size="small"
            color="primary"
            // onClick={() => handleAddFilter(true)}
            aria-label="add-student-filter"
          >
            <AddIcon fontSize="small" />
          </IconButton> */}
                      </Box>
                      {renderFilterRows(studentFilters, true)}
                    </Grid>
                    <Grid size={{ xs: 6 }} pl={2}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2">Employee Filters</Typography>
                        {/* <IconButton
            size="small"
            color="primary"
            onClick={() => handleAddFilter(false)}
            aria-label="add-employee-filter"
          >
            <AddIcon fontSize="small" />
          </IconButton> */}
                      </Box>
                      {renderFilterRows(employeeFilters, false)}
                    </Grid>
                  </Grid>

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
                      mt: 2,
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
                        Selected Users ({selection.length || 0})
                      </Typography>
                    </Box>
                    {selection.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No users selected yet.
                      </Typography>
                    ) : (
                      <Box>
                        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                          {selection.map((id: string) => {
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
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Card>
        </Box>
      </DialogScrollContent>
    </CustomDialog>
  );
};

export default GroupViewDialog;
