import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { Upload } from 'src/components/upload';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import {
  Box,
  Grid,
  Radio,
  Switch,
  MenuList,
  MenuItem,
  RadioGroup,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

const GroupMessage = (props: TabComponentType) => {
  const [group, setGroup] = React.useState('entireSchool');
  const handleGroupChange = (ev: any) => {
    setGroup(ev.target.value);
  };

  const dummyData = [
    {
      dateAndTime: '2023-05-15 10:30 AM',
      groupItWasSentTo: 'Entire School',
      messageContent: 'School closure due to maintenance work',
    },
    {
      dateAndTime: '2023-05-14 2:45 PM',
      groupItWasSentTo: 'Grade 10',
      messageContent: 'Reminder: Science project due next week',
    },
    {
      dateAndTime: '2023-05-13 9:00 AM',
      groupItWasSentTo: 'Teachers',
      messageContent: 'Staff meeting scheduled for Friday',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <CustomSelect options={[]} value="" onChange={() => {}} label="Organization" />
        <CustomSelect options={[]} value="" onChange={() => {}} label="Class" />
        <CustomSelect options={[]} value="" onChange={() => {}} label="Event" />
      </Box>
      <FormControl component="fieldset">
        <RadioGroup row value={group} onChange={handleGroupChange}>
          <FormControlLabel value="entireSchool" control={<Radio />} label="Entire school" />
          <FormControlLabel value="specificGrades" control={<Radio />} label="Specific grades" />
        </RadioGroup>
      </FormControl>
      <Box sx={{ mt: 4, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
        <Typography variant="h6" align="center">
          Preview
        </Typography>
      </Box>

      <Grid container spacing={2} style={{ padding: 20 }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Message Editor</Typography>
          <Upload />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Templates</Typography>
          {/* Avatar icon for personalized templates */}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControlLabel control={<Switch color="primary" />} label="Immediate sending" />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControlLabel control={<Switch color="primary" />} label="Scheduled sending" />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DatePicker label="Schedule Date" />
        </Grid>
      </Grid>

      <Typography variant="h6" my={2}>
        Message History
      </Typography>
      <CustomizableTable
        tableId="message-history-table"
        data={dummyData}
        columns={[
          { id: 'dateAndTime', label: 'Date and time sent' },
          { id: 'groupItWasSentTo', label: 'Group it was sent to' },
          { id: 'messageContent', label: 'Message content' },
          {
            id: 'action',
            label: 'Action',
            render() {
              return (
                <ThreeDotsActions
                  actions={() => (
                    <MenuList>
                      <MenuItem>
                        <Iconify icon="mdi:send" />
                        Resend
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
      />
    </Box>
  );
};

export default GroupMessage;
