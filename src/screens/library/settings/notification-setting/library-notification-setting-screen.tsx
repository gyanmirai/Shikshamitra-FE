'use client';

import React, { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Grid,
  Switch,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material'; // Assuming you have this component

const LibraryNotificationSettingScreen = () => {
  const [frequency, setFrequency] = useState<any>('');
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  // const [, setRoles] = useState({
  //   staff: false,
  //   sms: false,
  //   email: false,
  //   whatsapp: false, // Added WhatsApp communication preference
  // });

  // const handleRoleChange = (role: string, checked: boolean) => {
  //   setRoles((prev) => ({ ...prev, [role]: checked }));
  // };

  // Communication data for the table
  const communicationData = [
    { group: 'Student', sms: false, email: false, whatsapp: false },
    { group: 'Teacher', sms: false, email: false, whatsapp: false },
    { group: 'Librarian', sms: false, email: false, whatsapp: false },
  ];

  // Handle change in communication preference for each user group
  const handleGroupChange = (group: string, type: string, checked: boolean) => {
    // const updatedData = communicationData.map((item) =>
    //   item.group === group ? { ...item, [type]: checked } : item
    // );
    // Update the communication preferences data (SMS, Email, WhatsApp) accordingly
    // This is where you could update the state or perform actions with the updated data
  };

  return (
    <>
      <CustomBreadcrumbs
        heading="Notification Setting"
        links={[{ name: 'Library' }, { name: 'Setting' }, { name: 'Notification Setting' }]}
        sx={{ px: 1 }}
      />

      <Box sx={{ padding: 1 }}>
        {/* Reminders Section */}
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Reminders Section
        </Typography>
        <Grid container spacing={3}>
          {/* Frequency Dropdown */}
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomSelect
              label="Frequency"
              options={[
                { label: 'Daily', value: 'daily' },
                { label: 'Monthly', value: 'Monthly' },
              ]}
              value={frequency}
              onChange={(value) => setFrequency(value)}
              formControlProps={{ sx: { minWidth: 270 } }}
            />
          </Grid>

          {/* Custom Frequency Input */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Custom Frequency"
              size="small"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              fullWidth
            />
          </Grid>

          {/* Reminder Toggle */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={isReminderEnabled}
                  onChange={(e) => setIsReminderEnabled(e.target.checked)}
                />
              }
              label="Enable Reminders for Due Dates and Overdue Books"
            />
          </Grid>
        </Grid>

        {/* Communication Preferences Section */}
        <Typography variant="h6" sx={{ marginTop: 4, marginBottom: 2 }}>
          Communication Preferences Section
        </Typography>

        {/* Customizable Table for Communication Preferences */}
        <CustomizableTable
          isPagination={false}
          tableId="communication-preferences-table"
          isFilter={false}
          isShowedDense={false}
          isSearch={false}
          columns={[
            { id: 'group', label: 'User Group' },
            {
              id: 'sms',
              label: 'SMS',
              render: (value, row) => (
                <Checkbox
                  checked={row.sms}
                  onChange={(e) => handleGroupChange(row.group, 'sms', e.target.checked)}
                />
              ),
            },
            {
              id: 'email',
              label: 'Email',
              render: (value, row) => (
                <Checkbox
                  checked={row.email}
                  onChange={(e) => handleGroupChange(row.group, 'email', e.target.checked)}
                />
              ),
            },
            {
              id: 'whatsapp',
              label: 'WhatsApp',
              render: (value, row) => (
                <Checkbox
                  checked={row.whatsapp}
                  onChange={(e) => handleGroupChange(row.group, 'whatsapp', e.target.checked)}
                />
              ),
            },
          ]}
          data={communicationData}
        />
      </Box>
    </>
  );
};

export default LibraryNotificationSettingScreen;

// 'use client';

// import React, { useState } from 'react';

// import {
//   Box,
//   Grid,
//   Switch,
//   Checkbox,
//   TextField,
//   Typography,
//   FormControlLabel,
// } from '@mui/material';

// import CustomSelect from 'src/components/custom-select';
// import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// const LibraryNotificationSettingScreen = () => {
//   const [frequency, setFrequency] = useState<any>('');
//   const [userGroup, setUserGroup] = useState<any>([]);
//   const [isReminderEnabled, setIsReminderEnabled] = useState(false);
//   const [roles, setRoles] = useState({
//     staff: false,
//     sms: false,
//     email: false,
//   });

//   const handleRoleChange = (role: string, checked: boolean) => {
//     setRoles((prev) => ({ ...prev, [role]: checked }));
//   };

//   return (
//     <>
//       <CustomBreadcrumbs
//         heading="Notification Setting"
//         links={[
//           { name: 'Library' },
//           { name: 'Notification Setting' },
//           // {
//           //   name:
//           //     searchParams.tab !== 'Fee-structure-overview'
//           //       ? 'Student Fee Management'
//           //       : 'Fee-Structure-Overview',
//           // },
//         ]}
//
//       />

//       <Box sx={{ padding: 3 }}>
//         {/* Reminders Section */}
//         <Typography variant="h6" sx={{ marginBottom: 2 }}>
//           Reminders Section
//         </Typography>
//         <Grid container spacing={3}>
//           {/* Frequency Dropdown */}
//           <Grid size={{ xs: 12, md: 4 }}>
//             <CustomSelect
//               label="Frequency"
//               options={[

//                 { label: 'Daily', value: 'daily' },
//                 { label: 'Monthly', value: 'Monthly' },
//               ]}
//               value={frequency}
//               onChange={(value) => setFrequency(value)}
//               formControlProps={{ sx: { minWidth: 270 } }}
//             />
//           </Grid>

//           {/* Custom Frequency Input */}
//           <Grid size={{ xs: 12, md: 4 }}>
//             <TextField
//               label="Custom Frequency"
//               size="small"
//               value={frequency}
//               onChange={(e) => setFrequency(e.target.value)}
//               fullWidth
//             />
//           </Grid>

//           {/* Reminder Toggle */}
//           <Grid item xs={12} md={6}>
//             <FormControlLabel
//               control={
//                 <Switch
//                   size="small"
//                   checked={isReminderEnabled}
//                   onChange={(e) => setIsReminderEnabled(e.target.checked)}
//                 />
//               }
//               label="Enable Reminders for Due Dates and Overdue Books"
//             />
//           </Grid>
//         </Grid>

//         {/* Communication Preferences Section */}
//         <Typography variant="h6" sx={{ marginTop: 4, marginBottom: 2 }}>
//           Communication Preferences Section
//         </Typography>
//         <Grid container spacing={3} alignItems="center">
//           {/* User Group Dropdown */}
//           <Grid size={{ xs: 12, md: 4 }}>
//             <CustomSelect
//               multiple
//               label="User Group"
//               options={[
//                 { label: 'Student', value: 'Student' },
//                 { label: 'Teacher', value: 'Teacher' },
//                 { label: 'Librarian', value: 'Librarian' },
//               ]}
//               value={userGroup}
//               onChange={(value) => setUserGroup(value)}
//               formControlProps={{ sx: { minWidth: 270 } }}
//             />
//           </Grid>

//           {/* Role Checkboxes */}
//           <Grid item xs={12} md={9}>
//             <Box display="flex" alignItems="center" gap={3}>
//               <Box display="flex" alignItems="center">
//                 <Checkbox
//                   size="small"
//                   checked={roles.staff}
//                   onChange={(e) => handleRoleChange('staff', e.target.checked)}
//                 />
//                 <Typography variant="body2">In-App</Typography>
//               </Box>
//               <Box display="flex" alignItems="center">
//                 <Checkbox
//                   size="small"
//                   checked={roles.sms}
//                   onChange={(e) => handleRoleChange('sms', e.target.checked)}
//                 />
//                 <Typography variant="body2">SMS</Typography>
//               </Box>
//               <Box display="flex" alignItems="center">
//                 <Checkbox
//                   size="small"
//                   checked={roles.email}
//                   onChange={(e) => handleRoleChange('email', e.target.checked)}
//                 />
//                 <Typography variant="body2">Email</Typography>
//               </Box>
//             </Box>
//           </Grid>
//         </Grid>
//       </Box>
//     </>
//   );
// };

// export default LibraryNotificationSettingScreen;
