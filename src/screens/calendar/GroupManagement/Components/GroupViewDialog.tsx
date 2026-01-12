import { Scrollbar } from 'src/components/scrollbar';
import React, { useState, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Tab,
  Card,
  Grid,
  Tabs,
  Stack,
  Divider,
  Checkbox,
  Typography,
  FormControlLabel,
} from '@mui/material';
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
  <Box
    sx={{
      display: 'flex',
      alignItems: 'baseline',
      p: 1.5,
      borderBottom: '1px dashed',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Typography variant="subtitle2" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, flexGrow: 1 }}>
      {value || '—'}
    </Typography>
  </Box>
);

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

  // Simplified read-only rendering of filters: show field label, operator label, and value inline
  const renderFilterRows = useCallback(
    (filters: FilterRow[], isStudent: boolean) => (
      <Stack spacing={1} mt={1.5}>
        {filters.map((f) => {
          const meta = getFieldMeta(f.field, isStudent);
          const operatorLabel =
            operatorOptions.find((o) => o.value === f.operator)?.label || f.operator;
          return (
            <Box
              key={f.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  bgcolor: isStudent ? 'primary.lighter' : 'secondary.lighter',
                  color: isStudent ? 'primary.dark' : 'secondary.dark',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {meta?.label || f.field}
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {operatorLabel}
              </Typography>

              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {String(f.value)}
              </Typography>
            </Box>
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
      <DialogScrollContent dividers sx={{ bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          {/* Left Side: Details & Stats */}
          <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
            <Stack spacing={3}>
              {/* Basic Details Card */}
              <Card sx={{ p: 0, overflow: 'hidden', boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
                <Box sx={{ bgcolor: 'primary.lighter', px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" color="primary.darker" sx={{ fontWeight: 700 }}>
                    Group Details
                  </Typography>
                </Box>
                <Box sx={{ p: 1 }}>
                  <InfoRow label="Group Name" value={group.groupName} />
                  <InfoRow label="Description" value={group.description || '—'} />
                </Box>
              </Card>

              {/* Stats Cards */}
              <Box>
                <Card sx={{ p: 2, mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 0.5 }}>
                    Total Audience
                  </Typography>
                  <Typography variant="h3">200</Typography>
                </Card>

                <Grid container spacing={1.5}>
                  <Grid size={6}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="h5" color="primary.main">
                        120
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Students
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={6}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="h5" color="info.main">
                        80
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Employees
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Grid>

          {/* Right Side: Tabbed Static Data */}
          <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: 2,
                  bgcolor: 'background.neutral',
                }}
              >
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  variant="standard"
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ '& .MuiTab-root': { minHeight: 60, fontSize: 13, fontWeight: 700 } }}
                >
                  <Tab label="RULE BASED" />
                  <Tab label="NAME BASED" />
                </Tabs>
              </Box>

              <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
                {tab === 0 && (
                  <Grid container spacing={4}>
                    {/* Academic Selections */}
                    <Grid
                      size={{ xs: 12, md: 7 }}
                      sx={{
                        borderRight: { md: '1px dashed' },
                        borderColor: { md: 'divider' },
                        pr: { md: 4 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 24,
                            bgcolor: 'primary.main',
                            mr: 1,
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="h6">Academic Selections</Typography>
                      </Box>

                      <Box
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 2,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Scrollbar sx={{ maxHeight: 300 }}>
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
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <Divider sx={{ mb: 2 }}>
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ color: 'text.disabled', px: 1 }}
                          >
                            AND
                          </Typography>
                        </Divider>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                              Included Roles
                            </Typography>
                            <Card variant="outlined">
                              <Stack spacing={0} sx={{ p: 1 }}>
                                {[
                                  'Teacher',
                                  'Principle',
                                  'Cashier',
                                  'Driver',
                                  'Librarian',
                                  'Peon',
                                ].map((role) => (
                                  <FormControlLabel
                                    key={role}
                                    control={
                                      <Checkbox
                                        size="small"
                                        disabled
                                        checked={role === 'Teacher' || role === 'Librarian'}
                                      />
                                    }
                                    label={<Typography variant="body2">{role}</Typography>}
                                    sx={{
                                      m: 0,
                                      py: 0.5,
                                      '&:hover': { bgcolor: 'action.hover' },
                                      borderRadius: 1,
                                    }}
                                  />
                                ))}
                              </Stack>
                            </Card>
                          </Grid>

                          {/* Add more filter summaries here if needed */}
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Additional Filters */}
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 24,
                            bgcolor: 'secondary.main',
                            mr: 1,
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="h6">Additional Rules</Typography>
                      </Box>

                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Student Specific Rules
                          </Typography>
                          {renderFilterRows(studentFilters, true)}
                        </Box>
                        <Divider />
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Employee Specific Rules
                          </Typography>
                          {renderFilterRows(employeeFilters, false)}
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                )}

                {tab === 1 && (
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">Manually Selected Users</Typography>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          bgcolor: 'primary.lighter',
                          color: 'primary.dark',
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {selection.length} Selected
                      </Box>
                    </Box>

                    {selection.length === 0 ? (
                      <Box
                        sx={{
                          py: 8,
                          textAlign: 'center',
                          bgcolor: 'background.neutral',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No users selected manually.
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1.5}>
                        {selection.map((id: string) => {
                          const user = dummyRows.find((r) => r.id === id);
                          if (!user) return null;
                          const isStudent = user.type === 'Student';
                          const extra = isStudent
                            ? `Class ${user.class}${user.division ? `-${user.division}` : ''}`
                            : `${user.designation}${user.department ? ` • ${user.department}` : ''}`;

                          return (
                            <Card
                              key={id}
                              sx={{
                                p: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  boxShadow: 3,
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: '50%',
                                  bgcolor: isStudent ? 'primary.lighter' : 'secondary.lighter',
                                  color: isStudent ? 'primary.main' : 'secondary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: 18,
                                }}
                              >
                                {user.firstName[0]}
                              </Box>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2">{user.fullName}</Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  {user.type} • {extra}
                                </Typography>
                              </Box>

                              <Box sx={{ textAlign: 'right' }}>
                                <Box
                                  sx={{
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 0.5,
                                    bgcolor:
                                      user.status === 'Active'
                                        ? 'success.lighter'
                                        : 'error.lighter',
                                    color: user.status === 'Active' ? 'success.dark' : 'error.dark',
                                    fontSize: 11,
                                    fontWeight: 700,
                                  }}
                                >
                                  {user.status.toUpperCase()}
                                </Box>
                              </Box>
                            </Card>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </DialogScrollContent>
    </CustomDialog>
  );
};

export default GroupViewDialog;
