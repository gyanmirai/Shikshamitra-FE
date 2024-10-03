import React, { useState } from 'react';

import { RemoveRedEye } from '@mui/icons-material';
import {
  Box,
  Card,
  List,
  Grid,
  Button,
  Popover,
  Checkbox,
  ListItem,
  TextField,
  FormGroup,
  CardHeader,
  CardContent,
  ListItemText,
  FormControlLabel,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

const Categories = () => {
  const [anchorColumnEl, setColumnAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <Box>
      <Button
        // variant="outlined"
        size="small"
        startIcon={<RemoveRedEye />}
        onClick={(event) => setColumnAnchorEl(event.currentTarget)}
        variant="contained"
        sx={{ mb: 2 }}
      >
        Filter By Category
      </Button>
      <Popover
        open={Boolean(anchorColumnEl)}
        anchorEl={anchorColumnEl}
        onClose={() => setColumnAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 250 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search columns"
            //   value={columnSearchTerm}
            //   onChange={(e) => setColumnSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormGroup>
            {[{ label: 'Assignments' }, { label: 'Study Materials' }].map((column, ind) => (
              <FormControlLabel
                key={ind}
                control={
                  <Checkbox
                    checked
                    onChange={() => {
                      //   setColumnVisibility((prev) => ({
                      //     ...prev,
                      //     [column.id]: e.target.checked,
                      //   }));
                    }}
                  />
                }
                label={column.label}
              />
            ))}
          </FormGroup>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              onClick={() => {
                //   setColumnVisibility(
                //     Object.fromEntries(columns.map((column) => [column.id, true]))
                //   );
                //   setColumnSearchTerm('');
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Popover>
      <Grid container spacing={2}>
        <Grid item xs={6} md={4}>
          <Card
            sx={{ backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.16) }}
          >
            <CardHeader
              title="Assignments"
              avatar={
                <Box
                  color="primary.main"
                  component={Iconify}
                  className="iconify"
                  icon="mdi:clipboard-text-outline"
                />
              }
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Essay Writing"
                    secondary="Write a 1000-word essay on a given topic"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Math Problem Set"
                    secondary="Complete 20 algebra problems"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Research Project"
                    secondary="Conduct research and present findings on a chosen subject"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card
            sx={{ backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.16) }}
          >
            <CardHeader
              title="Study Materials"
              avatar={
                <Box
                  color="warning.main"
                  component={Iconify}
                  className="iconify"
                  icon="mdi:book-open-variant"
                />
              }
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Textbooks"
                    secondary="Comprehensive course textbooks for various subjects"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Lecture Notes"
                    secondary="Detailed notes from class lectures"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Practice Exams"
                    secondary="Sample tests to prepare for upcoming exams"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card sx={{ backgroundColor: (theme) => varAlpha(theme.palette.info.mainChannel, 0.16) }}>
            <CardHeader
              title="Quizzes"
              avatar={
                <Box
                  color="info.main"
                  component={Iconify}
                  className="iconify"
                  icon="mdi:help-circle-outline"
                />
              }
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Multiple Choice Quiz"
                    secondary="Test your knowledge with 20 multiple choice questions"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="True/False Quiz"
                    secondary="Evaluate your understanding with 15 true or false statements"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Short Answer Quiz"
                    secondary="Demonstrate your comprehension with 10 short answer questions"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>{' '}
    </Box>
  );
};

export default Categories;
