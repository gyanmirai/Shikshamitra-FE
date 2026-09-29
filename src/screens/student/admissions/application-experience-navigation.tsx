import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { Tab, Paper, Stack } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { studentPaths } from 'src/constants/student-menu';

export type ApplicationExperienceView = 'inquiry' | 'registration';

const ITEMS: { value: ApplicationExperienceView; label: string; icon: string }[] = [
  { value: 'inquiry', label: 'Inquiry forms', icon: 'mdi:account-question-outline' },
  { value: 'registration', label: 'Registration forms', icon: 'mdi:file-document-edit-outline' },
];

export function ApplicationExperienceNavigation({ value }: { value: ApplicationExperienceView }) {
  return (
    <Paper variant="outlined" sx={{ flexShrink: 0, borderRadius: 1.5 }}>
      <CustomTabs
        value={value}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Admission form views"
        guardUnsavedChanges={false}
        slotProps={{ tab: { minHeight: 44 } }}
      >
        {ITEMS.map((item) => (
          <Tab
            key={item.value}
            component={Link}
            href={`${studentPaths.enrollment.settings.forms}?view=${item.value}`}
            value={item.value}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon={item.icon} width={18} />
                <span>{item.label}</span>
              </Stack>
            }
            id={`application-experience-${item.value}-tab`}
            aria-controls={`application-experience-${item.value}-panel`}
          />
        ))}
      </CustomTabs>
    </Paper>
  );
}
