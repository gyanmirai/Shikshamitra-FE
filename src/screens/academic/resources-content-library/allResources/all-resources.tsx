'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Card,
  List,
  Button,
  Switch,
  ListItem,
  MenuList,
  MenuItem,
  Typography,
  CardContent,
  CardActions,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import ResourceForm from './component/resourceFormPopup';

export interface TResource {
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
  // const [tableData, setTableData] = useState(dummyData);
  const [view, setView] = useState('list');
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const dialog = useBoolean();

  const handleCloseDialog = () => {
    dialog.onFalse();
    setSelectedResource(null);
  };

  const handleSubmit = (values: TResource) => {};

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
        sx={{ mb: 1 }}
        heading="All Resources"
        links={[
          { name: 'Academics' },
          { name: 'Resource Content Library' },
          { name: 'All Resources' },
        ]}
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
            { id: 'resourceName', label: 'Resource Name', minWidth: '180px', align: 'left' },
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
              minWidth: '180px',
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
          <CardActions sx={{ justifyContent: 'flex-end' }}>
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
