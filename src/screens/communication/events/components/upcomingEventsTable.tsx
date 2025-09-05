import dayjs from 'dayjs';
import { Box, Chip, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IEvent, IUpcomingEventsTableProps } from '../type';

const UpcomingEventsTable: React.FC<IUpcomingEventsTableProps> = ({
  data,
  onEdit,
  onDelete,
  onView,
}: IUpcomingEventsTableProps) => (
  <CustomizableTable
    tableId="event-table"
    columns={[
      { id: 'eventTitle', label: 'Event Title', minWidth: '180px', align: 'left' },
      { id: 'eventVenue', label: 'Event Venue', minWidth: '180px', align: 'left' },
      { id: 'eventType', label: 'Event Type', minWidth: '180px', align: 'left' },
      {
        id: 'eventStartDate',
        label: 'Start Date',
        minWidth: '180px',
        align: 'left',
        render: (value) => (
          <Typography fontSize="12px" gutterBottom>
            {dayjs(value).format('DD MMM YYYY')}
          </Typography>
        ),
      },
      {
        id: 'eventEndDate',
        label: 'End Date',
        minWidth: '180px',
        align: 'left',
        render: (value) => (
          <Typography fontSize="12px" gutterBottom>
            {dayjs(value).format('DD MMM YYYY')}
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
      { id: 'eventBudget', label: 'Event Budget', minWidth: '180px', align: 'left' },
      {
        id: 'action',
        label: 'Action',
        isSort: false,
        render: (_, row) => (
          <ThreeDotsActions
            placement="right-top"
            showEditIcon
            showDeleteIcon
            showViewIcon
            showThreeDots={false}
            handleEditClick={() => onEdit(row as IEvent)}
            handleDeleteClick={() => onDelete(row.id)}
            handleViewClick={() => onView(row.id)}
          />
        ),
      },
    ]}
    data={data}
  />
);

export default UpcomingEventsTable;
