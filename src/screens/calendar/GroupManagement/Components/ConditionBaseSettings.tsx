import type { Board } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import React, { useMemo, useState, useEffect } from 'react';
import { CheckBoxOutlineBlank, CheckBox as CheckBoxIcon } from '@mui/icons-material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Chip,
  Avatar,
  Divider,
  Checkbox,
  TextField,
  Typography,
  FormControl,
  Autocomplete,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

interface ConditionBaseSettingsProps {
  addConditionBaseDialog: any;
  addSelectionBaseDialog: any;
  formik: any;
}

const roles = [
  { id: '1', name: 'Admin' },
  { id: '2', name: 'Principal' },
  { id: '3', name: 'Teacher' },
  { id: '4', name: 'Student' },
  { id: '5', name: 'Parent' },
  { id: '6', name: 'Accountant' },
  { id: '7', name: 'Librarian' },
  { id: '8', name: 'Receptionist' },
  { id: '9', name: 'Transport Manager' },
  { id: '10', name: 'Hostel Warden' },
];

export const employeeData = [
  {
    id: 'e1',
    name: 'Rajesh Kumar',
    role: 'Admin',
    department: 'Administration',
    employeeId: 'EMP1001',
    email: 'rajesh.kumar@school.com',
    contactNo: '+91 9876000001',
    avatar: '/assets/images/avatar/avatar-7.jpg',
  },
  {
    id: 'e2',
    name: 'Meena Patel',
    role: 'Principal',
    department: 'Management',
    employeeId: 'EMP1002',
    email: 'meena.patel@school.com',
    contactNo: '+91 9876000002',
    avatar: '/assets/images/avatar/avatar-8.jpg',
  },
  {
    id: 'e3',
    name: 'Karan Joshi',
    role: 'Teacher',
    department: 'Mathematics',
    employeeId: 'EMP1003',
    email: 'karan.joshi@school.com',
    contactNo: '+91 9876000003',
    avatar: '/assets/images/avatar/avatar-5.jpg',
  },
  {
    id: 'e4',
    name: 'Sneha Reddy',
    role: 'Teacher',
    department: 'Science',
    employeeId: 'EMP1004',
    email: 'sneha.reddy@school.com',
    contactNo: '+91 9876000004',
    avatar: '/assets/images/avatar/avatar-6.jpg',
  },
  {
    id: 'e5',
    name: 'Amit Shah',
    role: 'Parent',
    department: 'N/A',
    employeeId: 'EMP1005',
    email: 'amit.shah@school.com',
    contactNo: '+91 9876000005',
    avatar: '/assets/images/avatar/avatar-9.jpg',
  },
  {
    id: 'e6',
    name: 'Priya Nair',
    role: 'Accountant',
    department: 'Accounts',
    employeeId: 'EMP1006',
    email: 'priya.nair@school.com',
    contactNo: '+91 9876000006',
    avatar: '/assets/images/avatar/avatar-10.jpg',
  },
  {
    id: 'e7',
    name: 'Vivek Gupta',
    role: 'Librarian',
    department: 'Library',
    employeeId: 'EMP1007',
    email: 'vivek.gupta@school.com',
    contactNo: '+91 9876000007',
    avatar: '/assets/images/avatar/avatar-11.jpg',
  },
  {
    id: 'e8',
    name: 'Anjali Singh',
    role: 'Receptionist',
    department: 'Front Office',
    employeeId: 'EMP1008',
    email: 'anjali.singh@school.com',
    contactNo: '+91 9876000008',
    avatar: '/assets/images/avatar/avatar-12.jpg',
  },
  {
    id: 'e9',
    name: 'Rohit Verma',
    role: 'Transport Manager',
    department: 'Transport',
    employeeId: 'EMP1009',
    email: 'rohit.verma@school.com',
    contactNo: '+91 9876000009',
    avatar: '/assets/images/avatar/avatar-13.jpg',
  },
  {
    id: 'e10',
    name: 'Neha Chawla',
    role: 'Hostel Warden',
    department: 'Hostel',
    employeeId: 'EMP1010',
    email: 'neha.chawla@school.com',
    contactNo: '+91 9876000010',
    avatar: '/assets/images/avatar/avatar-14.jpg',
  },
];

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
const ConditionBaseSettings: React.FC<ConditionBaseSettingsProps> = ({
  addConditionBaseDialog,
  addSelectionBaseDialog,
  formik,
}) => {
  const theme = useTheme();
  const [searchInput, setSearchInput] = useState('');
  //   const { data: employeeData } = useQueryAndMutation({
  //     type: 'query',
  //     currentQueryAndMutation: useGetGroupEmployeesQuery,
  //   });
  const [groupedMediums, setGroupedMediums] = useState([]);
  const [groupedOrganizations, setGroupedOrganizations] = useState<any>([]);
  const [groupedStandards, setGroupedStandards] = useState<any>([]);
  const [groupedDivisions, setGroupedDivisions] = useState<any>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [boards, setBoards] = useState<Board[]>([]);
  // Query hook for fetching all roles
  //   const { data: roles, isLoading } = useQueryAndMutation({
  //     type: 'query',
  //     currentQueryAndMutation: useGetRolesQuery,
  //   });
  const handleRoleChange = (roleId: string) => {
    const selectedRoles = formik.values.roles || [];

    if (selectedRoles.includes(roleId)) {
      formik.setFieldValue(
        'roles',
        selectedRoles.filter((id: string) => id !== roleId)
      );
    } else {
      formik.setFieldValue('roles', [...selectedRoles, roleId]);
    }
  };

  // --- Filter logic ---
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const filteredEmployees = useMemo(() => {
    let filtered = employeeData;

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.role.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [debouncedSearch]);

  useEffect(() => {
    if (currentYear?.boards) {
      setBoards(currentYear.boards);
    }
  }, [currentYear]);
  useEffect(() => {
    if (formik.values.boards.length > 0) {
      const groups = currentYear.boards
        .filter((b: Board) => formik.values.boards.includes(b.id))
        .map((b: Board) => ({
          boardId: b.id,
          boardName: b.name,
          mediums: b.educationMediums || [],
        }));
      setGroupedMediums(groups);
    } else {
      setGroupedMediums([]);
      formik.setFieldValue('mediums', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, formik.values.boards]);

  useEffect(() => {
    if (formik.values.mediums.length > 0) {
      const selectedMediums = groupedMediums.flatMap((b: any) =>
        b.mediums
          .filter((m: any) => formik.values.mediums.includes(m.id))
          .map((m: any) => ({
            boardId: b.boardId,
            boardName: b.boardName,
            mediumId: m.id,
            mediumName: m.name,
            organizations: m.educationMediumStages || [],
          }))
      );

      setGroupedOrganizations(selectedMediums);
    } else {
      setGroupedOrganizations([]);
      formik.setFieldValue('organizations', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.mediums, groupedMediums]);

  const flattenedOrganizations = groupedOrganizations.flatMap((group: any) =>
    group.organizations.map((org: any) => ({
      id: org.id,
      name: org.name,
      boardName: group.boardName,
      mediumName: group.mediumName,
    }))
  );

  useEffect(() => {
    if (formik.values.organizations.length > 0) {
      const selectedOrganizations = groupedOrganizations.flatMap((m: any) =>
        m.organizations
          .filter((o: any) => formik.values.organizations.includes(o.id))
          .map((o: any) => ({
            boardId: m.boardId,
            boardName: m.boardName,
            mediumId: m.mediumId,
            mediumName: m.mediumName,
            organizationId: o.id,
            organizationName: o.name,
            standards: o.standards || [], // Assuming standards are inside each organization
          }))
      );
      setGroupedStandards(selectedOrganizations);
    } else {
      setGroupedStandards([]);
      formik.setFieldValue('classes', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizations, groupedOrganizations]);

  const flattenedStandards = groupedStandards.flatMap((group: any) =>
    group.standards.map((std: any) => ({
      id: std.id,
      name: std.name,
      boardName: group.boardName,
      mediumName: group.mediumName,
      organizationName: group.organizationName,
    }))
  );

  useEffect(() => {
    if (formik.values.classes.length > 0) {
      const selectedDivisions = groupedStandards.flatMap((orgGroup: any) =>
        orgGroup.standards
          .filter((std: any) => formik.values.classes.includes(std.id))
          .map((std: any) => ({
            boardId: orgGroup.boardId,
            boardName: orgGroup.boardName,
            mediumId: orgGroup.mediumId,
            mediumName: orgGroup.mediumName,
            organizationId: orgGroup.organizationId,
            organizationName: orgGroup.organizationName,
            standardId: std.id,
            standardName: std.name,
            divisions: std.divisions || [], // Assuming each standard has divisions
          }))
      );
      setGroupedDivisions(selectedDivisions);
    } else {
      setGroupedDivisions([]);
      formik.setFieldValue('divisions', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.classes, groupedStandards]);

  const flattenedDivisions = groupedDivisions.flatMap((group: any) =>
    group.divisions.map((div: any) => ({
      id: div.id,
      name: div.name,
      boardName: group.boardName,
      mediumName: group.mediumName,
      organizationName: group.organizationName,
      standardName: group.standardName,
    }))
  );

  const handleCheckboxChange = (userId: string) => {
    const selectedUsers = [...formik.values.employees];
    if (selectedUsers.includes(userId)) {
      formik.setFieldValue(
        'employees',
        selectedUsers.filter((id) => id !== userId)
      );
    } else {
      formik.setFieldValue('employees', [...selectedUsers, userId]);
    }
    // Recalculate total whenever employees selection changes
    formik.setFieldValue('total', selectedUsers.length);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        {formik.touched.total && formik.errors.total && (
          <FormHelperText
            error
            sx={{
              fontSize: '10px !important',
              position: 'relative',
              mt: -2,
            }}
          >
            {String(formik.errors.total || 'ftyghjk')}
          </FormHelperText>
        )}
      </Grid>
      <Grid size={{ xs: 6 }}>
        <SectionCard title="Academic Selection">
          <Scrollbar sx={{ height: '560px' }}>
            <Grid size={{ xs: 12 }} mb={2}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #bbdefb',
                  borderRadius: 2,
                  backgroundColor: varAlpha(theme.palette.primary.mainChannel, 0.08),
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                  }}
                >
                  🏫 Board
                </Typography>

                {/* Selected Chips */}
                {formik.values.boards?.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    {boards
                      .filter((b) => formik.values.boards.includes(b.id))
                      .map((b) => (
                        <Chip
                          key={b.id}
                          label={b.name}
                          color="primary"
                          size="small"
                          onDelete={() =>
                            formik.setFieldValue(
                              'boards',
                              formik.values.boards.filter((id: any) => id !== b.id)
                            )
                          }
                        />
                      ))}
                  </Box>
                )}

                {/* Searchable Multi-select */}
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    options={boards}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option.name}
                    value={boards.filter((b) => (formik.values.boards || []).includes(b.id))}
                    onChange={(_, value) =>
                      formik.setFieldValue(
                        'boards',
                        value.map((v) => v.id)
                      )
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.name}
                      </li>
                    )}
                    renderTags={() => null} // hide chips inside the input
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          formik.values.boards?.length > 0
                            ? `${formik.values.boards.length} Board(s) selected`
                            : 'Choose Board'
                        }
                        placeholder="Search Board..."
                      />
                    )}
                  />
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }} mb={2}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #e1bee7',
                  borderRadius: 2,
                  backgroundColor: varAlpha(theme.palette.info.mainChannel, 0.08),
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: theme.palette.info.main,
                  }}
                >
                  🌐 Medium
                </Typography>

                {/* Selected Chips */}
                {formik.values.mediums.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {groupedMediums
                      .flatMap((g: any) =>
                        g.mediums.map((m: any) => ({
                          ...m,
                          boardName: g.boardName,
                        }))
                      )
                      .filter((m: any) => formik.values.mediums.includes(m.id))
                      .map((m: any) => (
                        <Chip
                          key={m.id}
                          size="small"
                          label={`${m.boardName} / ${m.name}`}
                          color="info"
                          onDelete={() =>
                            formik.setFieldValue(
                              'mediums',
                              formik.values.mediums.filter((id: any) => id !== m.id)
                            )
                          }
                        />
                      ))}
                  </Box>
                )}

                {/* Searchable Grouped Multi-Select */}
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={groupedMediums.flatMap((board: any) =>
                      board.mediums.map((medium: any) => ({
                        ...medium,
                        boardName: board.boardName,
                      }))
                    )}
                    disabled={formik.values.boards?.length === 0}
                    groupBy={(option) => option.boardName}
                    getOptionLabel={(option) => option.name}
                    value={groupedMediums
                      .flatMap((b: any) =>
                        b.mediums.map((m: any) => ({ ...m, boardName: b.boardName }))
                      )
                      .filter((m: any) => formik.values.mediums.includes(m.id))}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_, value) => {
                      const ids = value.map((v) => v.id);
                      formik.setFieldValue('mediums', ids);
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.name}
                      </li>
                    )}
                    renderTags={() => null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          formik.values.mediums.length > 0
                            ? `${formik.values.mediums.length} Medium${
                                formik.values.mediums.length > 1 ? 's' : ''
                              } selected`
                            : 'Choose Medium'
                        }
                        placeholder="Search Medium..."
                      />
                    )}
                  />
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }} mb={2}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #e7d5beff',
                  borderRadius: 2,
                  backgroundColor: varAlpha(theme.palette.secondary.mainChannel, 0.08),
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: theme.palette.secondary.main,
                  }}
                >
                  🏢 Organization
                </Typography>

                {/* Selected Chips */}
                {formik.values.mediums.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {flattenedOrganizations
                      .filter((o: any) => formik.values.organizations.includes(o.id))
                      .map((o: any) => (
                        <Chip
                          key={o.id}
                          label={`${o.boardName} / ${o.mediumName} / ${o.name}`}
                          color="secondary"
                          size="small"
                          onDelete={() =>
                            formik.setFieldValue(
                              'organizations',
                              formik.values.organizations.filter((id: any) => id !== o.id)
                            )
                          }
                        />
                      ))}
                  </Box>
                )}

                {/* Searchable Grouped Multi-Select */}
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    disabled={formik.values.mediums?.length === 0}
                    options={flattenedOrganizations}
                    groupBy={(option) => `${option.boardName} / ${option.mediumName}`}
                    getOptionLabel={(option) => option.name}
                    value={flattenedOrganizations.filter((o: any) =>
                      formik.values.organizations.includes(o.id)
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_, value) => {
                      const ids = value.map((v) => v.id);
                      formik.setFieldValue('organizations', ids);
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.name}
                      </li>
                    )}
                    renderTags={() => null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          formik.values.organizations.length > 0
                            ? `${formik.values.organizations.length} Organization${
                                formik.values.organizations.length > 1 ? 's' : ''
                              } selected`
                            : 'Choose Organization'
                        }
                        placeholder="Search Organization..."
                      />
                    )}
                  />
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }} mb={2}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #d2c5e8',
                  borderRadius: 2,
                  backgroundColor: varAlpha(theme.palette.warning.mainChannel, 0.08),
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: theme.palette.warning.main,
                  }}
                >
                  🎓 Class / Standard
                </Typography>

                {/* Selected Chips */}
                {formik.values.organizations.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {flattenedStandards
                      .filter((s: any) => formik.values.classes.includes(s.id))
                      .map((s: any) => (
                        <Chip
                          key={s.id}
                          label={`${s.boardName} / ${s.mediumName} / ${s.organizationName} / ${s.name}`}
                          color="warning"
                          size="small"
                          onDelete={() =>
                            formik.setFieldValue(
                              'classes',
                              formik.values.classes.filter((id: any) => id !== s.id)
                            )
                          }
                        />
                      ))}
                  </Box>
                )}

                {/* Searchable Grouped Multi-Select */}
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    disabled={formik.values.organizations?.length === 0}
                    options={flattenedStandards}
                    groupBy={(option) =>
                      `${option.boardName} / ${option.mediumName} / ${option.organizationName}`
                    }
                    getOptionLabel={(option) => option.name}
                    value={flattenedStandards.filter((s: any) =>
                      formik.values.classes.includes(s.id)
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_, value) => {
                      const ids = value.map((v) => v.id);
                      formik.setFieldValue('classes', ids);
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.name}
                      </li>
                    )}
                    renderTags={() => null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          formik.values.classes.length > 0
                            ? `${formik.values.classes.length} Class${
                                formik.values.classes.length > 1 ? 'es' : ''
                              } selected`
                            : 'Choose Class'
                        }
                        placeholder="Search Class..."
                      />
                    )}
                  />
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #b9e0d9',
                  borderRadius: 2,
                  backgroundColor: varAlpha(theme.palette.success.mainChannel, 0.08),
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: theme.palette.success.main,
                  }}
                >
                  🧩 Division
                </Typography>

                {/* Selected Chips */}
                {formik.values.classes.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {flattenedDivisions
                      .filter((d: any) => formik.values.divisions.includes(d.id))
                      .map((d: any) => (
                        <Chip
                          key={d.id}
                          size="small"
                          label={`${d.boardName} / ${d.mediumName} / ${d.organizationName} / ${d.standardName} / ${d.name}`}
                          color="success"
                          onDelete={() =>
                            formik.setFieldValue(
                              'divisions',
                              formik.values.divisions.filter((id: any) => id !== d.id)
                            )
                          }
                        />
                      ))}
                  </Box>
                )}

                {/* Searchable Grouped Multi-Select */}
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={flattenedDivisions}
                    groupBy={(option) =>
                      `${option.boardName} / ${option.mediumName} / ${option.organizationName} / ${option.standardName}`
                    }
                    disabled={formik.values.classes?.length === 0}
                    getOptionLabel={(option) => option.name}
                    value={flattenedDivisions.filter((d: any) =>
                      formik.values.divisions.includes(d.id)
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_, value) => {
                      const ids = value.map((v) => v.id);
                      formik.setFieldValue('divisions', ids);
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.name}
                      </li>
                    )}
                    renderTags={() => null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          formik.values.divisions.length > 0
                            ? `${formik.values.divisions.length} Division${
                                formik.values.divisions.length > 1 ? 's' : ''
                              } selected`
                            : 'Choose Division'
                        }
                        placeholder="Search Division..."
                      />
                    )}
                  />
                </FormControl>
              </Box>
            </Grid>
          </Scrollbar>
        </SectionCard>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Box gap={1}>
          <SectionCard title="Roles">
            <Scrollbar sx={{ height: '100px' }}>
              {roles.length ? (
                <Grid
                  container
                  spacing={0.5} // ↓ Reduce vertical & horizontal spacing between items
                >
                  {roles.map((role: any) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={role.id}>
                      <FormControlLabel
                        sx={{
                          m: 0, // remove default margin around label
                          '& .MuiTypography-root': { fontSize: '0.85rem' }, // optional: smaller text
                        }}
                        control={
                          <Checkbox
                            checked={formik.values.roles?.includes(role.id)}
                            onChange={() => handleRoleChange(role.id)}
                            color="primary"
                            size="small" // smaller checkbox
                          />
                        }
                        label={<Typography variant="body2">{role.name}</Typography>}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No roles available
                </Typography>
              )}
            </Scrollbar>
          </SectionCard>
          <SectionCard title="Select Employees">
            <TextField
              variant="outlined"
              size="small"
              value={searchInput}
              onChange={(e) => {
                const val = e.target.value;
                setSearchInput(val);
              }}
              label="Search by Name, Email OR Role"
              fullWidth
            />
            <Scrollbar sx={{ height: '300px' }}>
              <Box mt={1}>
                {filteredEmployees.map((user, index) => {
                  const isSelected = formik.values.employees.includes(user.id);
                  return (
                    <Box key={user.id} sx={{ mb: 1 }} onClick={() => handleCheckboxChange(user.id)}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 1.5,
                          px: 1.5,
                          cursor: 'pointer',
                          borderRadius: 1,
                          border: isSelected
                            ? `2px solid ${theme.palette.primary.main}`
                            : '1px solid rgba(0,0,0,0.1)',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' },
                        }}
                      >
                        {/* Left Section - Avatar + Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={user?.avatar || '/assets/images/avatar/avatar-1.jpg'}
                            alt={user?.name || 'User'}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              border: isSelected
                                ? `2px solid ${theme.palette.primary.main}`
                                : 'none',
                            }}
                          />
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {user.name}
                              </Typography>
                              {user.role && (
                                <Chip label={user.role} size="small" variant="outlined" />
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {user.email}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {user.contactNo}
                              </Typography>
                              {/* {user.department && (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  Department {user.department}
                                </Typography>
                              )} */}
                            </Box>
                          </Box>
                        </Box>

                        {/* Right Section - Checkbox */}
                        <Checkbox
                          color="primary"
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(user.id)}
                        />
                      </Box>

                      {index !== employeeData.length - 1 && <Divider />}
                    </Box>
                  );
                })}
              </Box>
            </Scrollbar>
          </SectionCard>
        </Box>
      </Grid>
    </Grid>
  );
};
export default ConditionBaseSettings;
