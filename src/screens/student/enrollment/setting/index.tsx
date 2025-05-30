'use client';

import React from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Tab, Box, Card, Button, Tooltip, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import StudentDocumentType, { DocumentForm } from './document-type';
import EntranceExamSlots, { SlotsForm } from './entrance-exam-slots';
import InquiryPreference, { InquiryPreferenceForm } from './inquiryPreference';

const StudentEnrollmentSettingScreen = () => {
  const tabs = useTabs('defaultDocumentTypes');

  const defaultDocumentTypes = useBoolean();
  const inquiryPreference = useBoolean();
  const entranceExamSlots = useBoolean();
  const TABS = [
    {
      value: 'defaultDocumentTypes',
      label: 'Default Document Types',
      buttonText: 'Document',
      onClick: () => {
        defaultDocumentTypes.onTrue();
      },
      component: () => <StudentDocumentType />,
    },
    {
      value: 'inquiryPreference',
      label: 'Inquiry Preference',
      buttonText: 'Inquiry Preference',
      onClick: () => {
        inquiryPreference.onTrue();
      },
      component: () => <InquiryPreference />,
    },
    {
      value: 'entranceExamSlots',
      label: 'Entrance Exam Slots',
      buttonText: 'Slot',
      onClick: () => {
        entranceExamSlots.onTrue();
      },
      component: () => <EntranceExamSlots />,
    },
  ];
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  const currentActiveComponent = TABS.find((tab) => tab.value === tabs.value);

  // Handle click event for the add button in header
  const handleClick = () => {
    currentActiveComponent?.onClick?.(); // Safely call action if it exists
  };

  // Get the button text for the current active tab
  const getButtonText = () => currentActiveComponent?.buttonText || 'Add';

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard' },
          { name: 'Student Enrollment', href: '/student/enrollment/setting' },
          { name: 'Setting' },
        ]}
        sx={{ px: 1, mb: 2 }}
        description="This is the Settings tab, where you can configure the necessary steps for the admission process, such as exam settings, document types, and other essential requirements for the admission."
        action={
          <Button
            variant="contained"
            size="small"
            onClick={handleClick}
            startIcon={<AddIcon />}
            sx={{ textTransform: 'capitalize', width: '180px' }}
          >
            {getButtonText()}
          </Button>
        }
      />
      <Card
        sx={{
          // px: 1,
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>

      {defaultDocumentTypes.value && (
        <CustomDialog
          open={defaultDocumentTypes.value}
          handleClose={() => {
            defaultDocumentTypes.onFalse();
          }}
          title={
            <Box display="flex" flexDirection="row" gap={2} alignItems="center">
              <Typography variant="h5">Document</Typography>
              <Tooltip
                arrow
                placement="right"
                title="This is the Document dialog, where you can add the required documents for registration along with their document types. By tapping the switch, you can mark a document as required or optional."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </Tooltip>
            </Box>
          }
        >
          <DocumentForm
            handleClose={() => {
              defaultDocumentTypes.onFalse();
            }}
            editData={null}
          />
        </CustomDialog>
      )}
      {inquiryPreference.value && (
        <CustomDialog
          open={inquiryPreference.value}
          handleClose={() => {
            inquiryPreference.onFalse();
          }}
          title={
            <Box display="flex" flexDirection="row" gap={2} alignItems="center">
              <Typography variant="h5">Inquiry Preference</Typography>
              <Tooltip arrow placement="right" title="?.">
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </Tooltip>
            </Box>
          }
        >
          <InquiryPreferenceForm
            handleClose={() => {
              inquiryPreference.onFalse();
            }}
            editData={null}
          />
        </CustomDialog>
      )}
      {entranceExamSlots.value && (
        <CustomDialog
          title={
            <Box display="flex" flexDirection="row" gap={2} alignItems="center">
              <Typography variant="h5">Slots</Typography>
              <Tooltip
                arrow
                placement="right"
                title="This is the Exam Slots section, where you can create slots for the entrance exam by configuring the student limit, room number, and other necessary parameters."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </Tooltip>
            </Box>
          }
          open={entranceExamSlots.value}
          handleClose={() => {
            entranceExamSlots.onFalse();
          }}
        >
          <SlotsForm
            handleClose={() => {
              entranceExamSlots.onFalse();
            }}
            editData={null}
          />
        </CustomDialog>
      )}
    </Box>
  );
};
export default StudentEnrollmentSettingScreen;
