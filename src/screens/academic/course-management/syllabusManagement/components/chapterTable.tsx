// components/ChapterTable.tsx
import { Box, Chip, Typography, CircularProgress } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IChapter, IChapterTableProps } from '../type';

const ChapterTable = ({ data, actions, handleEyeClick }: IChapterTableProps) => (
  <CustomizableTable
    tableId="subjectTable"
    columns={[
      {
        id: 'chapterNo',
        label: 'Chapter No',
        minWidth: '130px',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'chapterName',
        label: 'Chapter Name',
        minWidth: '180px',
        align: 'left',
        filterType: 'string',
      },
      {
        id: 'startDate',
        label: 'Start Date',
        minWidth: '120px',
        align: 'left',
        filterType: 'date',
      },
      {
        id: 'endDate',
        label: 'End Date',
        minWidth: '120px',
        align: 'left',
        filterType: 'date',
      },
      {
        id: 'assignedTeacher',
        label: 'Secondary Teacher',
        minWidth: '200px',
        align: 'left',
        render: (value) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {value.map((audience: string) => (
              <Chip key={audience} label={audience} size="small" variant="outlined" />
            ))}
          </Box>
        ),
      },
      {
        id: 'viewMaterial',
        label: 'View Material',
        minWidth: '150px',
        align: 'left',
        isFilter: false,
        render() {
          return <Iconify icon="mdi:eye" sx={{ ml: 7 }} />;
        },
      },
      {
        id: 'progress',
        label: 'Progress',
        minWidth: '150px',
        align: 'left',
        render(value) {
          return (
            <Box sx={{ position: 'relative', display: 'inline-flex', ml: 7 }}>
              <CircularProgress variant="determinate" value={value} />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                  {value}%
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: '200px',
        isSort: false,
        isFilter: false,
        align: 'left',
        sticky: true,
        render(value, row) {
          return (
            <ThreeDotsActions
              actions={(prop) => actions({ ...prop, row: row as IChapter })}
              placement="right-top"
              showEditIcon
              showViewIcon
              showDeleteIcon
              handleViewClick={() => handleEyeClick(row.subjectName)}
              handleEditClick={() => {}}
              handleDeleteClick={() => {}}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default ChapterTable;
