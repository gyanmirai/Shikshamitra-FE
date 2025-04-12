import dayjs from 'dayjs';

import { Box, Chip, Typography } from '@mui/material';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { ISurvey, IScheduledSurveyTableProps } from '../type';

const ScheduledSurveyTable = ({ data, onDelete, onEdit, onView }: IScheduledSurveyTableProps) => (
  <CustomizableTable
    tableId="survey-table"
    columns={[
      { id: 'surveyTitle', label: 'Survey Title' },
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
        id: 'classes',
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
      {
        id: 'startDate',
        label: 'Start Date',
        render: (value) => (
          <Typography fontSize="12px" gutterBottom>
            {dayjs(value).format('DD MMM YYYY')}
          </Typography>
        ),
      },
      {
        id: 'endDate',
        label: 'End Date',
        render: (value) => (
          <Typography fontSize="12px" gutterBottom>
            {dayjs(value).format('DD MMM YYYY')}
          </Typography>
        ),
      },
      {
        id: 'action',
        sticky: true,
        label: 'Action',
        isSort: false,
        render: (_value, row) => (
          <ThreeDotsActions
            placement="right-top"
            showEditIcon
            showDeleteIcon
            showViewIcon
            showThreeDots={false}
            handleViewClick={() => onView(row as ISurvey)}
            handleEditClick={() => onEdit(row as ISurvey)}
            handleDeleteClick={() => onDelete(row.id)}
          />
        ),
      },
    ]}
    data={data}
  />
);

export default ScheduledSurveyTable;
