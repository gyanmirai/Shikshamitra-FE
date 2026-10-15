import { Box, Tab, Paper } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  classOptions: { id: string; name: string }[];
  classId: string;
  onClassChange: (id: string) => void;
};

export default function CalendarViewControls({
  activeTab,
  onTabChange,
  classOptions,
  classId,
  onClassChange,
}: Props) {
  return (
    <Paper
      sx={{
        display: 'flex',
        alignItems: { sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        px: 1,
        py: 1,
        flexShrink: 0,
        minWidth: 0,
      }}
    >
      <Box sx={{ width: { xs: 1, sm: 180 }, flexShrink: 0 }}>
        <CustomSelect
          label="Class"
          options={classOptions}
          labelKey="name"
          valueKey="id"
          value={classId}
          onChange={(value) => onClassChange(String(value))}
          size="small"
          formControlProps={{ size: 'small', fullWidth: true }}
        />
      </Box>
      <CustomTabs
        aria-label="Academic calendar view"
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ minWidth: 0 }}
        slotProps={{ scroller: { p: 0 } }}
      >
        <Tab
          value="yearView"
          label="Year View"
          icon={<Iconify icon="mdi:calendar-month-outline" width={18} />}
        />
        <Tab
          value="monthView"
          label="Calendar View"
          icon={<Iconify icon="mdi:calendar-today-outline" width={18} />}
        />
      </CustomTabs>
    </Paper>
  );
}
