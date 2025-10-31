import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParam } from 'src/hooks/use-search-param';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Tab,
  Box,
  Grid,
  Card,
  Button,
  TextField,
  DialogActions,
  // eslint-disable-next-line import/no-duplicates
} from '@mui/material';

import SelectionBaseSettings from './SelectionBaseSettings';
import ConditionBaseSettings from './ConditionBaseSettings';
import { getGroupInitialValues } from './getGroupInitialValues';

const TABS = [
  {
    value: 'conditionBase',
    label: 'Condition Based',
    icon: <Iconify icon="carbon:flow-modeler" width={20} />,
    description: 'Define grading or configuration logic based on specific conditions.',
    component: (props: any) => <ConditionBaseSettings {...props} />,
  },
  {
    value: 'selectionBase',
    label: 'Selection Based',
    icon: <Iconify icon="carbon:list-checked" width={20} />,
    description: 'Manage setup or preferences based on user selections.',
    component: (props: any) => <SelectionBaseSettings {...props} />,
  },
];

const GroupForm = ({ initialValues, isEdit, onClose }: any) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  console.log('currentYear---', currentYear);
  const theme = useTheme();
  const formik = useFormik({
    initialValues: getGroupInitialValues(initialValues),
    onSubmit: (values) => {
      console.log(values);
    },
  });
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  const [boards, setBoards] = useState([]);

  const [groupedMediums, setGroupedMediums] = useState([]);

  //   useEffect(() => {
  //     if (selectedBoards.length > 0) {
  //       const groups = currentYear.boards
  //         .filter((b) => selectedBoards.includes(b.id))
  //         .map((b) => ({
  //           boardId: b.id,
  //           boardName: b.name,
  //           mediums: b.educationMediums || [],
  //         }));

  //       setGroupedMediums(groups);
  //     } else {
  //       setGroupedMediums([]);
  //     }
  //   }, [currentYear]);

  useEffect(() => {
    if (currentYear?.boards) {
      setBoards(currentYear.boards);
    }
  }, [currentYear]);
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'conditionBase' });
  const [isBackClick, setIsBackClick] = useState(false);
  // Dialog state for each tab
  const addConditionBaseDialog = useBoolean(false);
  const addSelectionBaseDialog = useBoolean(false);
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  console.log('boards----', boards);
  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid size={{ xs: 12 }}>
              <SectionCard title="General Information">
                <Grid size={{ xs: 12 }}>
                  <ShakingTextField error={!!(formik.touched.groupName && formik.errors.groupName)}>
                    <TextField
                      fullWidth
                      label="Group Name *"
                      name="groupName"
                      value={formik.values.groupName}
                      onChange={(e) => {
                        const value = e.target.value
                          // Remove everything except letters and spaces
                          .replace(/[^a-zA-Z\s]/g, '')
                          // Capitalize each word
                          .split(' ')
                          .map((word) =>
                            word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                          )
                          .join(' ');
                        formik.setFieldValue('groupName', value);
                      }}
                      error={formik.touched.groupName && Boolean(formik.errors.groupName)}
                      helperText={formik.touched.groupName && formik.errors.groupName}
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Editor
                    value={formik.values.description}
                    onChange={(value) => {
                      formik.setFieldValue('description', value);
                    }}
                    placeholder="Description"
                    sx={{
                      border: `1px solid ${theme.vars.palette.grey[500]}`,
                      borderRadius: 1,
                      '&:hover': { borderColor: theme.vars.palette.text.primary },
                      ...(!!formik.touched.description &&
                        !!formik.errors.description && {
                          borderColor: theme.palette.error.main,
                        }),
                      '&:focus-within': {
                        borderColor: theme.vars.palette.text.primary,
                        borderWidth: 2,
                      },
                    }}
                  />
                </Grid>
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Card
                sx={{
                  '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
                }}
              >
                <CustomTabs
                  value={searchParams.tab}
                  onChange={(e, value) => {
                    const newIndex = TABS.findIndex((tab) => tab.value === value);
                    if (currentIndex > newIndex) {
                      setIsBackClick(true);
                    } else {
                      setIsBackClick(false);
                    }
                    setSearchParams({ tab: value });
                  }}
                  sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
                  role="tablist"
                >
                  {TABS.map((tab) => (
                    <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
                  ))}
                </CustomTabs>
              </Card>
              <FormSlider
                steps={TABS}
                isBackClick={isBackClick}
                step={currentIndex}
                containerProps={{
                  sx: {
                    p: 0,
                  },
                }}
              >
                <Scrollbar sx={{ p: 1 }}>
                  {currentActiveComponent?.component && (
                    <currentActiveComponent.component
                      addConditionBaseDialog={addConditionBaseDialog}
                      addSelectionBaseDialog={addSelectionBaseDialog}
                      formik={formik}
                    />
                  )}
                </Scrollbar>
              </FormSlider>
            </Grid>
          </Scrollbar>
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onClose(null, false)}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              type="submit"
              startIcon={
                <Iconify
                  icon={initialValues ? GlobalIcons.edit : GlobalIcons.submit}
                  width={initialValues ? 16 : 20}
                  height={initialValues ? 16 : 20}
                />
              }
            >
              {initialValues ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default GroupForm;
