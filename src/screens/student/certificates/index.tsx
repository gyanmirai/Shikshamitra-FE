'use client';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LeavingCertificate from './leaving-certificate';
import BonofiedCertificate from './bonofied-certificate';
import CharacterCertificate from './character-certificate';
import FirstTrialCertificate from './first-trial-certificate';
import { FormSlider } from '../enrollment/register/register-form';

const TABS = [
  {
    value: 'bonafiedCertificates',
    label: 'Bonafide Certificates',
    component: () => <BonofiedCertificate />,
    icon: <Iconify icon="tdesign:certificate" width={20} />,
  },
  {
    value: 'firstTrialCertificates',
    label: 'First Trial Certificates',
    component: () => <FirstTrialCertificate />,
    icon: <Iconify icon="ph:certificate-light" width={20} />,
  },
  {
    value: 'leavingCertificates',
    label: 'Leaving Certificates',
    component: () => <LeavingCertificate />,
    icon: <Iconify icon="streamline-cyber:wedding-certificate" width={20} />,
  },
  {
    value: 'characterCertificates',
    label: 'Character Certificates',
    component: () => <CharacterCertificate />,
    icon: <Iconify icon="la:certificate" width={20} />,
  },
];

const StudentCertificatesScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'bonafiedCertificates' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const [isBackClick, setIsBackClick] = useState(false);

  // const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Certificates"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Records', href: '/student/overview/' },
          { name: 'Certificates' },
        ]}
        sx={{ px: 1, mb: 2 }}
        description="Generate certificates like Bonafide, Leaving, and others here."
      />
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
          mb: 1,
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
            // addSubjectDialog={addSubjectDialog}
            // addElectiveGroupDialog={addElectiveGroupDialog}
            // searchParams={searchParams}
            // setSearchParams={setSearchParams}
            />
          )}{' '}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};

export default StudentCertificatesScreen;
