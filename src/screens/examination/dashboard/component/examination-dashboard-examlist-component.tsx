import { Label } from '@mui/icons-material'
import { Box, MenuItem, MenuList, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import React from 'react'
import CustomSelect from 'src/components/custom-select'
import CustomizableTable from 'src/components/customizabaleTable'
import ThreeDotsActions from 'src/components/three-dots-actions'
import { useBoolean } from 'src/hooks/use-boolean'

const ExaminationDashboardExamlistComponent = () => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();
  return (
    <Box>
      <Typography sx={{ pt: "20px", pb: "20px" }} >Exam List</Typography>
      <Box display="flex" flexDirection="row" gap={3} sx={{ pb: "8px", pt: "20px" }}>
        <CustomSelect
          label="Class"
          options={[]}
          value=""
          onChange={() => { }}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Subject"
          options={[]}
          value=""
          onChange={() => { }}
          formControlProps={{ sx: { minWidth: 120 } }}
        />

        <DatePicker
          label="To Date"
          format="DD-MM-YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="End Date"
          format="DD-MM-YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />

      </Box>
      <CustomizableTable
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'subject', label: 'Subject' },
          { id: 'examDate', label: 'Exam Date' },
          { id: 'examType', label: 'Exam Type' },
          { id: 'invigilator', label: 'Invigilator' },
          { id: 'status',  label: 'Status' },
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
                        {/* <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} /> */}
                        Reschedule
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          uploadModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                        Cancel
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          gradeScalingModal.onTrue();
                          popover.onClose();
                        }}
                      >
                        {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                        Mark as Completed
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
            class: '10th Grade',
            subject: 'Mathematics',
            examDate: '10-08-2024',
            examType: 'Oral',
            invigilator: 'B',
            status: 'Completed',
            action: 'View',
          },
          {
            class: '10th Grade',
            subject: 'Mathematics',
            examDate: '10-10-2024',
            examType: 'Written',
            invigilator: 'B',
            status: 'Completed',
            action: 'View',
          },

        ]}
      />
    </Box>
  )
}

export default ExaminationDashboardExamlistComponent