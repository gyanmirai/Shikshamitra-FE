import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Button, MenuItem, MenuList, TextField, DialogActions } from '@mui/material';

const CompletedAssessment = () => {
  // Modal control hook
  const modal = useBoolean();

  // State to track the selected row data when opening the dialog
  const [, setSelectedRow] = useState<any>(null);

  const formik = useFormik({
    initialValues: {
      studentName: '',
      feedback: '',
      discountPercentage: '',
      libraryFees: '',
    },
    onSubmit: (values: any) => {},
  });

  return (
    <>
      {/* Customizable Table */}
      <CustomizableTable
        tableId="completed-assessment-table"
        columns={[
          { id: 'assessmentName', label: 'Assessment Name' },
          { id: 'class', label: 'Class' },
          { id: 'subject', label: 'Subject' },
          { id: 'completedDate', label: 'Completed Date' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return (
                <Button
                  sx={{
                    backgroundColor: value === 'Feedback Given' ? 'lightgreen' : 'rgb(64, 58, 39,)',
                    color: value === 'Feedback Given' ? 'darkgreen' : '#FFD666',
                    border: 'none',
                    '&:hover': {
                      backgroundColor:
                        value === 'Feedback Given' ? 'lightgreen' : 'rgb(64, 58, 39,)',
                    },
                  }}
                  variant="contained"
                  onClick={() => {
                    setSelectedRow(row);
                    modal.onTrue();
                  }}
                >
                  {value}
                </Button>
              );
            },
          },
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
                          /* reschedule logic */
                        }}
                      >
                        Reschedule
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          /* approved logic */
                        }}
                      >
                        Approved
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          /* archive logic */
                        }}
                      >
                        Archive
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
            assessmentName: 'Fraction',
            class: '10th',
            subject: 'Maths',
            completedDate: '10-10-204',
            status: 'Feedback Given',
          },
          {
            assessmentName: 'Algebra',
            class: '10th',
            subject: 'Maths',
            completedDate: '15-10-204',
            status: 'Feedback Pending',
          },
        ]}
      />

      {/* Dialog */}
      <CustomDialog title="Feedback Form" open={modal.value} handleClose={modal.onFalse}>
        <Scrollbar>
          <Box px="15px">
            <form onSubmit={formik.handleSubmit}>
              <Box pt="10px" display="flex" flexDirection="column" gap={3}>
                <Box py="8px" display="flex" flexDirection="column" gap={3}>
                  <CustomSelect
                    label="Student"
                    options={[
                      { value: 'leo', label: 'leo' },
                      { value: 'jack', label: 'jack' },
                      { value: 'hiren', label: 'hiren' },
                    ]}
                    value={formik.values.classGrade}
                    onChange={(e) => formik.setFieldValue('classGrade', '10')}
                    formControlProps={{ sx: { minWidth: 195 } }}
                  />
                  <TextField
                    rows={5}
                    multiline
                    name="libraryFees"
                    label="Library Fees"
                    value={formik.values.libraryFees}
                    onChange={formik.handleChange}
                    size="small"
                    error={formik.touched.libraryFees && Boolean(formik.errors.libraryFees)}
                  />
                </Box>
              </Box>

              <DialogActions>
                {/* <Button variant="contained" onClick={modal.onFalse} size="small">
                  Preview
                </Button> */}
                <Button type="submit" variant="contained" size="small">
                  Send Feedback
                </Button>
              </DialogActions>
            </form>
          </Box>
        </Scrollbar>
      </CustomDialog>
    </>
  );
};

export default CompletedAssessment;
