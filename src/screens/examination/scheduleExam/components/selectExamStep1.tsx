import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Grid, TextField, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { cardStyle } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';

import ExamTypeForm from '../../settings/examAssessmentTypeSetting.tsx/examTypeSetting/examTypeForm';

import type { IRoomDetails, IExamFormValues, IDivisionRoomDetail } from '../type';

const subjectOptions = [
  // Core subjects
  { subjectName: 'Mathematics', subjectCode: 'MATH', subjectColor: '#DEB887', type: 'Core' },
  { subjectName: 'Science', subjectCode: 'SCI', subjectColor: '#00CED1', type: 'Core' },
  {
    subjectName: 'Social Science',
    subjectCode: 'SSCI',
    subjectColor: '#B22222',
    type: 'Core',
  },
  { subjectName: 'English', subjectCode: 'ENG', subjectColor: '#4682B4', type: 'Core' },
  { subjectName: 'Gujarati', subjectCode: 'GUJ', subjectColor: '#3CB371', type: 'Core' },

  // Elective subjects (group name included in subjectName)
  {
    subjectName: 'Computer (Tech & Fitness Group)',
    subjectCode: 'COMP',
    subjectColor: '#4169E1',
    type: 'Elective',
  },
  {
    subjectName: 'Physical Training (Tech & Fitness Group)',
    subjectCode: 'PHYS',
    subjectColor: '#FF69B4',
    type: 'Elective',
  },
  {
    subjectName: 'Sanskrit (Language Enrichment Group)',
    subjectCode: 'SANS',
    subjectColor: '#DA70D6',
    type: 'Elective',
  },
  {
    subjectName: 'Hindi (Language Enrichment Group)',
    subjectCode: 'HIND',
    subjectColor: '#FF4500',
    type: 'Elective',
  },
];

const SelectExam = (props: FormikProps<IExamFormValues>) => {
  // Dialog state to control exam type creation modal visibility
  const examTypeDialog = useBoolean();

  // Formik form instance passed down as props
  const formik = props;
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    // setClasses(allClasses[0]?.id || '');
  }, [medium]);

  return (
    <Grid container>
      <Grid size={{ xs: 12 }}>
        <SectionCard
          title="Schedule & Deadlines"
          paperProps={{ sx: cardStyle }}
          headerContent={
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Set publish and due dates for each division
            </Typography>
          }
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={formik.touched.examType && Boolean(formik.errors.examType)}>
              <PaginatedSearchSelect
                label="Exam Type *"
                fetchOptions={async (query) => {
                  const items = [
                    { value: 'Mid', label: 'Mid' },
                    { value: 'Practical', label: 'Practical' },
                    { value: 'Final', label: 'Final' },
                  ];
                  const filtered = items.filter((item) =>
                    item.label.toLowerCase().includes(query.toLowerCase())
                  );
                  return {
                    data: filtered.map((item) => ({
                      label: item.label,
                      id: item.value,
                    })),
                    hasMore: false,
                  };
                }}
                value={
                  formik.values.examType
                    ? {
                        label:
                          [
                            { value: 'Mid', label: 'Mid' },
                            { value: 'Practical', label: 'Practical' },
                            { value: 'Final', label: 'Final' },
                          ].find((x) => x.value === formik.values.examType)?.label || '',
                        id: formik.values.examType,
                      }
                    : null
                }
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                getOptionLabel={(option: any) => option?.label || ''}
                renderOption={(prop, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.label}
                  </li>
                )}
                minChars={0}
                onChange={(_, value: any) => {
                  formik.setFieldValue('examType', value?.id || '');
                  formik.setFieldTouched(`examType`, false);
                }}
                sx={{ width: '100%' }}
                size="small"
                error={formik.touched.examType && Boolean(formik.errors.examType)}
                helperText={
                  formik.touched.examType && typeof formik.errors.examType === 'string'
                    ? formik.errors.examType
                    : undefined
                }
              />
            </ShakingTextField>

            <CustomDialog
              title="Create Exam Type"
              open={examTypeDialog.value}
              handleClose={examTypeDialog.onFalse}
            >
              <ExamTypeForm
                onClose={examTypeDialog.onFalse}
                data={null}
                onSubmit={() => {}}
                isEdit={false}
              />
            </CustomDialog>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
              <PaginatedSearchSelect
                label="Class *"
                fetchOptions={async (query) => {
                  const items = allClass || [];
                  const filtered = items.filter((item: any) =>
                    item?.name?.toLowerCase().includes(query.toLowerCase())
                  );
                  return {
                    data: filtered.map((item: any) => ({
                      label: item.name,
                      id: item.id,
                    })),
                    hasMore: false,
                  };
                }}
                value={
                  formik.values.className
                    ? {
                        label:
                          allClass.find((c: any) => c.id === formik.values.className)?.name || '',
                        id: formik.values.className,
                      }
                    : null
                }
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                getOptionLabel={(option: any) => option?.label || ''}
                renderOption={(prop, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.label}
                  </li>
                )}
                minChars={0}
                onChange={(_, value: any) => {
                  formik.setFieldValue('className', value?.id || '');
                  formik.setFieldTouched(`className`, false);
                }}
                sx={{ width: '100%' }}
                size="small"
                error={!!(formik.touched.className && formik.errors.className)}
                helperText={
                  formik.touched.className && typeof formik.errors.className === 'string'
                    ? formik.errors.className
                    : undefined
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
              <PaginatedSearchSelect
                label="Division *"
                multiple
                disabled={!formik.values.className}
                fetchOptions={async (query) => {
                  const items = [
                    { id: 'all', name: 'All' },
                    ...(allClass?.find((i: Standards) => i.id === formik.values.className)
                      ?.divisions || []),
                  ];
                  const filtered = items.filter((item: any) =>
                    item?.name?.toLowerCase().includes(query.toLowerCase())
                  );
                  return {
                    data: filtered.map((item: any) => ({
                      label: item.name,
                      id: item.id,
                    })),
                    hasMore: false,
                  };
                }}
                value={
                  formik.values.divisions
                    ? formik.values.divisions.map((d: any) => {
                        const divisionOptions = [
                          { id: 'all', name: 'All' },
                          ...(allClass?.find((i: Standards) => i.id === formik.values.className)
                            ?.divisions || []),
                        ];
                        const divLabel =
                          divisionOptions.find((opt: any) => opt.id === d)?.name || d;
                        return { label: divLabel, id: d };
                      })
                    : []
                }
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                getOptionLabel={(option: any) => option?.label || ''}
                renderOption={(prop, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.label}
                  </li>
                )}
                minChars={0}
                onChange={(_, val: any) => {
                  const value = (val as any[]).map((v) => v.id);
                  const divisionOptions =
                    allClass?.find((i: Standards) => i.id === formik.values.className)?.divisions ||
                    [];
                  const allDivisionIds = divisionOptions.map((d) => d.id);
                  const isAllClicked = value.includes('all');
                  const wasAllPreviouslySelected = formik.values.divisions.includes('all');

                  if (isAllClicked && !wasAllPreviouslySelected) {
                    formik.setFieldValue('divisions', ['all', ...allDivisionIds]);
                  } else if (!isAllClicked && wasAllPreviouslySelected) {
                    formik.setFieldValue('divisions', []);
                  } else if (isAllClicked && wasAllPreviouslySelected) {
                    const selectedWithoutAll = value.filter((id) => id !== 'all');
                    formik.setFieldValue(
                      'divisions',
                      selectedWithoutAll.length === allDivisionIds.length
                        ? ['all', ...allDivisionIds]
                        : selectedWithoutAll
                    );
                  } else {
                    const selectedWithoutAll = value.filter((id) => id !== 'all');
                    formik.setFieldValue(
                      'divisions',
                      selectedWithoutAll.length === allDivisionIds.length
                        ? ['all', ...allDivisionIds]
                        : selectedWithoutAll
                    );
                  }

                  formik.setFieldTouched(`divisions`, false);

                  // Update room details
                  const updatedRoomDetails = { ...(formik.values.roomDetails || {}) };
                  formik.values.subjects.forEach((subject) => {
                    const { subjectName } = subject;
                    const divisionsObj = value
                      .filter((code) => code !== 'all')
                      .reduce(
                        (acc, divisionId: string) => {
                          acc[divisionId] = updatedRoomDetails?.[subjectName]?.divisions?.[
                            divisionId
                          ] ?? {
                            roomIds: [],
                            capacity: 0,
                          };
                          return acc;
                        },
                        {} as Record<string, IDivisionRoomDetail>
                      );
                    updatedRoomDetails[subjectName] = {
                      ...updatedRoomDetails[subjectName],
                      divisions: divisionsObj,
                      examDate: subject.examDate || null,
                    };
                  });
                  formik.setFieldValue('roomDetails', updatedRoomDetails);
                }}
                sx={{ width: '100%' }}
                size="small"
                error={!!(formik.touched.divisions && formik.errors.divisions)}
                helperText={
                  formik.touched.divisions
                    ? Array.isArray(formik.errors.divisions)
                      ? formik.errors.divisions.join(', ')
                      : formik.errors.divisions
                    : undefined
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={!!(formik.touched.selectedSubjects && formik.errors.selectedSubjects)}
            >
              <PaginatedSearchSelect
                label="Subjects *"
                multiple
                disabled={formik.values.divisions.length === 0}
                fetchOptions={async (query) => {
                  const items = [
                    {
                      subjectName: 'All',
                      subjectCode: 'all',
                      subjectColor: '#000000',
                      type: 'All',
                    },
                    ...subjectOptions,
                  ];
                  const filtered = items.filter((item: any) =>
                    item?.subjectName?.toLowerCase().includes(query.toLowerCase())
                  );
                  return {
                    data: filtered.map((item: any) => ({
                      label: item.subjectName,
                      id: item.subjectCode,
                    })),
                    hasMore: false,
                  };
                }}
                value={
                  formik.values.selectedSubjects
                    ? formik.values.selectedSubjects.map((s: any) => {
                        const items = [
                          {
                            subjectName: 'All',
                            subjectCode: 'all',
                            subjectColor: '#000000',
                            type: 'All',
                          },
                          ...subjectOptions,
                        ];
                        const subjLabel =
                          items.find((opt) => opt.subjectCode === s)?.subjectName || s;
                        return { label: subjLabel, id: s };
                      })
                    : []
                }
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                getOptionLabel={(option: any) => option?.label || ''}
                renderOption={(prop, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.label}
                  </li>
                )}
                minChars={0}
                onChange={(_, val: any) => {
                  const selectedCodes = (val as any[]).map((v) => v.id);
                  const isAllSelected = selectedCodes.includes('all');
                  const wasAllPreviouslySelected = formik.values.selectedSubjects.includes('all');

                  let updatedSelectedSubjects: string[] = [];

                  if (isAllSelected && !wasAllPreviouslySelected) {
                    updatedSelectedSubjects = ['all', ...subjectOptions.map((s) => s.subjectCode)];
                  } else if (!isAllSelected && wasAllPreviouslySelected) {
                    updatedSelectedSubjects = [];
                  } else if (isAllSelected && selectedCodes.length !== subjectOptions.length + 1) {
                    updatedSelectedSubjects = ['all', ...subjectOptions.map((s) => s.subjectCode)];
                  } else {
                    updatedSelectedSubjects = selectedCodes.filter((code) => code !== 'all');
                  }

                  formik.setFieldValue('selectedSubjects', updatedSelectedSubjects);
                  formik.setFieldTouched(`selectedSubjects`, false);

                  const updatedSubjects = updatedSelectedSubjects
                    .filter((code) => code !== 'all')
                    .map((code, index) => {
                      const subject = subjectOptions.find((s) => s.subjectCode === code);
                      return {
                        id: index,
                        subjectName: subject?.subjectName || '',
                        subjectCode: subject?.subjectCode || '',
                        subjectColor: subject?.subjectColor || '#000000',
                        examDate: null,
                        startTime: null,
                        endTime: null,
                        totalMarks: null,
                        passingMarks: null,
                      };
                    });
                  formik.setFieldValue('subjects', updatedSubjects);

                  const updatedRoomDetails: IRoomDetails = updatedSelectedSubjects.reduce(
                    (acc, subjectCode) => {
                      if (subjectCode === 'all') return acc;
                      const subject = subjectOptions.find((s) => s.subjectCode === subjectCode);
                      if (!subject) return acc;

                      acc[subject.subjectName] = {
                        copyPastSubject: '',
                        divisions: (formik.values.divisions || [])
                          .filter((code) => code !== 'all')
                          .reduce(
                            (divAcc, divisionId) => {
                              divAcc[divisionId] = { roomIds: [], capacity: 0 };
                              return divAcc;
                            },
                            {} as Record<string, IDivisionRoomDetail>
                          ),
                        examDate: acc[subject.subjectName]?.examDate || null,
                      };
                      return acc;
                    },
                    {} as IRoomDetails
                  );
                  formik.setFieldValue('roomDetails', updatedRoomDetails);
                }}
                sx={{ width: '100%' }}
                size="small"
                error={!!(formik.touched.selectedSubjects && formik.errors.selectedSubjects)}
                helperText={
                  formik.touched.selectedSubjects &&
                  typeof formik.errors.selectedSubjects === 'string'
                    ? formik.errors.selectedSubjects
                    : undefined
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.examName && formik.errors.examName)}>
              <TextField
                fullWidth
                label="Exam Name *"
                size="small"
                name="examName"
                placeholder="e.g. First Terminal 2024"
                value={formik.values.examName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                  formik.setFieldValue('examName', value);
                  formik.setFieldTouched(`examName`, false);
                }}
                error={formik.touched.examName && Boolean(formik.errors.examName)}
                helperText={formik.touched.examName && formik.errors.examName}
              />
            </ShakingTextField>
          </Grid>
        </SectionCard>
      </Grid>
    </Grid>
  );
};

export default SelectExam;
