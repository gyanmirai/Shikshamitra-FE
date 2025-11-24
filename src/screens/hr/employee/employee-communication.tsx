import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { CalendarView } from 'src/sections/calendar/view';
import { EmptyContent } from 'src/components/empty-content';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { EventStatus, AnnouncementStatus } from 'src/enums/announcement-status';
import { getImportanceLevelColor } from 'src/screens/communication/announcement/components/getImportantColor';
import {
  Box,
  Tab,
  Chip,
  Card,
  Tabs,
  Stack,
  Button,
  Avatar,
  Divider,
  MenuList,
  MenuItem,
  Typography,
  IconButton,
} from '@mui/material';

interface CommunicationItem {
  // eslint-disable-next-line react/no-unused-prop-types
  id: string;
  title: string;
  category?: string;
  description?: string;
  message?: string;
  signature?: string;
  createdBy: string;
  createdOn: string;
  isRead?: boolean;
  type: 'announcement' | 'event';
  date?: string;
  time?: string;
  venue?: string;
}

interface CommunicationCardProps extends CommunicationItem {}

const CommunicationCard = ({
  title,
  category,
  description,
  message,
  signature,
  createdBy,
  createdOn,
  isRead = false,
  type,
  date,
  time,
  venue,
}: CommunicationCardProps) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'announcement':
        return { icon: 'mdi:bell', color: 'primary.main' };
      case 'event':
        return { icon: 'mdi:event', color: 'secondary.main' };
      default:
        return { icon: 'mdi:bell', color: 'primary.main' };
    }
  };

  const config = getTypeConfig();

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mb: 2,
        transition: 'all 0.3s ease',
        borderLeft: '4px solid',
        borderLeftColor: config.color,
        backgroundColor: isRead ? 'background.paper' : 'background.neutral', // Changed from grey.50
        '&:hover': {
          boxShadow: 8,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: 2,
          pb: 1.5,
          bgcolor: 'background.neutral', // Changed from grey.100
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Iconify icon={config.icon} width={20} sx={{ color: config.color }} />
              <Typography variant="h6" fontWeight={600} color="text.primary">
                {title}
              </Typography>
              {!isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                  }}
                />
              )}
            </Stack>
            {category && (
              <Chip
                label={category}
                size="small"
                color="primary"
                variant="soft"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <IconButton size="small" sx={{ mt: -0.5 }}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      {/* Content Section - no changes needed */}
      <Box sx={{ p: 2.5 }}>
        {/* Description */}
        {description && (
          <Typography
            variant="subtitle2"
            color="text.secondary"
            mb={2}
            sx={{
              fontStyle: 'italic',
              pl: 2,
              borderLeft: '3px solid',
              borderLeftColor: config.color,
            }}
          >
            {description}
          </Typography>
        )}

        {/* Event Details */}
        {type === 'event' && (
          <Stack spacing={1} mb={2}>
            {date && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon="solar:calendar-outline"
                  width={16}
                  sx={{ color: 'text.secondary' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {dayjs(date).format('DD MMM YYYY')}
                </Typography>
              </Stack>
            )}
            {time && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon="solar:clock-circle-outline"
                  width={16}
                  sx={{ color: 'text.secondary' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {time}
                </Typography>
              </Stack>
            )}
            {venue && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon="solar:map-point-outline"
                  width={16}
                  sx={{ color: 'text.secondary' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {venue}
                </Typography>
              </Stack>
            )}
          </Stack>
        )}

        {/* Message Body */}
        {message && (
          <Typography
            variant="body2"
            color="text.primary"
            sx={{
              whiteSpace: 'pre-line',
              lineHeight: 1.8,
              mb: 2,
            }}
          >
            {message}
          </Typography>
        )}

        {/* Signature */}
        {signature && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontStyle: 'italic',
              mt: 2,
              pl: 2,
            }}
          >
            {signature}
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Footer Section */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'background.neutral', // Changed from grey.50
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: config.color,
                fontSize: '0.875rem',
              }}
            >
              {createdBy.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.primary" display="block">
                {createdBy}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:calendar-outline" width={14} />
                <Typography variant="caption" color="text.secondary">
                  {createdOn}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              sx={{
                bgcolor: 'action.hover', // Changed from grey.200
                '&:hover': {
                  bgcolor: 'action.selected', // Changed from grey.300
                },
              }}
            >
              <Iconify icon="solar:bookmark-outline" width={18} />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                bgcolor: 'action.hover', // Changed from grey.200
                '&:hover': {
                  bgcolor: 'action.selected', // Changed from grey.300
                },
              }}
            >
              <Iconify icon="solar:share-outline" width={18} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};

const EmployeeCommunication = ({ employee }: any) => {
  // Sample data - replace with actual API data
  const communications: CommunicationItem[] = [
    {
      id: '1',
      title: 'Important School Announcement',
      category: 'General',
      description: 'Please read this important update',
      message:
        'We are pleased to inform all staff members about the upcoming changes to our school policies. Please review the attached documents carefully.',
      signature: 'Principal',
      createdBy: 'John Doe',
      createdOn: '10/12/2023',
      isRead: false,
      type: 'announcement',
    },
    {
      id: '2',
      title: 'Annual Day Celebration',
      category: 'Event',
      description: 'Join us for the annual day celebrations!',
      message:
        'We are excited to announce that the school annual day will be held on 25th December. All staff members are invited to participate.',
      signature: 'Principal',
      createdBy: 'Jane Smith',
      createdOn: '09/12/2023',
      isRead: true,
      type: 'event',
      date: '2023-12-25',
      time: '5:00 PM',
      venue: 'School Auditorium',
    },
  ];

  // const announcements = communications.filter((c) => c.type === 'announcement');
  // const events = communications.filter((c) => c.type === 'event');

  return (
    <Box>
      {/* All Communications Section */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={600}>
              All Communications
              <Typography component="span" variant="h6" color="text.secondary" ml={1}>
                ({communications.length})
              </Typography>
            </Typography>
          </Stack>
        </Box>

        <Divider />

        <Scrollbar sx={{ maxHeight: 800, p: 2 }}>
          {communications.length > 0 ? (
            communications.map((item) => <CommunicationCard key={item.id} {...item} />)
          ) : (
            <Box sx={{ mt: 5 }}>
              <EmptyContent title="No Communication Data Found" />
            </Box>
          )}
        </Scrollbar>
      </Box>

      {/* Keep existing table sections if needed */}
      <Box sx={{ display: 'none' }}>
        <CalendarView />
        <EmployeeAnnouncement />
        <EmployeeEvent />
        <EmployeeMeetings />
      </Box>
    </Box>
  );
};

export default EmployeeCommunication;

// Keep existing table components for reference...
const EmployeeAnnouncement = () => {
  const tabs = useTabs(AnnouncementStatus.Active);

  const TABS = useMemo(
    () => [
      { value: 'Active', label: 'Active', count: 0, color: 'primary' },
      { value: 'Scheduled', label: 'Scheduled', count: 0, color: 'default' },
      { value: 'Pending', label: 'Pending', count: 0, color: 'warning' },
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
        sx={{ mb: 1, '& .MuiTabs-flexContainer': { gap: 2 }, flexGrow: 1 }}
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
      { value: 'Completed', label: 'Completed', count: 0, color: 'primary' },
      { value: 'Scheduled', label: 'Scheduled', count: 0, color: 'warning' },
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
        sx={{ mb: 1, '& .MuiTabs-flexContainer': { gap: 2 }, flexGrow: 1 }}
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
      { value: 'Completed', label: 'Completed', count: 0, color: 'primary' },
      { value: 'Scheduled', label: 'Scheduled', count: 0, color: 'warning' },
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
        sx={{ mb: 1, '& .MuiTabs-flexContainer': { gap: 2 }, flexGrow: 1 }}
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
