import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Box, Chip, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { getImportanceLevelColor } from './getImportantColor';

import type { IClassAnnouncement, IClassWiseAnnouncementTableProps } from '../type';

const ClassWiseAnnouncementTable: React.FC<IClassWiseAnnouncementTableProps> = ({
  data,
  onEdit,
  onDelete,
  onView,
  onRequestPublish,
}: IClassWiseAnnouncementTableProps) => (
  <CustomizableTable
    tableId="class-specific-announcement-table"
    columns={[
      { id: 'title', label: 'Title' },
      {
        id: 'publishDate',
        label: 'Publish Date',
        minWidth: '180px',
        align: 'left',
        render: (value) => (
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
        render: (value) => (
          <Typography fontSize="12px" gutterBottom>
            {dayjs(value).format('DD MMM YYYY')}
          </Typography>
        ),
      },
      {
        id: 'className',
        label: 'Class',
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
            {value.map((division: string) => (
              <Chip
                key={division}
                label={division}
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
        id: 'status',
        label: 'Status',
        render: (value, row) =>
          value === 'Published' ? (
            <Label variant="soft" color="primary">
              {value}
            </Label>
          ) : (
            <Label
              variant="soft"
              color="warning"
              onClick={() => onRequestPublish(row as IClassAnnouncement)}
              sx={{ cursor: 'pointer' }}
            >
              {value}
            </Label>
          ),
      },
      {
        id: 'action',
        label: 'Action',
        isSort: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-top"
              showEditIcon
              showDeleteIcon
              showViewIcon
              showThreeDots={false}
              handleEditClick={() => onEdit(row as IClassAnnouncement)}
              handleDeleteClick={() => onDelete(row.id)}
              handleViewClick={() => onView(row as IClassAnnouncement)}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default ClassWiseAnnouncementTable;
