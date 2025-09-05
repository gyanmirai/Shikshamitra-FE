import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { UploadBox } from 'src/components/upload/upload-box';
import CustomizableTable from 'src/components/customizabaleTable';
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

import { allStudents } from '../notification-data';
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

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent>
        {/* Select Class */}
        <Grid container spacing={2}>
          {/* Filter Section */}
          <Grid container spacing={2} mt={2}>
            <Grid size={{ xs: 12, md: 4 }}>
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

            <Grid size={{ xs: 12, md: 4 }}>
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

            <Grid size={{ xs: 12, md: 4 }}>
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

            <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                startIcon={<Iconify icon={GlobalIcons.resetFilter} />}
                type="button"
                variant="outlined"
              >
                Reset Filter
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.applyFilter} />}
                type="button"
                variant="outlined"
              >
                Apply Filter
              </Button>
            </Grid>
          </Grid>

          {/* Table Section */}
          <Grid size={{ xs: 12 }} pb="80px">
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
                            setSelectedStudents(filteredStudents.map((s) => s.id));
                          } else {
                            setSelectedStudents([]);
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

          {/* Fixed Communication Box */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              width: openBox ? '1000px' : '300px',
              height: openBox ? '600px' : 'auto',
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
                <CommunicationChannel
                  forCustomAlerts
                  emailRecipents={['abc@gmail.com', 'xyz@gmail.com']}
                  mobileRecipients={['91888878778', '9865787689']}
                  handleInputChange={handleInputChange}
                />
              </Box>
            </Collapse>
          </Box>

          {/* Communication Method Inputs */}
          <Grid container spacing={2} py="20px">
            {/* Email */}
            {selectedMethods.email && (
              <>
                <Typography sx={{ pl: 2, pt: 2, fontSize: '17px' }}>Email Details</Typography>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email Recipients"
                    name="emailRecipients"
                    value={formData.emailRecipients}
                    onChange={handleInputChange}
                    placeholder="user1@example.com, user2@example.com"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="CC Recipients"
                    name="ccRecipients"
                    value={formData.ccRecipients}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email Subject"
                    name="emailSubject"
                    value={formData.emailSubject}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
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

            {/* SMS */}
            {selectedMethods.sms && (
              <>
                <Typography sx={{ pl: 2, pt: 2, fontSize: '17px' }}>SMS Details</Typography>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="SMS Recipients"
                    name="phoneRecipients"
                    value={formData.phoneRecipients}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
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

            {/* WhatsApp */}
            {selectedMethods.whatsapp && (
              <>
                <Typography sx={{ pl: 2, pt: 2, fontSize: '17px' }}>WhatsApp Details</Typography>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="WhatsApp Recipients"
                    name="whatsappRecipients"
                    value={formData.whatsappRecipients}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
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
                <Grid size={{ xs: 12 }}>
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
                    sx={{ py: 2.5, width: '100%', height: 'auto', borderRadius: 1.5 }}
                  />
                </Grid>

                {whatsappMedia && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="textSecondary">
                      Selected File: {whatsappMedia.name}
                    </Typography>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </form>
  );
};

export default SendCustomAlert;
