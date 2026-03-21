import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Tab, Box, Tabs, Paper } from '@mui/material';
import CustomizableTable from 'src/components/customizable-table';

import { useAnnouncementTable } from '../hooks/useAnnouncementTable';

import type { ISchoolWiseAnnouncementTableProps } from '../type';

const AnnouncementTable: React.FC<ISchoolWiseAnnouncementTableProps> = ({
  data,
  isLoading,
  setOpen,
  onEdit,
  onDelete,
  onRemove,
  onView,
  onPublish,
}) => {
  const { tabs, TABS, tableData, getColumns }: any = useAnnouncementTable({
    onRemove,
    onEdit,
    onDelete,
    onView,
    onPublish,
  });

  return (
    <>
      {/* Tabs */}
      <Paper
        sx={{
          mt: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          height: 50,
        }}
        elevation={2}
      >
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
            pb: 1,
          }}
        >
          {TABS.map((tab: any) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}
                  <Label color={(tab?.color as LabelColor) || 'default'}>{tab.count}</Label>
                </Box>
              }
              value={tab.value}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Table */}
      <CustomizableTable
        tableId={`school-wise-announcement-table-${tabs.value}`}
        isLoading={isLoading}
        noDataText={
          <>
            No school announcement data found
            <Box
              onClick={() => {
                setOpen(true);
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Announcement
            </Box>
          </>
        }
        columns={getColumns(tabs.value)}
        data={tableData || []}
      />
    </>
  );
};

export default AnnouncementTable;
