import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Card,
  List,
  Grid,
  Button,
  Switch,
  ListItem,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  CardActions,
  ListItemText,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface TResource {
  id: number;
  resourceName: string;
  description: string;
  category: string;
  fileType?: string;
  uploadedBy?: string;
  dateUploaded: Dayjs | null;
  status: string;
}

const dummyData: TResource[] = [
  {
    id: 1,
    resourceName: 'Math Basics',
    category: 'Worksheet',
    description: 'desc',
    fileType: 'PDF',
    uploadedBy: 'John Doe',
    dateUploaded: dayjs('2024-10-28'),
    status: 'Publish',
  },
  {
    id: 2,
    resourceName: 'Science Experiment Video',
    category: 'Video',
    description: 'desc',
    fileType: 'MP4',
    uploadedBy: 'Jane Smith',
    dateUploaded: dayjs('2024-10-28'),
    status: 'Unpublish',
  },
  {
    id: 3,
    resourceName: 'History Presentation',
    category: 'Presentation',
    description: 'desc',
    fileType: 'PPT',
    uploadedBy: 'Michael Brown',
    dateUploaded: dayjs('2024-10-28'),
    status: 'Publish',
  },
  {
    id: 4,
    resourceName: 'Art Portfolio',
    category: 'Assignment',
    description: 'desc',
    fileType: 'PDF',
    uploadedBy: 'Emily White',
    dateUploaded: dayjs('2024-10-28'),
    status: 'Publish',
  },
  {
    id: 5,
    resourceName: 'Language Reference Guide',
    category: 'Guide',
    description: 'desc',
    fileType: 'DOC',
    uploadedBy: 'Chris Green',
    dateUploaded: dayjs('2024-10-28'),
    status: 'Unpublish',
  },
];

const AllResources = (props: TabComponentType) => {
  const [tableData, setTableData] = useState(dummyData);
  const isTableView = useBoolean(true);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const dialog = useBoolean();

  const handleCloseDialog = () => {
    dialog.onFalse();
    setSelectedResource(null);
  };

  const handleSubmit = (values: TResource) => {
    console.log('handle submit');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box display="flex" alignItems="center" mt={2}>
          <Typography variant="body2" sx={{ ml: 1 }}>
            Grid View
          </Typography>
          <Switch
            checked={isTableView.value}
            onChange={(e) => isTableView.onToggle()}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Table View
          </Typography>
        </Box>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            dialog.onTrue();
            // setIsEdit(false);
            // setSelectedSubject(null);
          }}
        >
          Add Resource
        </Button>
      </Box>

      {isTableView.value ? (
        <CustomizableTable
          columns={[
            { id: 'resourceName', label: 'Resource Name' },
            { id: 'category', label: 'Category' },
            { id: 'fileType', label: 'File Type' },
            { id: 'uploadedBy', label: 'Uploaded By' },
            {
              id: 'dateUploaded',
              label: 'Date Uploaded',
              render: (value, row) => (
                <Typography fontSize="12px" gutterBottom>
                  {dayjs(value).format('DD MMM YYYY')}
                </Typography>
              ),
            },
            {
              id: 'status',
              label: 'Publish',
              render: (value: string, row: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Switch size="small" checked={value === 'Publish'} onChange={() => {}} />
                </Box>
              ),
            },
            {
              id: 'action',
              label: 'Action',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    placement="right-top"
                    actions={() => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            setSelectedResource(row as any);
                            setIsEdit(true);
                            dialog.onTrue();
                          }}
                        >
                          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                          Edit
                        </MenuItem>
                        <MenuItem>
                          <Iconify icon="mdi:download" />

                          <ListItemText>Download</ListItemText>
                        </MenuItem>
                        <MenuItem>
                          <Iconify icon="mdi:share" />

                          <ListItemText>Share</ListItemText>
                        </MenuItem>
                        <MenuItem>
                          <Iconify icon="mdi:star" />

                          <ListItemText>Favorite</ListItemText>
                        </MenuItem>
                        <MenuItem>
                          <Iconify icon="mdi:eye" />

                          <ListItemText>Preview</ListItemText>
                        </MenuItem>
                      </MenuList>
                    )}
                  />
                );
              },
            },
          ]}
          data={dummyData}
        />
      ) : (
        <Card sx={{ maxWidth: '300px', width: '100%', p: 2, mt: 2 }}>
          <CardContent>
            <Typography variant="h6" component="h2">
              Resource Card
            </Typography>
            <List>
              {[
                'English Book',
                'Resource Name - XYZ',
                'Category - Assignment',
                'File Type - PDF',
              ].map((item: any) => (
                <ListItem key={item.label}>
                  <ListItemText primary={<Typography>• {item}</Typography>} />
                </ListItem>
              ))}
            </List>
          </CardContent>
          <CardActions>
            <Button variant="contained">Download</Button>
            <Button variant="contained" color="error">
              Share
            </Button>
          </CardActions>
        </Card>
      )}

      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Resource' : 'Add Resource'}
      >
        <ResourceForm
          onSubmit={handleSubmit}
          onClose={dialog.onFalse}
          data={selectedResource}
          isEdit={isEdit}
        />{' '}
      </CustomDialog>
    </Box>
  );
};

export default AllResources;

interface ResourceFormProps {
  onSubmit: (values: TResource) => void;
  onClose: () => void;
  data: TResource | null;
  isEdit: boolean;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ onSubmit, onClose, data, isEdit }) => {
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'draft'));
  const dialog = useBoolean();
  const formik = useFormik<TResource>({
    initialValues: {
      id: isEdit && data ? data.id : Date.now(),
      resourceName: isEdit && data ? data.resourceName : '',
      category: isEdit && data ? data.category : '',
      fileType: isEdit && data ? data.fileType : '',
      description: isEdit && data ? data.description : '',
      status: isEdit && data ? data.status : 'draft',
      uploadedBy: '',
      dateUploaded: isEdit && data ? dayjs(data.dateUploaded) : null,
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        status: isDraft ? 'Unpublish' : 'Publish',
        uploadedBy: 'abc',
        dateUploaded: isEdit ? dayjs(values.dateUploaded) : dayjs(), // Only update if not in edit mode
      };
      onSubmit(updatedValues);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '250px' }}>
          <Grid container spacing={2} marginTop={1}>
            <Grid item xs={12}>
              <TextField
                disabled={isEdit}
                label="Resource Title"
                size="small"
                name="resourceName"
                value={formik.values.resourceName}
                onChange={formik.handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                disabled={isEdit}
                label="Description"
                size="small"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomSelect
                label="Category"
                options={[
                  { value: 'Worksheet', label: 'Worksheet' },
                  { value: 'audio', label: 'Audio' },
                  { value: 'document', label: 'Document' },
                ]}
                value={formik.values.category}
                onChange={(val) => {
                  formik.setFieldValue('typeOfResource', val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            {/* <Grid item xs={12}>
              <CustomSelect
                label="File Type"
                options={[
                  { value: 'video', label: 'Video' },
                  { value: 'audio', label: 'Audio' },
                  { value: 'document', label: 'Document' },
                ]}
                value={formik.values.fileType}
                onChange={(val) => {
                  formik.setFieldValue('fileType', val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid> */}
            <Grid item xs={12}>
              <UploadBox
                onDrop={() => {}}
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
                    <Typography variant="body2">Drag Your Document</Typography>
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
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setIsDraft(true);
              formik.handleSubmit();
            }}
            color="warning"
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={() => {
              setIsDraft(false);
              formik.handleSubmit();
            }}
          >
            Save and Publish
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
