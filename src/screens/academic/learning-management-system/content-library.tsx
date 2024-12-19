import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Stack, Button, MenuList, MenuItem, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const ContentLibrary = (props: TabComponentType) => {
  const viewLearningMaterial = useBoolean();
  return (
    <Box>
      <CustomizableTable
        columns={[
          { id: 'resourceName', label: 'Resource Name' },
          { id: 'category', label: 'Category' },
          { id: 'fileType', label: 'File Type' },
          { id: 'uploadedBy', label: 'Uploaded By' },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover: pop }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        viewLearningMaterial.onTrue();
                      }}
                    >
                      <Iconify icon="mdi:eye" />
                      View
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={[
          {
            resourceName: 'Algebra Basics',
            category: 'Mathematics',
            fileType: 'PDF',
            uploadedBy: 'Mr. Smith',
          },
          {
            resourceName: 'Science Experiments',
            category: 'Science',
            fileType: 'Video',
            uploadedBy: 'Dr. Johnson',
          },
          {
            resourceName: 'Shakespeare Analysis',
            category: 'Literature',
            fileType: 'Document',
            uploadedBy: 'Ms. Williams',
          },
          {
            resourceName: 'Geometry Tutorials',
            category: 'Mathematics',
            fileType: 'Image',
            uploadedBy: 'Mr. Brown',
          },
        ]}
      />

      {/* <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Section Breakdown
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Chapter 1: Introduction to React
          </Typography>
          <Box
            sx={{
              position: 'relative',
              height: 20,
              borderRadius: 10,
              bgcolor: '#e0e0e0',
              overflow: 'hidden',
            }}
          >
            <LinearProgress
              variant="determinate"
              value={75}
              sx={{
                height: '100%',
                borderRadius: 10,
                backgroundColor: 'transparent',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 10,
                  backgroundColor: '#3498db',
                  transition: 'transform 0.4s ease-in-out',
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              75%
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Learn the basics of React and its core concepts.
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Chapter 2: State Management
          </Typography>
          <Box
            sx={{
              position: 'relative',
              height: 20,
              borderRadius: 10,
              bgcolor: '#e0e0e0',
              overflow: 'hidden',
            }}
          >
            <LinearProgress
              variant="determinate"
              value={50}
              sx={{
                height: '100%',
                borderRadius: 10,
                backgroundColor: 'transparent',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 10,
                  backgroundColor: '#2ecc71',
                  transition: 'transform 0.4s ease-in-out',
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              50%
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Explore different state management techniques in React.
          </Typography>
        </Box>
      </Box>

      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Content Cards
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid2 container spacing={3}>
        <Grid2 xs={12} sm={6}>
          <Card
            sx={{
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': { boxShadow: 6 },
              transition: 'box-shadow 0.3s',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <VideoLibrary />
              </Avatar>
              <Typography variant="h6">Introduction Video</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Type: Video
            </Typography>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{
                  '&:hover': { backgroundColor: 'secondary.dark' },
                }}
                onClick={dialog.onTrue}
              >
                Add Content
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Visibility
                </Typography>
                <Switch size="small" />
              </Box>
            </Box>
          </Card>
        </Grid2>
        <Grid2 xs={12} sm={6}>
          <Card
            sx={{
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '&:hover': { boxShadow: 6 },
              transition: 'box-shadow 0.3s',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <PictureAsPdf />
              </Avatar>
              <Typography variant="h6">Course Material</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Type: PDF
            </Typography>

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{
                  '&:hover': { backgroundColor: 'secondary.dark' },
                }}
                onClick={dialog.onTrue}
              >
                Add Content
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Visibility
                </Typography>
                <Switch size="small" />
              </Box>
            </Box>
          </Card>
        </Grid2>
      </Grid2>
      <CustomDialog title="Add Content" open={dialog.value} handleClose={dialog.onFalse}>
        <AddContent />
      </CustomDialog> */}
    </Box>
  );
};

export default ContentLibrary;

const AddContent = () => (
  <Box>
    {/* Content Type */}

    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
      <Stack spacing={2}>
        <CustomSelect
          options={[]}
          value=""
          onChange={() => {}}
          label="Select Content Type"
          formControlProps={{ fullWidth: true }}
        />

        <Upload />

        {/* Field Name */}
        <TextField label="Field name" variant="outlined" fullWidth margin="normal" size="small" />

        {/* Description */}
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          size="small"
        />

        {/* Set Availability */}

        <CustomSelect
          options={[]}
          value=""
          onChange={() => {}}
          label="availability"
          formControlProps={{ fullWidth: true }}
        />

        <DatePicker label="Date" slotProps={{ textField: { size: 'small' } }} />
      </Stack>
    </Scrollbar>

    <DialogActions>
      {/* Submit Button */}
      <Button variant="contained">Add Content</Button>
    </DialogActions>
  </Box>
);
