'use client';

'use client';

import React, { useMemo, useState } from 'react';

import { Add } from '@mui/icons-material';
import { Tab, Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import StudentDocumentType from './document-type';
import InquiryPreference from './inquiryPreference';
import EntranceExamSlots from './entrance-exam-slots';

const TABS = [
  {
    value: 'defaultDocumentTypes',
    label: 'Default Document Types',
    icon: <Iconify icon="basil:document-outline" width={20} />,
    buttonText: 'Document',
    component: (props: any) => <StudentDocumentType {...props} />,
  },
  {
    value: 'inquiryPreferenceDialog',
    label: 'Inquiry Preference',
    icon: <Iconify icon="ix:inquiry" width={20} />,
    buttonText: 'Inquiry Preference',
    component: (props: any) => <InquiryPreference {...props} />,
  },
  {
    value: 'entranceExamSlots',
    label: 'Entrance Exam Slots',
    icon: <Iconify icon="healthicons:i-exam-qualification-outline" width={20} />,
    buttonText: 'Slot',
    component: (props: any) => <EntranceExamSlots {...props} />,
  },
];
const StudentEnrollmentSettingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'defaultDocumentTypes' });
  const defaultDocumentTypes = useBoolean();
  const inquiryPreferenceDialog = useBoolean();
  const entranceExamSlotsDialog = useBoolean();

  const renderButton = useMemo(
    () => ({
      defaultDocumentTypes: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          onClick={defaultDocumentTypes.onTrue}
          size="small"
        >
          Document
        </Button>
      ),
      inquiryPreferenceDialog: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          onClick={inquiryPreferenceDialog.onTrue}
          variant="contained"
          size="small"
        >
          Inquiry Preference
        </Button>
      ),
      entranceExamSlots: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          onClick={entranceExamSlotsDialog.onTrue}
          variant="contained"
          size="small"
        >
          Slot
        </Button>
      ),
    }),
    [defaultDocumentTypes.onTrue, entranceExamSlotsDialog.onTrue, inquiryPreferenceDialog.onTrue]
  );

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
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard' },
          { name: 'Student Enrollment', href: '/student/enrollment/setting' },
          { name: 'Setting' },
        ]}
        sx={{ mb: 2 }}
        description="Configure all essential admission steps in the Settings tab, including exam setup, document types, and other requirements."
        action={renderButton[searchParams?.tab as keyof typeof renderButton]}
      />
      <Card
        sx={{
          // px: 1,
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
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              label={tab.label}
            />
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
              defaultDocumentTypes={defaultDocumentTypes}
              inquiryPreferenceDialog={inquiryPreferenceDialog}
              entranceExamSlotsDialog={entranceExamSlotsDialog}
            />
          )}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};
export default StudentEnrollmentSettingScreen;
