import React, { useMemo } from 'react';
import { Tab, Tabs } from '@mui/material';
import { useTabs } from 'src/hooks/use-tabs';
import Academic from 'src/screens/student/studentProfile/academic';
import Attendance from 'src/screens/student/studentProfile/attendance';
import { StudentInformation } from 'src/screens/student/studentProfile/information';

import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';

const TABS = [
  {
    value: 'information',
    label: 'Information',
    icon: <Iconify icon="solar:user-id-bold" width={22} />,
    component: (props: any) => <StudentInformation {...props} />,
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: <Iconify icon="solar:bill-list-bold" width={22} />,
    component: (props: any) => <Attendance {...props} />,
  },
  {
    value: 'academic',
    label: 'Academic',
    icon: <Iconify icon="solar:square-academic-cap-bold" width={22} />,
    component: (props: any) => <Academic {...props} />,
  },
  // {
  //   value: 'records',
  //   label: 'Records',
  //   icon: <Iconify icon="vaadin:records" width={22} />,
  //   component: (props: StudentTabsComponentType) => <Records {...props} />,
  // },
  { value: 'finance', label: 'Finance', icon: <Iconify icon="map:finance" width={22} /> },
  { value: 'documents', label: 'Documents', icon: <Iconify icon="ion:documents" width={22} /> },
  {
    value: 'communications',
    label: 'Communications',
    icon: <Iconify icon="maki:communications-tower" width={22} />,
  },
  {
    value: 'Transportation',
    label: 'transportation',
    icon: <Iconify icon="solar:bus-bold" width={22} />,
  },
];
const StudentTabs = () => {
  const tabs = useTabs('information');
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  return (
    <>
      <Tabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{ mb: 2, '& .MuiTabs-flexContainer': { gap: 1 } }}
      >
        {TABS.map((tab) => (
          <Tab
            // sx={{ fontSize: '12px' }}
            key={tab.value}
            label={tab.label}
            icon={tab.icon}
            value={tab.value}
          />
        ))}
      </Tabs>
      <Scrollbar sx={{ height: '100%', overflowY: 'auto' }}>
        {currentActiveComponent?.component && <currentActiveComponent.component tabs={tabs} />}
      </Scrollbar>
    </>
  );
};

export default StudentTabs;
