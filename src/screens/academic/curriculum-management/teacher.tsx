import React, { useState } from 'react';

import { Edit } from '@mui/icons-material';
import { Box, MenuList, MenuItem, Typography, ListItemIcon, ListItemText } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const Teacher = () => {
  const [teacherData, setTeacherData] = useState<any>([
    {
      id: 1,
      subject: 'Mathematics',
      assignedTeacher: 'John Doe',
    },
    {
      id: 2,
      subject: 'Science',
      assignedTeacher: 'Jane Smith',
    },
    {
      id: 3,
      subject: 'English',
      assignedTeacher: 'Robert Johnson',
    },
    {
      id: 4,
      subject: 'History',
      assignedTeacher: 'Emily Brown',
    },
    {
      id: 5,
      subject: 'Physical Education',
      assignedTeacher: 'Michael Wilson',
    },
  ]);

  console.log('teacher data---------', teacherData);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleTeacherChange = (id: number, newTeacher: any) => {
    const updatedData = teacherData.map((row: any, index: number) =>
      row.id === id ? { ...row, assignedTeacher: newTeacher } : row
    );
    setTeacherData(updatedData);
    setEditingIndex(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography variant="h4">Subject-wise Teacher Assignment Table</Typography>

        <CustomSelect
          label="Class"
          name="class"
          options={[]}
          formControlProps={{ sx: { width: '200px' } }}
          value=""
          onChange={(value) => {}}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
        <CustomSelect
          label="Grade"
          name="grade"
          options={[]}
          formControlProps={{ sx: { width: '200px' } }}
          value=""
          onChange={(value) => {}}
        />
        <CustomSelect
          label="Subject"
          name="subject"
          options={[]}
          formControlProps={{ sx: { width: '200px' } }}
          value=""
          onChange={(value) => {}}
        />
      </Box>
      <CustomizableTable
        columns={[
          {
            id: 'id',
            label: 'Id',
          },
          {
            id: 'subject',
            label: 'Subject',
          },
          {
            id: 'assignedTeacher',
            label: 'Assigned Teacher',
            render(value, row) {
              return editingIndex === row.id ? (
                <CustomSelect
                  label="Assigned Teacher"
                  options={[
                    { value: 'abc', label: 'abc' },
                    { value: 'xyz', label: 'xyz' },
                    { value: 'mnc', label: 'mnc' },
                  ]}
                  value={row.assignedTeacher}
                  onChange={(newTeacher) => handleTeacherChange(row.id, newTeacher)}
                />
              ) : (
                row.assignedTeacher
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={() => (
                    <MenuList>
                      <MenuItem onClick={() => {}}>
                        <ListItemIcon>
                          <Edit />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setEditingIndex(row.id);
                        }}
                      >
                        <ListItemText>Reassign Teacher</ListItemText>
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={teacherData}
      />
    </Box>
  );
};

export default Teacher;
