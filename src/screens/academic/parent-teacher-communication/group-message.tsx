import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { Upload } from 'src/components/upload';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ThreeDotsActions from 'src/components/three-dots-actions';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomizableTable from 'src/components/customizabaleTable';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
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
  const [attachments, setAttachments] = React.useState<(File | string)[]>([]);
  const [uploadFile] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });
  const handleGroupChange = (ev: any) => {
    setGroup(ev.target.value);
  };

  const handleUpload = async () => {
    const files = attachments.filter((file): file is File => file instanceof File);
    if (files.length === 0) return;

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('File', file);
          const response = await uploadFile(formData).unwrap();
          return response.data || '';
        })
      );
      setAttachments(uploaded.filter(Boolean));
      shikshaMitraToast.success({ message: 'Attachment uploaded successfully.' });
    } catch (error) {
      console.error('Message attachment upload failed', error);
      shikshaMitraToast.error({ message: 'Attachment upload failed.' });
    }
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

      <Grid container spacing={1} style={{ padding: 20 }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Message Editor</Typography>
          <Upload
            value={attachments}
            onDrop={(acceptedFiles) =>
              setAttachments((current) => [...current, ...acceptedFiles])
            }
            onRemove={(file) => setAttachments((current) => current.filter((item) => item !== file))}
            onRemoveAll={() => setAttachments([])}
            onUpload={handleUpload}
          />
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
