import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Button,
  Collapse,
  Checkbox,
  TextField,
  Typography,
  DialogContent,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { UploadBox } from 'src/components/upload/upload-box';
import CustomizableTable from 'src/components/customizabaleTable';

import CommunicationChannel from './communication-channel-component';

const SendCustomAlert = () => {
  // State for selected communication methods

  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<any>({
    email: false,
    sms: false,
    whatsapp: false,
  });

  const formik = useFormik({
    initialValues: {
      organization: '',
      class: '',
      division: '',
      category: '',
      template: '',
      role: '',
    },
    onSubmit: (values) => {
      console.log('Sending Notification:');
    },
  });
  useEffect(() => {
    const { organization, class: selectedClass, division } = formik.values;

    const filtered = allStudents.filter(
      (student) =>
        (!organization || student.organization === organization) &&
        (!selectedClass || student.class === selectedClass) &&
        (!division || student.division === division)
    );

    setFilteredStudents(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values]);
  // State for form fields related to each communication method
  const [formData, setFormData] = useState<any>({
    emailRecipients: '',
    ccRecipients: '',
    emailSubject: '',
    emailContent: '',
    phoneRecipients: '',
    smsContent: '',
    whatsappRecipients: '',
    whatsappMessage: '',
  });

  // Handle input change for text fields
  const handleInputChange = (event: any) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Handle checkbox toggle for communication channels
  const handleCheckboxChange = (method: any) => {
    setSelectedMethods((prev: any) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  const [whatsappMedia, setWhatsappMedia] = useState<any>(null);
  const [openBox, setOpenBox] = useState(false);

  const handleMediaUpload = (files: any) => {
    if (files.length > 0) {
      const file = files[0];

      // Validate file type (allow images, videos, and documents)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Allowed: PNG, JPG, MP4, PDF.');
        return;
      }

      setWhatsappMedia(file);
    }
  };

  const toggleStudentSelection = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((studentId) => studentId !== id) : [...prev, id]
    );
  };

  const [role, setRole] = useState('student');
  const [classFilter, setClassFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const allStudents = [
    {
      id: 1,
      name: 'Alice Johnson',
      class: 'Class 1',
      division: 'A',
      organization: 'Org 1',
      contactNumber: '9187654576',
      email: 'abc@gmail.com',
    },
    {
      id: 2,
      name: 'Bob Smith',
      class: 'Class 2',
      division: 'B',
      organization: 'Org 2',
      contactNumber: '9187654576',
      email: 'abc@gmail.com',
    },
    {
      id: 3,
      name: 'Charlie Brown',
      class: 'Class 1',
      division: 'A',
      organization: 'Org 1',
      contactNumber: '9187654576',
      email: 'abc@gmail.com',
    },
    {
      id: 4,
      name: 'David Williams',
      class: 'Class 3',
      division: 'C',
      organization: 'Org 3',
      contactNumber: '9187654576',
      email: 'abc@gmail.com',
    },
    {
      id: 5,
      name: 'Emma Davis',
      class: 'Class 2',
      division: 'B',
      organization: 'Org 2',
      contactNumber: '9187654576',
      email: 'abc@gmail.com',
    },
  ];

  const handleSendAlert = () => {
    console.log('Sending alert to:', selectedStudents, 'Message:', alertMessage);
  };
  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent>
        {/* Select Class */}
        <Grid container spacing={2}>
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Select Class"
                options={[
                  { label: 'Class 1', value: 'Class 1' },
                  { label: 'Class 2', value: 'Class 2' },
                  { label: 'Class 3', value: 'Class 3' },
                ]}
                value={formik.values.class}
                onChange={(val) => formik.setFieldValue('class', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Select Division"
                options={[
                  { label: 'A', value: 'A' },
                  { label: 'B', value: 'B' },
                  { label: 'C', value: 'C' },
                ]}
                value={formik.values.division}
                onChange={(val) => formik.setFieldValue('division', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Select Role"
                options={
                  formik.values.category
                    ? [
                        { label: 'Parent', value: 'parent' },
                        { label: 'Teacher', value: 'teacher' },
                      ]
                    : []
                }
                value={formik.values.template}
                onChange={(val) => formik.setFieldValue('template', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button type="button" variant="outlined" color="primary" size="small">
                Reset Filter
              </Button>
              <Button type="button" variant="outlined" color="primary" size="small">
                Apply Filter
              </Button>
            </Grid>
          </Grid>

          <Grid item xs={12} pb="80px">
            <CustomizableTable
              isFilter={false}
              isLoading={false}
              isSearch={false}
              tableId="send-custom-alert-table"
              data={filteredStudents}
              columns={[
                {
                  id: 'select',
                  label: '',
                  renderColumn() {
                    return (
                      <Checkbox
                        checked={
                          selectedStudents.length === filteredStudents.length &&
                          filteredStudents.length > 0
                        }
                        indeterminate={
                          selectedStudents.length > 0 &&
                          selectedStudents.length < filteredStudents.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(filteredStudents.map((student) => student.id));
                          } else {
                            setSelectedStudents([]); // Deselect all
                          }
                        }}
                      />
                    );
                  },

                  render: (_, row) => (
                    <Checkbox
                      checked={selectedStudents.includes(row.id)}
                      onChange={() => toggleStudentSelection(row.id)}
                    />
                  ),
                },
                { id: 'name', label: 'Student Name' },
                { id: 'contactNumber', label: 'Contact Number' },
                { id: 'email', label: 'Email' },
              ]}
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            width: openBox ? '1000px' : '300px', // Adjust width when open
            height: openBox ? '600px' : 'auto', // Adjust height when open
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: 3,
          }}
        >
          <Button
            endIcon={openBox ? <Iconify icon="fe:arrow-down" /> : <Iconify icon="fe:arrow-up" />}
            variant="outlined"
            color="primary"
            onClick={() => setOpenBox(!openBox)}
            sx={{ width: '100%', borderRadius: 1 }}
          >
            Communication
          </Button>
          <Collapse in={openBox}>
            <Box p={2}>
              {/* Use the reusable CommunicationChannel component */}
              <CommunicationChannel
                forCustomAlerts
                emailRecipents={['abc@gmail.com', 'xyz@gmail.com']}
                mobileRecipients={['91888878778', '9865787689']}
                handleInputChange={handleInputChange}
              />
            </Box>
          </Collapse>
        </Box>

        {/* Communication Method Specific Inputs */}
        <Grid container spacing={2} py="20px">
          {/* Email Fields */}
          {selectedMethods.email && (
            <>
              <Typography sx={{ pl: '20px', pt: '20px', fontSize: '17px' }}>
                Email Details
              </Typography>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Recipients"
                  name="emailRecipients"
                  value={formData.emailRecipients}
                  onChange={handleInputChange}
                  placeholder="user1@example.com, user2@example.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CC Recipients"
                  name="ccRecipients"
                  value={formData.ccRecipients}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Subject"
                  name="emailSubject"
                  value={formData.emailSubject}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Email Content"
                  name="emailContent"
                  value={formData.emailContent}
                  onChange={handleInputChange}
                />
              </Grid>
            </>
          )}

          {/* SMS Fields */}
          {selectedMethods.sms && (
            <>
              <Typography sx={{ pl: '20px', pt: '20px', fontSize: '17px' }}>Sms Details</Typography>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SMS Recipients"
                  name="phoneRecipients"
                  value={formData.phoneRecipients}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="SMS Message"
                  name="smsContent"
                  value={formData.smsContent}
                  onChange={handleInputChange}
                />
              </Grid>
            </>
          )}

          {/* WhatsApp Fields */}
          {selectedMethods.whatsapp && (
            <>
              <Typography sx={{ pl: '20px', pt: '20px', fontSize: '17px' }}>
                WhatsApp Details
              </Typography>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="WhatsApp Recipients"
                  name="whatsappRecipients"
                  value={formData.whatsappRecipients}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="WhatsApp Message"
                  name="whatsappMessage"
                  value={formData.whatsappMessage}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Attach Media (Optional)</Typography>
                <UploadBox
                  onDrop={(acceptedFiles) => handleMediaUpload(acceptedFiles)}
                  placeholder={
                    <Box
                      sx={{
                        gap: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.disabled',
                        flexDirection: 'column',
                      }}
                    >
                      <Iconify icon="eva:cloud-upload-fill" width={40} />
                      <Typography variant="body2">Upload Document</Typography>
                    </Box>
                  }
                  sx={{
                    py: 2.5,
                    width: '100%',
                    height: 'auto',
                    borderRadius: 1.5,
                  }}
                />
              </Grid>

              {/* Show Uploaded File Name */}
              {whatsappMedia && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Selected File: {whatsappMedia.name}
                  </Typography>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DialogContent>
    </form>
  );
};

export default SendCustomAlert;
