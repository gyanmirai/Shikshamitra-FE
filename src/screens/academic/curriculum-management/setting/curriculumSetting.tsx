'use client';

import { Add } from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { Tab, Box, Card, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import SubjectCreation from './subjectCreation';
import ElectiveSubjectSetting from './electiveSubjectSetting';

const TABS = [
  {
    value: 'subjectSetting',
    label: 'Subject Creation',
    icon: <Iconify icon="carbon:document-subject" width={20} />,
    component: (props: any) => <SubjectCreation {...props} />,
  },
  {
    value: 'electiveSubjectSetting',
    label: 'Elective Group Creation',
    icon: <Iconify icon="mdi:format-list-group" width={20} />,
    component: (props: any) => <ElectiveSubjectSetting {...props} />,
  },
];
const CurriculumSetting = () => {
  // Initialize search params with default tab 'subjectSetting'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'subjectSetting' });
  const addSubjectDialog = useBoolean(false);
  // Controls visibility of add/edit elective subject dialog
  const addElectiveGroupDialog = useBoolean(false);
  const renderButton = useMemo(
    () => ({
      subjectSetting: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          onClick={addSubjectDialog.onTrue}
          size="small"
        >
          Subject
        </Button>
      ),
      electiveSubjectSetting: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          onClick={addElectiveGroupDialog.onTrue}
          variant="contained"
          size="small"
        >
          Elective Group
        </Button>
      ),
    }),
    [addSubjectDialog.onTrue, addElectiveGroupDialog.onTrue]
  );

  // Find and memoize the currently active tab component based on search params
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const [isBackClick, setIsBackClick] = useState(false);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        description="Set up global subjects and elective groups to manage curriculum consistently across different classes."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
          { name: 'Setting' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={renderButton[searchParams?.tab as keyof typeof renderButton]}
      />
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
              addSubjectDialog={addSubjectDialog}
              addElectiveGroupDialog={addElectiveGroupDialog}
              // searchParams={searchParams}
              // setSearchParams={setSearchParams}
            />
          )}{' '}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};
export default CurriculumSetting;
