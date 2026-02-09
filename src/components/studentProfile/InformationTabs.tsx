import { useTabs } from 'src/hooks/use-tabs';
import { Tab, Box, Card } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';

import { StudentInformationForm } from './StudentInformationForm';

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'family', label: 'Family' },
  { value: 'communication', label: 'Communication' },
  { value: 'additionalDetails', label: 'Additional Details' },
  { value: 'medicalRecords', label: 'Medical Records' },
  { value: 'previousSchool', label: 'Prev. School Details' },
  { value: 'bankDetails', label: 'Bank Details' },
];

interface InformationTabsProps {
  student: any;
  refetch?: () => void;
}

export const InformationTabs = ({ student, refetch }: InformationTabsProps) => {
  const tabs = useTabs('general');

  // Get the current tab index
  const currentTabIndex = TABS.findIndex((tab) => tab.value === tabs.value);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 280px)' }}>
      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        orientation="vertical"
        sx={{ width: 220, borderRight: 1, borderColor: 'divider' }}
        slotProps={{ tab: { px: 2, justifyContent: 'flex-start' } }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </CustomTabs>

      <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
        <Box sx={{ p: 3, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
          <StudentInformationForm
            tabIndex={currentTabIndex}
            editData={student}
            isEdit
            refetch={refetch}
          />
        </Box>
      </Scrollbar>
    </Card>
  );
};
