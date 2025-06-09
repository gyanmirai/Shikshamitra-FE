'use client';

import React, { useMemo } from 'react';

import { Add } from '@mui/icons-material';
import { Tab, Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SubjectCreation from './subjectCreation';
import ElectiveSubjectSetting from './electiveSubjectSetting';

const TABS = [
  {
    value: 'subjectSetting',
    label: 'Subject Creation',
    component: (props: any) => <SubjectCreation {...props} />,
  },
  {
    value: 'electiveSubjectSetting',
    label: 'Elective Group Creation',
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
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        description="Setting for creating global subjects, elective subject and notification setting"
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
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
            addSubjectDialog={addSubjectDialog}
            addElectiveGroupDialog={addElectiveGroupDialog}
            // searchParams={searchParams}
            // setSearchParams={setSearchParams}
          />
        )}{' '}
      </Box>
    </Box>
  );
};
export default CurriculumSetting;
