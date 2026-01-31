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

import StudentDocumentType from './document-type';
import FormNumberSeries from './FormNumberSeries';
import InquiryPreference from './inquiryPreference';
import EntranceExamSlots from './entrance-exam-slots';
import RegistrationAmount from './RegistrationFormAmount';

const TABS = [
  {
    value: 'defaultDocumentTypes',
    label: 'Document Types',
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
  {
    value: 'registrationFormAmount',
    label: 'Registration Form Amount',
    icon: <Iconify icon="solar:money-bold" width={20} />,
    buttonText: 'Amount',
    component: (props: any) => <RegistrationAmount {...props} />,
  },
  {
    value: 'formNumberSeries',
    label: 'Form Number Series',
    icon: <Iconify icon="solar:form-bold" width={20} />,
    buttonText: 'Form Number Series',
    component: (props: any) => <FormNumberSeries {...props} />,
  },
];
const StudentEnrollmentSettingScreen = () => {
  // URL search parameter state for active tab, defaulting to document types tab
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'defaultDocumentTypes' });

  // Controls visibility of document types configuration dialog
  const defaultDocumentTypes = useBoolean();
  // Controls visibility of inquiry preference settings dialog
  const inquiryPreferenceDialog = useBoolean();
  // Controls visibility of entrance exam time slots dialog
  const entranceExamSlotsDialog = useBoolean();
  // Controls visibility of registration fee amount dialog
  const registrationAmountDialog = useBoolean();
  // Controls visibility of form number series configuration dialog
  const formNumberSeriesDialog = useBoolean();

  // Memoized object containing add buttons for each tab
  // Each button opens its corresponding dialog modal
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
      registrationFormAmount: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          onClick={registrationAmountDialog.onTrue}
          variant="contained"
          size="small"
        >
          Amount
        </Button>
      ),
      formNumberSeries: (
        <Button
          startIcon={<Add />}
          onClick={formNumberSeriesDialog.onTrue}
          variant="contained"
          size="small"
        >
          Form Number Series
        </Button>
      ),
    }),
    [
      defaultDocumentTypes.onTrue,
      entranceExamSlotsDialog.onTrue,
      inquiryPreferenceDialog.onTrue,
      registrationAmountDialog.onTrue,
      formNumberSeriesDialog.onTrue,
    ]
  );

  // Find the currently active tab component based on URL search param
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  // Get the index of current active tab for animation purposes
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  // State to track if user clicked back to previous tab
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
              registrationAmountDialog={registrationAmountDialog}
              formNumberSeriesDialog={formNumberSeriesDialog}
            />
          )}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};
export default StudentEnrollmentSettingScreen;
