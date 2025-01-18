'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LeavingCertificate from './leaving-certificate';
import BonofiedCertificate from './bonofied-certificate';
import CharacterCertificate from './character-certificate';
import FirstTrialCertificate from './first-trial-certificate';

const TABS = [
  {
    value: 'bonafiedCertificates',
    label: 'Bonafide Certificates',
    component: () => <BonofiedCertificate />,
  },
  {
    value: 'firstTrialCertificates',
    label: 'First Trial Certificates',
    component: () => <FirstTrialCertificate />,
  },
  {
    value: 'leavingCertificates',
    label: 'Leaving Certificates',
    component: () => <LeavingCertificate />,
  },
  {
    value: 'characterCertificates',
    label: 'Character Certificates',
    component: () => <CharacterCertificate />,
  },
];

const StudentCertificatesScreen = () => {
  const tabs = useTabs('bonafiedCertificates');
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Certificates"
        links={[{ name: 'Student' }, { name: 'Student Records' }, { name: 'Certificates' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card
        sx={{
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
    </Box>
  );
};

export default StudentCertificatesScreen;
