'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState, useCallback } from 'react';

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
  ToggleButton,
  DialogActions,
  ToggleButtonGroup,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface TResource {
  id: number;
  resourceName: string;
  description: string;
  category: string;
  fileType?: string;
  favourite?: boolean;
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
    favourite: true,
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
    favourite: false,
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
    favourite: true,
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
    favourite: false,
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
    favourite: true,
    uploadedBy: 'Chris Green',
    dateUploaded: dayjs('2024-10-28'),
    status: 'Unpublish',
  },
];

const AllResources = (props: TabComponentType) => {
  const [tableData, setTableData] = useState(dummyData);
  const [view, setView] = useState('list');
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

  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
      if (newView !== null) {
        setView(newView);
      }
    },
    []
  );

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem>
            <Iconify icon="mdi:download" />
            <ListItemText>Download</ListItemText>
          </MenuItem>
          <MenuItem>
            <Iconify icon="mdi:share" />
            <ListItemText>Share</ListItemText>
          </MenuItem>
          <MenuItem>
            {row.favourite === false ? (
              <>
                <Iconify icon="mdi:star" />
                <ListItemText>Add in Favourite</ListItemText>
              </>
            ) : (
              <>
                <Iconify icon="mdi:star" />
                <ListItemText>Remove from Favourite</ListItemText>
              </>
            )}
          </MenuItem>
        </MenuList>
      </>
    ),
    []
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="All Resources"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Resource Content Library' },
          { name: 'All Resources' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            startIcon={<Add />}
            variant="contained"
            size="small"
            onClick={() => {
              dialog.onTrue();
              // setIsEdit(false);
              // setSelectedSubject(null);
            }}
          >
            Resource
          </Button>
        }
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <ToggleButtonGroup
          size="small"
          value={view}
          exclusive
          onChange={handleChangeView}
          sx={{
            '& .Mui-selected': {
              backgroundColor: 'black',
              color: 'white',
              '&:hover': {
                backgroundColor: 'black',
              },
            },
          }}
        >
          <ToggleButton value="grid">
            <Iconify icon="mdi:view-grid" />
          </ToggleButton>
          <ToggleButton value="list">
            <Iconify icon="lucide:layout-list" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'list' ? (
        <CustomizableTable
          tableId="all-resources-table"
          columns={[
            { id: 'resourceName', label: 'Resource Name', minWidth: '150px', align: 'left' },
            { id: 'category', label: 'Category', minWidth: '130px', align: 'left' },
            { id: 'fileType', label: 'File Type', minWidth: '150px', align: 'left' },
            { id: 'uploadedBy', label: 'Uploaded By', minWidth: '150px', align: 'left' },
            {
              id: 'favourite',
              label: 'Favourite',
              render(value, row) {
                return value === true ? (
                  <Iconify icon="mdi:star" sx={{ ml: 2 }} />
                ) : (
                  <Iconify icon="mdi:star-outline" sx={{ ml: 2 }} />
                );
              },
            },
            {
              id: 'dateUploaded',
              label: 'Date Uploaded',
              minWidth: '150px',
              align: 'left',
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
              id: 'actions',
              label: 'Actions',
              isSort: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row })}
                    placement="right-top"
                    showEditIcon
                    showViewIcon
                    handleViewClick={() => {}}
                    handleEditClick={() => {
                      setSelectedResource(row as any);
                      setIsEdit(true);
                      dialog.onTrue();
                    }}
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
