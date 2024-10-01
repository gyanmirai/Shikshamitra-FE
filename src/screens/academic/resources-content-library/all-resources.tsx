import React from 'react';

import { Search } from '@mui/icons-material';
import {
  Box,
  Card,
  List,
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
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const AllResources = () => {
  const isTableView = useBoolean(true);

  const dummyData = [
    {
      resourceName: 'Math Textbook',
      category: 'Mathematics',
      fileType: 'PDF',
      uploadedBy: 'John Doe',
      dateUploaded: '2023-05-15',
      action: 'View',
    },
    {
      resourceName: 'Chemistry Lab Guide',
      category: 'Science',
      fileType: 'DOCX',
      uploadedBy: 'Jane Smith',
      dateUploaded: '2023-05-14',
      action: 'Download',
    },
    {
      resourceName: 'History Timeline',
      category: 'Social Studies',
      fileType: 'PNG',
      uploadedBy: 'Mike Johnson',
      dateUploaded: '2023-05-13',
      action: 'Share',
    },
    {
      resourceName: 'English Literature Notes',
      category: 'Language Arts',
      fileType: 'TXT',
      uploadedBy: 'Emily Brown',
      dateUploaded: '2023-05-12',
      action: 'Edit',
    },
    {
      resourceName: 'Physics Formulas',
      category: 'Science',
      fileType: 'XLSX',
      uploadedBy: 'David Wilson',
      dateUploaded: '2023-05-11',
      action: 'Delete',
    },
  ];

  return (
    <Box>
      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search resources"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: '350px', width: '100%' }}
        />
        <CustomSelect
          options={[
            { value: 'file_type', label: 'File type' },
            { value: 'category', label: 'Category' },
            { value: 'uploader', label: 'Uploader' },
            { value: 'date', label: 'Date' },
            { value: 'shared_status', label: 'Shared status' },
          ]}
          label="Filter"
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
        />
      </Box>

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

      {isTableView.value ? (
        <CustomizableTable
          columns={[
            { id: 'resourceName', label: 'Resource Name' },
            { id: 'category', label: 'Category' },
            { id: 'fileType', label: 'File Type' },
            { id: 'uploadedBy', label: 'Uploaded By' },
            { id: 'dateUploaded', label: 'Date Uploaded' },
            {
              id: 'action',
              label: 'Action',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    placement="right-top"
                    actions={() => (
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
    </Box>
  );
};

export default AllResources;
