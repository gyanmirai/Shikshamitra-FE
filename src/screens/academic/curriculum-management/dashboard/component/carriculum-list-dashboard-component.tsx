import { Box, MenuItem, MenuList, Typography } from '@mui/material'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import React from 'react'
import CustomSelect from 'src/components/custom-select'
import CustomizableTable from 'src/components/customizabaleTable'
import ThreeDotsActions from 'src/components/three-dots-actions'
import { useBoolean } from 'src/hooks/use-boolean'

const CarriculumListDashboardComponent = () => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();
  return (
    <Box >
     <Typography sx={{pb:"20px", pt:"20px"}}>Carriculum OverView</Typography>
     <Grid2  display="flex" flexDirection="row" gap={2}>
     <Grid2 lg={4}>
     <CustomSelect
              label="Subject"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
     </Grid2>
     <Grid2 lg={4}>
     <CustomSelect
              label="Grade level"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
     </Grid2>
     <Grid2 lg={4}>
     <CustomSelect
              label="Status"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
     </Grid2>

     </Grid2>
     
     <CustomizableTable

          columns={[
            { id: 'curriculumname', label: 'Curriculum Name' },
            { id: 'gradelevel', label: 'Grade Level' },
            { id: 'subject', label: 'Subjects' },
            { id: 'lastupdated', label: 'Last Updated' },
            { id: 'status', label: 'Status' },
            {
              id: 'action',
              label: 'Action',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={({ popover }: any) => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            modal.onTrue();
                            popover.onClose();
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            uploadModal.onTrue();
                            popover.onClose();
                          }}
                        >
                         Duplicate
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            gradeScalingModal.onTrue();
                            popover.onClose();
                          }}
                        >
                         Archived
                        </MenuItem>
                      </MenuList>
                    )}
                  />
                );
              },
            },
          ]}
          data={[
            {
              curriculumname: 'curriculum1',
              gradelevel: 'Numbers',
              subject: 'Plants',
              lastupdated: 'Alphabets',
              status: 'Archived',
            },
            {
              curriculumname: 'curriculum2',
             
              gradelevel: 'Numbers',
              subject: 'Plants',
              lastupdated: 'Alphabets',
              status: 'Draft',
            },
            {
              curriculumname: 'curriculum3',
              
              gradelevel: 'Numbers',
              subject: 'Plants',
              lastupdated: 'Alphabets',
              status: 'Pending',
            },
            {
              curriculumname: 'curriculum4',
             
              gradelevel: 'Numbers',
              subject: 'Plants',
              lastupdated: 'Alphabets',
              status: 'Active',
            },
            
            
          ]}
        />

    </Box>
  )
}

export default CarriculumListDashboardComponent