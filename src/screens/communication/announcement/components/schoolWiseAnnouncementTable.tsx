import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Box, Chip, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { getImportanceLevelColor } from './getImportantColor';

import type { ISchoolWiseAnnouncement, SchoolWiseAnnouncementTableProps } from '../type';

const SchoolWiseAnnouncementTable = ({
  data,
  onEdit,
  onDelete,
  onView,
  onPublish,
}: SchoolWiseAnnouncementTableProps) => (
  <CustomizableTable
    tableId="school-wise-announcement-table"
    columns={[
      { id: 'title', label: 'Title' },
      {
        id: 'publishDate',
        label: 'Publish Date',
        minWidth: '180px',
        align: 'left',
        render: (value) => (
          <Typography fontSize="12px">{dayjs(value).format('DD MMM YYYY')}</Typography>
        ),
      },
      {
        id: 'expiryDate',
        label: 'Expiry Date',
        minWidth: '180px',
        align: 'left',
        render: (value) => (
          <Typography fontSize="12px">{dayjs(value).format('DD MMM YYYY')}</Typography>
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
            {value.map((aud: string) => (
              <Chip key={aud} label={aud} size="small" variant="outlined" />
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
              onClick={() => onPublish(row as ISchoolWiseAnnouncement)}
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
        render: (_, row) => (
          <ThreeDotsActions
            placement="right-top"
            showEditIcon
            showDeleteIcon
            showViewIcon
            showThreeDots={false}
            handleEditClick={() => onEdit(row as ISchoolWiseAnnouncement)}
            handleDeleteClick={() => onDelete(row.id)}
            handleViewClick={() => onView(row as ISchoolWiseAnnouncement)}
          />
        ),
      },
    ]}
    data={data}
  />
);

export default SchoolWiseAnnouncementTable;
