import type { UseTabsReturn } from 'src/hooks/use-tabs';
import type { ReactElement, ComponentType } from 'react';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTabs } from 'src/hooks/use-tabs';
import { Box, Tab, Tabs, Paper } from '@mui/material';
import { FormSlider } from 'src/components/form-slider';

import { StudentProfileHeader } from './student-profile-header';

export type StudentProfileContentProps = {
  student: StudentRecordProfile;
  tabs: UseTabsReturn;
  refetch: () => unknown;
};
type Section = {
  value: string;
  label: string;
  icon: ReactElement;
  component: ComponentType<StudentProfileContentProps>;
};
type Props = {
  student: StudentRecordProfile;
  refetch: () => unknown;
  sections: Section[];
};

export function StudentProfileView({ student, refetch, sections }: Props) {
  const searchParams = useSearchParams();
  const tabs = useTabs(searchParams.get('tab') ? 'information' : 'dashboard');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBackClick, setIsBackClick] = useState(false);
  const currentIndex = sections.findIndex((tab) => tab.value === tabs.value);
  const ActiveComponent = sections[currentIndex]?.component;

  useEffect(() => {
    const handleScroll = (event: Event) =>
      setIsScrolled((event.target as HTMLElement).scrollTop > 50);
    const scrollContainer = document.querySelector('[data-scroll-container]');
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <StudentProfileHeader student={student} compact={isScrolled} />
      <Paper elevation={2} sx={{ px: 2, mb: 1 }}>
        <Tabs
          aria-label="Student profile tabs"
          variant="scrollable"
          scrollButtons="auto"
          value={tabs.value}
          onChange={(event, value) => {
            setIsBackClick(currentIndex > sections.findIndex((tab) => tab.value === value));
            tabs.onChange(event, value);
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 2 } }}
        >
          {sections.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </Tabs>
      </Paper>
      <FormSlider
        steps={sections}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{ sx: { p: 0, minHeight: 0 } }}
      >
        <Box sx={{ height: '100%' }}>
          {ActiveComponent && <ActiveComponent tabs={tabs} student={student} refetch={refetch} />}
        </Box>
      </FormSlider>
    </>
  );
}
