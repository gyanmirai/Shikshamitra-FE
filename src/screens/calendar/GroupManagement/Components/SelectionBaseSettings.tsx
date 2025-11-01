import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import {
  Box,
  Chip,
  Grid,
  Avatar,
  Divider,
  Checkbox,
  TextField,
  Typography,
  FormHelperText,
} from '@mui/material';

interface SelectionBaseSettingsProps {
  addConditionBaseDialog: any;
  addSelectionBaseDialog: any;
  formik: any;
}

export const users = [
  {
    id: 'u1',
    name: 'Aarav Patel',
    role: 'Student',
    class: '10',
    div: 'A',
    rollNo: 1,
    grNo: 'GR1001',
    email: 'aarav.patel@example.com',
    contactNo: '+91 9876543210',
    avatar: '/assets/images/avatar/avatar-1.jpg',
  },
  {
    id: 'u2',
    name: 'Diya Sharma',
    role: 'Student',
    class: '10',
    div: 'A',
    rollNo: 2,
    grNo: 'GR1002',
    email: 'diya.sharma@example.com',
    contactNo: '+91 9823456789',
    avatar: '/assets/images/avatar/avatar-2.jpg',
  },
  {
    id: 'u3',
    name: 'Rohan Mehta',
    role: 'Student',
    class: '10',
    div: 'B',
    rollNo: 5,
    grNo: 'GR1005',
    email: 'rohan.mehta@example.com',
    contactNo: '+91 9898989898',
    avatar: '/assets/images/avatar/avatar-3.jpg',
  },
  {
    id: 'u4',
    name: 'Isha Desai',
    role: 'Student',
    class: '9',
    div: 'A',
    rollNo: 12,
    grNo: 'GR0901',
    email: 'isha.desai@example.com',
    contactNo: '+91 9765432100',
    avatar: '/assets/images/avatar/avatar-4.jpg',
  },
  {
    id: 'u5',
    name: 'Karan Joshi',
    role: 'Teacher',
    class: '10',
    div: 'A',
    rollNo: null,
    grNo: 'EMP2001',
    email: 'karan.joshi@example.com',
    contactNo: '+91 9123456780',
    avatar: '/assets/images/avatar/avatar-5.jpg',
  },
  {
    id: 'u6',
    name: 'Sneha Reddy',
    role: 'Teacher',
    class: '9',
    div: 'B',
    rollNo: null,
    grNo: 'EMP2002',
    email: 'sneha.reddy@example.com',
    contactNo: '+91 9876501234',
    avatar: '/assets/images/avatar/avatar-6.jpg',
  },
];

const SelectionBaseSettings: React.FC<SelectionBaseSettingsProps> = ({
  addConditionBaseDialog,
  addSelectionBaseDialog,
  formik,
}) => {
  const theme = useTheme();
  const [searchInput, setSearchInput] = useState('');
  // --- Filter logic ---
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.email.toLowerCase().includes(query) ||
          b.role.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [debouncedSearch]);

  const handleCheckboxChange = (userId: string) => {
    const selectedUsers = [...formik.values.users];
    let newUsers: string[];
    if (selectedUsers.includes(userId)) {
      newUsers = selectedUsers.filter((id) => id !== userId);
    } else {
      newUsers = [...selectedUsers, userId];
    }
    formik.setFieldValue('users', newUsers);
    formik.setFieldValue('total', newUsers.length);
  };

  if (!users?.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
        <EmptyContent title="No Users Available" />
      </Box>
    );
  }

  return (
    <>
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
        <Grid size={{ xs: 12, md: 11 }}>
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
        </Grid>
        <Grid size={{ xs: 12, md: 1 }}>
          <Chip label={`Total Selection : ${formik.values.users.length}`} color="primary" />
        </Grid>
      </Grid>
      <Scrollbar sx={{ height: '400px' }}>
        <Box mt={1}>
          {filteredUsers.map((user, index) => {
            const isSelected = formik.values.users.includes(user.id);
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
                        border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
                      }}
                    />
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {user.name}
                        </Typography>
                        {user.role && <Chip label={user.role} size="small" variant="outlined" />}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {user.email}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {user.contactNo}
                        </Typography>
                        {user.class && user.div && (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Class {user.class}-{user.div}
                          </Typography>
                        )}
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

                {index !== users.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Box>
      </Scrollbar>
    </>
  );
};

export default SelectionBaseSettings;
