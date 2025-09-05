import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
import { varAlpha } from 'src/theme/styles';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { CalendarView } from 'src/sections/calendar/view';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { EventStatus, AnnouncementStatus } from 'src/enums/announcement-status';
import { getImportanceLevelColor } from 'src/screens/communication/announcement/components/getImportantColor';
import {
  Box,
  Tab,
  Chip,
  Card,
  Grid,
  Tabs,
  Button,
  Divider,
  MenuList,
  MenuItem,
  Typography,
} from '@mui/material';

const EmployeeCommunication = ({ employee }: any) => (
  <Box>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 12, md: 3 }}>
        <Card
          sx={{
            display: 'flex',
            p: 1,
            width: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box display="flex" gap={2}>
              <Iconify icon="mdi:bell" width={20} height={20} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1">New Announcement</Typography>
            </Box>
            <Scrollbar sx={{ mt: 1.5, mb: 1, height: '150px' }}>
              <Box component="ul" sx={{ listStyle: 'none', width: '100%', padding: 0 }}>
                {[
                  'New Announcement',
                  'New Announcement',
                  'New Announcement',
                  'New Announcement',
                  'New Announcement',
                  'New Announcement',
                ].map((item, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                      {item}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Scrollbar>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 3 }}>
        <Card
          sx={{
            display: 'flex',
            p: 1,
            width: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.1),
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box display="flex" gap={2}>
              <Iconify
                icon="mdi:event"
                width={20}
                height={20}
                sx={{ color: 'secondary.main', mt: 0.3 }}
              />
              <Typography variant="subtitle1">Upcoming Events</Typography>
            </Box>
            <Scrollbar sx={{ mt: 1.5, mb: 1, height: '150px' }}>
              <Box component="ul" sx={{ listStyle: 'none', width: '100%', padding: 0 }}>
                {['Upcoming Events', 'Upcoming Events'].map((item, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                      {item}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Scrollbar>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 3 }}>
        <Card
          sx={{
            display: 'flex',
            p: 1,
            width: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.info.mainChannel, 0.1),
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box display="flex" gap={2}>
              <Iconify
                icon="mdi:message-text"
                width={20}
                height={20}
                sx={{ color: 'info.main', mt: 0.4 }}
              />
              <Typography variant="subtitle1">New Messages</Typography>
            </Box>
            <Scrollbar sx={{ mt: 1.5, mb: 1, height: '150px' }}>
              <Box component="ul" sx={{ listStyle: 'none', width: '100%', padding: 0 }}>
                {['New Messages', 'New Messages'].map((item, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                      {item}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Scrollbar>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 3 }}>
        <Card
          sx={{
            display: 'flex',
            p: 1,
            width: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box display="flex" gap={2}>
              <Iconify
                icon="ri:survey-line"
                width={20}
                height={20}
                sx={{ color: 'warning.main' }}
              />
              <Typography variant="subtitle1">Scheduled Meetings</Typography>
            </Box>
            <Scrollbar sx={{ mt: 1.5, mb: 1, height: '150px' }}>
              <Box component="ul" sx={{ listStyle: 'none', width: '100%', padding: 0 }}>
                {['Scheduled Meetings', 'Scheduled Meetings'].map((item, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                      {item}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Scrollbar>
          </Box>
        </Card>
      </Grid>
    </Grid>

    <CalendarView />

    <EmployeeAnnouncement />

    <EmployeeEvent />
    <EmployeeMeetings />
  </Box>
);

export default EmployeeCommunication;

const EmployeeAnnouncement = () => {
  const tabs = useTabs(AnnouncementStatus.Active);

  const TABS = useMemo(
    () => [
      {
        value: 'Active',
        label: 'Active',
        count: 0,
        color: 'primary',
      },
      {
        value: 'Scheduled',
        label: 'Scheduled',
        count: 0,
        color: 'default',
      },
      {
        value: 'Pending',
        label: 'Pending',
        count: 0,
        color: 'warning',
      },
    ],
    []
  );
  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <Box display="flex" gap={2} alignItems="center">
          <Iconify icon="mdi:bell" width={20} height={20} sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Announcement</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />}>
          Announcement
        </Button>
      </Box>
      <Tabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{
          mb: 1,
          '& .MuiTabs-flexContainer': { gap: 2 },
          flexGrow: 1,
        }}
      >
        {TABS.map((tab) => (
          <Tab
            sx={{ fontSize: '12px' }}
            key={tab.value}
            label={
              <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                {tab.label}{' '}
                <Label variant="soft" color={(tab?.color as LabelColor) || 'default'}>
                  {tab.count}
                </Label>
              </Box>
            }
            // icon={tab.icon}
            value={tab.value}
          />
        ))}
      </Tabs>
      <Divider />
      <CustomizableTable
        noDataText={
          <>
            No Announcement Found{' '}
            {/* <Box
              onClick={() => {

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
            </Box> */}
          </>
        }
        tableId="employeeAnnouncementTable"
        columns={[
          { id: 'title', label: 'Title' },
          { id: 'announcementType', label: 'Announcement Type', align: 'left', minWidth: '180px' },
          {
            id: 'publishDate',
            label: 'Publish Date',
            minWidth: '180px',
            align: 'left',
            filterType: 'date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'expiryDate',
            label: 'Expiry Date',
            minWidth: '180px',
            align: 'left',
            filterType: 'date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'className',
            label: 'Class',
            filterType: 'number',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((className: string) => (
                  <Chip key={className} label={className} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          {
            id: 'division',
            label: 'Division',

            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip
                    key={audience}
                    label={audience}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          {
            id: 'importance_level',
            label: 'Importance',
            render: (value) => {
              const colors = getImportanceLevelColor(value);
              return (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '16px',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {value}
                </Typography>
              );
            },
          },
          {
            id: 'audience',
            label: 'Audience',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip key={audience} label={audience} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,
            sticky: true,

            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...props, row })}
                  placement="right-top"
                  showEditIcon
                  showDeleteIcon
                  showViewIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    //   setOpen(true);
                    //   setEditingAnnouncement(row);
                  }}
                  handleDeleteClick={() => {
                    //   confirm_dialog.onTrue();
                    //   setDeleteAnnouncement(row.id);
                  }}
                  handleViewClick={() => {
                    //   view_dialog.onTrue();
                    //   setViewAnnouncement(row);
                  }}
                />
              );
            },
          },
        ]}
        data={[]}
      />
    </Box>
  );
};

const EmployeeEvent = () => {
  const tabs = useTabs(EventStatus.Completed);

  const TABS = useMemo(
    () => [
      {
        value: 'Completed',
        label: 'Completed',
        count: 0,
        color: 'primary',
      },
      {
        value: 'Scheduled',
        label: 'Scheduled',
        count: 0,
        color: 'warning',
      },
    ],
    []
  );
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <Box display="flex" gap={2} alignItems="center">
          <Iconify
            icon="mdi:event"
            width={20}
            height={20}
            sx={{ color: 'secondary.main', mt: 0.3 }}
          />
          <Typography variant="h6">Events</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />}>
          Event
        </Button>
      </Box>
      <Tabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{
          mb: 1,
          '& .MuiTabs-flexContainer': { gap: 2 },
          flexGrow: 1,
        }}
      >
        {TABS.map((tab) => (
          <Tab
            sx={{ fontSize: '12px' }}
            key={tab.value}
            label={
              <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                {tab.label}{' '}
                <Label variant="soft" color={(tab?.color as LabelColor) || 'default'}>
                  {tab.count}
                </Label>
              </Box>
            }
            // icon={tab.icon}
            value={tab.value}
          />
        ))}
      </Tabs>
      <Divider />
      <CustomizableTable
        noDataText={
          <>
            No Events Found{' '}
            {/* <Box
            onClick={() => {

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
          </Box> */}
          </>
        }
        tableId="employeeEventId"
        columns={[
          { id: 'eventTitle', label: 'Event Title', minWidth: '180px', align: 'left' },
          { id: 'eventVenue', label: 'Event Venue', minWidth: '180px', align: 'left' },
          { id: 'eventType', label: 'Event Type', minWidth: '180px', align: 'left' },
          {
            id: 'eventDate',
            label: 'Date',
            filterType: 'date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'eventTime',
            label: 'Time',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('HH:mm')}
              </Typography>
            ),
          },
          {
            id: 'audience',
            label: 'Audience',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip
                    key={audience}
                    label={audience}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          {
            id: 'organization',
            label: 'Organizations',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((org: string) => (
                  <Chip key={org} label={org} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          {
            id: 'className',
            label: 'Class',
            filterType: 'number',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((className: string) => (
                  <Chip
                    key={className}
                    label={className}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          { id: 'eventOrganizer', label: 'Event Organizer', minWidth: '200px', align: 'left' },
          {
            id: 'eventBudget',
            label: 'Event Budget',
            minWidth: '180px',
            align: 'left',
            filterType: 'number',
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,

            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...props, row })}
                  placement="right-top"
                  showEditIcon
                  showDeleteIcon
                  showViewIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    // setOpen(true);
                    // setEditingEvent(row);
                  }}
                  handleDeleteClick={() => {
                    // confirm_dialog.onTrue();
                    // setDeleteEvent(row.id);
                  }}
                  handleViewClick={() => {
                    // handleEyeClick(row.id);
                  }}
                />
              );
            },
          },
        ]}
        data={[]}
      />
    </Box>
  );
};

const EmployeeMeetings = () => {
  const tabs = useTabs(EventStatus.Completed);

  const TABS = useMemo(
    () => [
      {
        value: 'Completed',
        label: 'Completed',
        count: 0,
        color: 'primary',
      },
      {
        value: 'Scheduled',
        label: 'Scheduled',
        count: 0,
        color: 'warning',
      },
    ],
    []
  );

  const actions = useCallback(
    ({ popover: pop }: any) => (
      <>
        {' '}
        <MenuList>
          {/* {(row.status === 'Cancelled' || row.status === 'Scheduled') && ( */}
          <MenuItem onClick={() => {}}>
            <Iconify icon="mdi:bell" sx={{ mr: 1 }} />
            Notify Audience
          </MenuItem>
          {/* )} */}
        </MenuList>
      </>
    ),
    []
  );
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <Box display="flex" gap={2} alignItems="center">
          <Iconify icon="ri:survey-line" width={20} height={20} sx={{ color: 'warning.main' }} />
          <Typography variant="h6">Meetings</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />}>
          Meeting
        </Button>
      </Box>
      <Tabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{
          mb: 1,
          '& .MuiTabs-flexContainer': { gap: 2 },
          flexGrow: 1,
        }}
      >
        {TABS.map((tab) => (
          <Tab
            sx={{ fontSize: '12px' }}
            key={tab.value}
            label={
              <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                {tab.label}{' '}
                <Label variant="soft" color={(tab?.color as LabelColor) || 'default'}>
                  {tab.count}
                </Label>
              </Box>
            }
            // icon={tab.icon}
            value={tab.value}
          />
        ))}
      </Tabs>
      <Divider />
      <CustomizableTable
        noDataText={
          <>
            No Meeting Found{' '}
            {/* <Box
            onClick={() => {

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
          </Box> */}
          </>
        }
        tableId="employeeMeetingId"
        columns={[
          { id: 'title', label: 'Title' },
          { id: 'meetingType', label: 'Meeting Type', minWidth: '180px', align: 'left' },
          {
            id: 'meetingDate',
            label: 'Meeting Date',
            minWidth: '180px',
            align: 'left',
            filterType: 'date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'meetingTime',
            label: 'Meeting Time',
            minWidth: '180px',
            align: 'left',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('HH:mm')}
              </Typography>
            ),
          },
          {
            id: 'audience',
            label: 'Audience',
            render: (value: any) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip
                    key={audience}
                    label={audience}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          {
            id: 'organization',
            label: 'Organizations',
            render: (value: any) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value && value.length > 0
                  ? value.map((org: string) => (
                      <Chip key={org} label={org} size="small" variant="outlined" />
                    ))
                  : '-'}
              </Box>
            ),
          },
          {
            id: 'className',
            label: 'Class',
            filterType: 'number',
            render: (value: any) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value && value.length > 0
                  ? value.map((org: string) => (
                      <Chip key={org} label={org} size="small" variant="outlined" />
                    ))
                  : '-'}
              </Box>
            ),
          },
          {
            id: 'division',
            label: 'Division',
            render: (value: any) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value && value.length > 0
                  ? value.map((org: string) => (
                      <Chip key={org} label={org} size="small" variant="outlined" />
                    ))
                  : '-'}
              </Box>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,

            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showEditIcon
                  showDeleteIcon
                  showViewIcon
                  handleEditClick={() => {
                    // setOpen(true);
                    // setEditingEvent(row);
                  }}
                  handleDeleteClick={() => {
                    // confirm_dialog.onTrue();
                    // setDeleteEvent(row.id);
                  }}
                  handleViewClick={() => {
                    // handleEyeClick(row.id);
                  }}
                />
              );
            },
          },
        ]}
        data={[]}
      />
    </Box>
  );
};
