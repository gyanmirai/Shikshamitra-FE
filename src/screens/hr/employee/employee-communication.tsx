import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import { CalendarView } from 'src/sections/calendar/view';
import { EmptyContent } from 'src/components/empty-content';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { EventStatus, AnnouncementStatus } from 'src/enums/announcement-status';
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
        return {
          icon: 'solar:bell-bing-bold-duotone',
          color: 'primary.main',
          bg: 'primary.lighter',
        };
      case 'event':
        return {
          icon: 'solar:calendar-add-bold-duotone',
          color: 'secondary.main',
          bg: 'secondary.lighter',
        };
      default:
        return {
          icon: 'solar:bell-bing-bold-duotone',
          color: 'primary.main',
          bg: 'primary.lighter',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'visible',
        mb: 3,
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows.z20,
          '& .action-buttons': { opacity: 1 },
        },
        ...(!isRead && {
          borderColor: config.color,
          boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}15`,
        }),
      }}
    >
      {!isRead && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: 'error.main',
            boxShadow: '0 0 0 2px white',
            zIndex: 1,
          }}
        />
      )}

      {/* Header Section */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 48,
            height: 48,
            bgcolor: config.bg,
            color: config.color,
          }}
        >
          <Iconify icon={config.icon} width={24} />
        </Avatar>

        <Box flex={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Box>
              {category && (
                <Typography
                  variant="caption"
                  sx={{
                    color: config.color,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    mb: 0.5,
                    display: 'block',
                  }}
                >
                  {category}
                </Typography>
              )}
              <Typography
                variant="h6"
                fontWeight={700}
                color="text.primary"
                sx={{ lineHeight: 1.3 }}
              >
                {title}
              </Typography>
            </Box>

            <IconButton
              size="small"
              className="action-buttons"
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} mt={1}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              With
              <Typography component="span" variant="caption" fontWeight={600} color="text.primary">
                {createdBy}
              </Typography>
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">
              {createdOn}
            </Typography>
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* Content Section */}
      <Box sx={{ p: 2.5, pt: 2 }}>
        {description && (
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.primary',
              mb: 2,
              fontWeight: 600,
            }}
          >
            {description}
          </Typography>
        )}

        {/* Event Details Grid */}
        {type === 'event' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
              mb: 3,
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
            }}
          >
            {date && (
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Iconify
                  icon="solar:calendar-date-bold"
                  width={20}
                  sx={{ color: 'primary.main' }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Date
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {dayjs(date).format('DD MMM YYYY')}
                  </Typography>
                </Box>
              </Stack>
            )}
            {time && (
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Iconify icon="solar:clock-circle-bold" width={20} sx={{ color: 'warning.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Time
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {time}
                  </Typography>
                </Box>
              </Stack>
            )}
            {venue && (
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Iconify icon="solar:map-point-bold" width={20} sx={{ color: 'error.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Venue
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {venue}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>
        )}

        {message && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              whiteSpace: 'pre-line',
              lineHeight: 1.7,
              mb: 2,
            }}
          >
            {message}
          </Typography>
        )}

        {signature && (
          <Stack direction="row" justifyContent="flex-end" mt={2}>
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                color: 'text.secondary',
                borderLeft: '2px solid',
                borderLeftColor: 'divider',
                pl: 1.5,
              }}
            >
              {signature}
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        <Button
          size="small"
          startIcon={<Iconify icon="solar:bookmark-linear" />}
          color="inherit"
          sx={{ fontWeight: 600, borderRadius: 1 }}
        >
          Save
        </Button>
        <Button
          size="small"
          startIcon={<Iconify icon="solar:share-linear" />}
          color="inherit"
          sx={{ fontWeight: 600, borderRadius: 1 }}
        >
          Share
        </Button>
        <Button
          size="small"
          variant="soft"
          color={config.color.split('.')[0] as any}
          endIcon={<Iconify icon="solar:arrow-right-linear" />}
          sx={{ fontWeight: 600, borderRadius: 1 }}
        >
          Details
        </Button>
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
      <Box sx={{ mt: 3, mb: 5 }}>
        <Box sx={{ p: 2, pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 4,
                  height: 24,
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                }}
              />
              <Typography variant="h5" fontWeight={700}>
                All Communications
                <Typography
                  component="span"
                  variant="h6"
                  color="text.secondary"
                  sx={{ ml: 1, opacity: 0.7 }}
                >
                  ({communications.length})
                </Typography>
              </Typography>
            </Stack>

            {/* Optional Filter/Sort Actions could go here */}
            {/* <Button startIcon={<Iconify icon="solar:filter-linear" />} variant="outlined" size="small">
              Filter
            </Button> */}
          </Stack>
        </Box>

        <Stack spacing={3} sx={{ px: 2, maxWidth: 800, mx: 'auto' }}>
          {communications.length > 0 ? (
            communications.map((item) => (
              <Box
                key={item.id}
                sx={{
                  // Animation wrapper
                  animation: 'fadeInUp 0.5s ease-out',
                  '@keyframes fadeInUp': {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <CommunicationCard {...item} />
              </Box>
            ))
          ) : (
            <Box sx={{ mt: 5 }}>
              <EmptyContent
                title="No Communication Data Found"
                imgUrl="/assets/icons/empty/ic_content.svg"
                description="Check back later for new announcements or events."
              />
            </Box>
          )}
        </Stack>
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
            render: (value) => (
              <Typography
                component="span"
                variant="body2"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {value}
              </Typography>
            ),
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
