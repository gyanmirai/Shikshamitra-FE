'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState, useEffect } from 'react';

import { Box } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

const AssignTeacher = () => {
  // Dialog state for assign teacher modal
  const assignTeacherDialog = useBoolean();

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // State for selected class
  const [classes, setClasses] = useState('');

  // State for selected division
  const [division, setDivision] = useState('');

  // State for available division options based on selected class
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  // State to track selected students for notifications
  const [selectedStudents, setSelectedStudents] = useState<any>([]);

  // Dialog state for sending instant notifications
  const sendInstantNotificationDialogValue = useBoolean(); // State to track if in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // Update division options and selected division when class data or selected class changes
  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        // If a class is selected, find the corresponding class data
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        // Set division options based on selected class
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division as default if divisions exist
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        // If no class is selected, use the first class as default
        const firstClass = classData.items[0];
        setClasses(firstClass.id);
        // Set division options based on first class
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division as default if divisions exist
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes]);

  // Mock data for table display
  const [tableData, setTableData] = useState([
    {
      className: '1',
      division: 'A',
      classTeacher: '',
    },
    {
      className: '1',
      division: 'B',
      classTeacher: '',
    },
    {
      className: '3',
      division: 'C',
      classTeacher: '',
    },
    {
      className: '4',
      division: 'D',
      classTeacher: '',
    },
  ]);

  // Handler function to show instant notification dialog when triggered
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Assign Class Teacher"
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Assign Class Teacher', href: 'academic/assignTeacher' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomSelect
        label="Select Organization"
        options={[
          { value: 'Pre Primary', label: 'Pre Primary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'Higher Secondary', label: 'Higher Secondary' },
        ]}
        value=""
        onChange={(val) => {
          // formik.setFieldValue('organization', val);
        }}
        formControlProps={{ sx: { maxWidth: '460px', width: '100%' } }}
      />

      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="assignTeacherTable"
        searchFieldProps={{
          placeholder: 'Search by Class, Division, Assigned Teacher...',
          label: 'Search by Class, Division, Assigned Teacher...',
          sx: {
            maxWidth: '450px',
            width: '100%',
          },
        }}
        noDataText={<>No Division Data Found Search By Organization and Class</>}
        columns={[
          // {
          //   id: 'checkBox',
          //   align: 'left',
          //   minWidth: '60px',
          //   isSort: false,
          //   isFilter: false,
          //   label: '',
          //   renderColumn() {
          //     return (
          //       <Checkbox
          //         checked={!!tableData?.length && selectedStudents?.length === tableData?.length}
          //         onChange={(e) => {
          //           if (e.target.checked) {
          //             setSelectedStudents(tableData || []);
          //           } else {
          //             setSelectedStudents([]);
          //           }
          //         }}
          //       />
          //     );
          //   },
          //   render(value, row) {
          //     return (
          //       <Checkbox
          //         checked={!!selectedStudents.some((i: any) => i.id === row.id)}
          //         onChange={(e) => {
          //           if (e.target.checked) {
          //             setSelectedStudents([...selectedStudents, row]);
          //           } else {
          //             setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
          //           }
          //         }}
          //       />
          //     );
          //   },
          // },
          {
            id: 'className',
            label: 'Class',
          },
          {
            id: 'division',
            label: 'Division',
          },
          {
            id: 'classTeacher',
            label: 'Class Teacher',
            render(value, row) {
              return (
                <CustomSelect
                  label="Class Teacher"
                  options={[
                    { value: 'ABC', label: 'ABC' },
                    { value: 'XYZ', label: 'XYZ' },
                    { value: 'PQR', label: 'PQR' },
                  ]}
                  value=""
                  onChange={(val) => {
                    // formik.setFieldValue('organization', val);
                  }}
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                />
              );
            },
          },
        ]}
        data={tableData}
      />

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
    </Box>
  );
};

export default AssignTeacher;

// interface TeacherData {
//   teacherName: string;
// }

// interface AssignTeacherFormProps {
//   onSubmit: (values: any) => void;
//   onClose: () => void;
//   data: TeacherData | null;
//   isEdit: boolean;
// }

// const AssignTeacherForm: React.FC<AssignTeacherFormProps> = ({
//   onSubmit,
//   onClose,
//   data,
//   isEdit,
// }) => {
//   const validationSchema = Yup.object().shape({
//     teacherName: Yup.string().required('Teacher Name is Required'),
//   });

//   const formik = useFormik({
//     initialValues: {
//       teacherName: data?.teacherName || '',
//     },
//     validationSchema,
//     enableReinitialize: true,
//     onSubmit: (values) => {
//       onSubmit(values);
//     },
//   });
//   return (
//     <Box display="flex" flexDirection="column" gap={1}>
//       <form onSubmit={formik.handleSubmit}>
//         <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
//           <Grid container spacing={1}>
//             <Grid item xs={12}>
//               <ShakingTextField
//                 error={!!(formik.touched.teacherName && formik.errors.teacherName) || false}
//               >
//                 <CustomSelect
//                   label="Teacher Name"
//                   options={[
//                     { value: 'ABC', label: 'ABC' },
//                     { value: 'XYZ', label: 'XYZ' },
//                     { value: 'PQR', label: 'PQR' },
//                   ]}
//                   onChange={(val) => {
//                     formik.setFieldValue('teacherName', val);
//                   }}
//                   value={formik.values.teacherName}
//                   formControlProps={{
//                     sx: { width: '100%' },
//                   }}
//                 />
//               </ShakingTextField>
//             </Grid>
//           </Grid>
//         </Scrollbar>
//         <DialogActions sx={{ px: 0 }}>
//           <Button onClick={onClose}>Cancel</Button>
//           <Button type="submit" variant="contained">
//             {isEdit ? 'Update' : 'Assign'}
//           </Button>
//         </DialogActions>
//       </form>
//     </Box>
//   );
// };
