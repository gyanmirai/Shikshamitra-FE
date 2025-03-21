'use client';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { MuiColorInput } from 'mui-color-input';

import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  List,
  Grid,
  Button,
  ListItem,
  TextField,
  IconButton,
  Typography,
  ListItemText,
  DialogActions,
} from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

import type { Document, TSubjectTable } from '../subject';

interface SubjectFormProps {
  onSubmit: (values: TSubjectTable) => void;
  onClose: () => void;
  data: TSubjectTable | null;
  isEdit: boolean;
}

const SubjectForm = ({ onSubmit, onClose, data, isEdit }: SubjectFormProps) => {
  const [subjectColor, setSubjectColor] = useState('');
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));
  const [documents, setDocuments] = useState<Document[]>(data?.documents || []);
  const isPublished = data?.status === 'Publish';

  const validationSchema = Yup.object().shape({
    subjectCode: Yup.string().required('Subject Code is Required'),
    subjectName: Yup.string().required('Subject Name is required'),
    className: Yup.string().required('Class is required'),
    primaryTeacher: Yup.string().required('Primary teacher is required'),
    secondaryTeacher: Yup.array().of(Yup.string()).required('Assigned Teacher is required'), // Changed to array
    learningGoal: Yup.string().required('Learning Goal is required'),
    prerequisites: Yup.string().required('Prerequisites are required'),
    description: Yup.string().required('Description is required'),
    subjectColor: Yup.string().required('Subject Color is required'),
  });

  const formik = useFormik({
    initialValues: {
      subjectCode: data?.subjectCode || '',
      subjectName: data?.subjectName || '',
      scheduleDate: data?.scheduleDate || dayjs(),
      className: data?.className || '',
      primaryTeacher: data?.primaryTeacher || '',
      secondaryTeacher: data?.secondaryTeacher || [],
      learningGoal: data?.learningGoal || '',
      prerequisites: data?.prerequisites || '',
      description: data?.description || '',
      subjectColor: data?.subjectColor || '',
      status: data?.status || 'Unpublish',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
        documents,
      });
    },
  });

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const handleFileUpload = (files: File[]) => {
    const newDocs: Document[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '40vh' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <CustomSelect
                options={classData?.items || []}
                label="Class"
                isLoading={isLoading}
                value={formik.values.className}
                labelKey="name"
                valueKey="name"
                onChange={(val) => {
                  formik.setFieldValue('className', val);
                }}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                error={formik.touched.className && Boolean(formik.errors.className)}
                disabled={isPublished}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Subject Code"
                name="subjectCode"
                size="small"
                value={formik.values.subjectCode}
                onChange={formik.handleChange}
                disabled={isPublished}
                error={formik.touched.subjectCode && Boolean(formik.errors.subjectCode)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Subject Name"
                name="subjectName"
                size="small"
                disabled={isPublished}
                value={formik.values.subjectName}
                onChange={formik.handleChange}
                error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Primary Teacher"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                ]}
                name="primaryTeacher"
                value={formik.values.primaryTeacher}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                onChange={(val) => {
                  formik.setFieldValue('primaryTeacher', val);
                }}
                error={formik.touched.primaryTeacher}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Secondary Teacher"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                ]}
                name="secondaryTeacher"
                multiple
                value={formik.values.secondaryTeacher}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                onChange={(val) => {
                  formik.setFieldValue('secondaryTeacher', val);
                }}
                error={formik.touched.secondaryTeacher}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Schedule Date"
                value={formik.values.scheduleDate}
                onChange={(value) => {
                  formik.setFieldValue('scheduleDate', value);
                }}
                disabled={isPublished}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
                disablePast
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MuiColorInput
                placeholder="Subject Color"
                size="small"
                format="hex"
                value={formik.values.subjectColor}
                onChange={(e) => {
                  formik.setFieldValue('subjectColor', e);
                }}
                disabled={isPublished}
                sx={{
                  minWidth: 180,
                  width: '100%',
                  '& .MuiInputBase-root': {
                    fontSize: '0.875rem', // Smaller font size matching other inputs
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontSize: '0.875rem', // Smaller font size for placeholder
                  },
                }}
                error={formik.touched.subjectColor && Boolean(formik.errors.subjectColor)}
                helperText={formik.touched.subjectColor && formik.errors.subjectColor}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                disabled={isPublished}
                label="Learning Goals"
                name="learningGoal"
                onChange={formik.handleChange}
                value={formik.values.learningGoal}
                size="small"
                error={formik.touched.learningGoal && Boolean(formik.errors.learningGoal)}
                helperText={formik.touched.learningGoal && formik.errors.learningGoal}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                disabled={isPublished}
                label="Prerequisites or Resources"
                name="prerequisites"
                size="small"
                value={formik.values.prerequisites}
                onChange={formik.handleChange}
                error={formik.touched.prerequisites && Boolean(formik.errors.prerequisites)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                disabled={isPublished}
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12}>
              <UploadBox
                onDrop={handleFileUpload}
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
            {documents.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Uploaded Documents
                </Typography>
                <List>
                  {documents.map((doc, index) => (
                    <ListItem
                      key={doc.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveDocument(doc.id as unknown as string)}
                        >
                          <Iconify icon="mdi:delete" />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={doc.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsDraft(true);
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
                variant="contained"
                color="warning"
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  setIsDraft(false);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};

export default SubjectForm;
