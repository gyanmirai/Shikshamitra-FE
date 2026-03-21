'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import courseProgressTableData from 'src/json/academic/syllabus/employee-course-data.json';
import CourseProgressComponent from 'src/screens/class-management/course-progress/courseProgress';

const CourseProgress = () => {
  const [courses] = useState<any[]>(courseProgressTableData);
  // State to store the selected course details
  // const [, setSelectedCourse] = useState<ICourse | null>(null);
  // Dialog state for updating progress

  // Handler for when a course card is selected
  // const handleCardDetails = (course: ICourse) => {
  //   setSelectedCourse(course);
  // };
  // Get isChanges state from Redux store to track if there are unsaved changes
  useSelector((state: RootState) => state.confirmPopup);
  // Get dispatch function to dispatch Redux actions

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // Query hook to fetch class data from the API
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes, setDivision]);

  return (
    <Box>
      {/* Class and Division selection filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClasses(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
      </Box>
      <CourseProgressComponent courseData={courses} />
    </Box>
  );
};

export default CourseProgress;

// const UpdateProgress: React.FC<IUpdateProgressProps> = ({ onClose }: IUpdateProgressProps) => {
//   const formik = useFormik({
//     initialValues: {
//       completePercentage: 0, // Adjusted field name to match the input ID
//       description: '',
//     },
//     validationSchema: Yup.object({
//       completePercentage: Yup.number()
//         .min(0, 'Percentage cannot be negative')
//         .max(100, 'Percentage cannot exceed 100')
//         .required('Complete Percentage is required'),
//     }),
//     onSubmit: (values) => {
//       // Add submission logic here
//     },
//   });

//   return (
//     <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
//       <Box component="form" flexDirection="column" onSubmit={formik.handleSubmit} p={2} gap={3}>
//         <ShakingTextField
//           error={!!(formik.touched.completePercentage && formik.errors.completePercentage) || false}
//         >
//           <ComponentBlock>
//             <Slider
//               defaultValue={20}
//               onChange={(event, value) => {
//                 formik.setFieldValue('completePercentage', value);
//               }}
//               getAriaValueText={(value) => `${value}%`}
//               step={1}
//               valueLabelDisplay="auto"
//               marks={marks}
//               sx={{ [`& .${sliderClasses.mark}[data-index="3"]`]: { display: 'none' } }}
//             />
//           </ComponentBlock>
//         </ShakingTextField>

//         <TextField
//           fullWidth
//           multiline
//           rows={4}
//           name="description"
//           label="Description"
//           placeholder="Enter description"
//           value={formik.values.description}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           error={!!(formik.touched.description && formik.errors.description)}
//           helperText={formik.touched.description && formik.errors.description}
//         />
//       </Box>
//       <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
//         <CancelButton
//           onClick={() => {
//             onClose(null, false);
//           }}
//         />
//         <SubmitButton onClick={() => {}} />
//       </DialogActions>
//     </BackPopUpChecked>
//   );
// };
