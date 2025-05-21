// components/ChapterTable.tsx
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IChapter, IChapterTableProps } from '../type';

const ChapterTable = ({
  addChapterDialog,
  onDelete,
  setEditData,
  data,
  actions,
  handleEyeClick,
  onViewDocuments,
}: IChapterTableProps) => (
  <CustomizableTable
    tableId="chapterTable"
    searchFieldProps={{
      placeholder: 'Search by Chapter No, Chapter Name, Start Date, End Date...',
      label: 'Search by Chapter No, Chapter Name, Start Date, End Date...',
      sx: {
        maxWidth: '500px',
        width: '100%',
      },
    }}
    noDataText={
      <>
        No Chapters Found{' '}
        <Box
          onClick={() => {
            addChapterDialog.onTrue();
            setEditData(null);
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
          Add Chapter
        </Box>
      </>
    }
    columns={[
      {
        id: 'chapterNo',
        label: 'Chapter No',
        align: 'left',
        filterType: 'number',
      },
      {
        id: 'chapterName',
        label: 'Chapter Name',
        align: 'left',
        filterType: 'string',
      },
      {
        id: 'startDate',
        label: 'Start Date',
        align: 'left',
        filterType: 'date',
      },
      {
        id: 'endDate',
        label: 'End Date',
        align: 'left',
        filterType: 'date',
      },
      {
        id: 'viewMaterial',
        label: 'View Material',
        isFilter: false,
        isSort: false,
        align: 'center',
        render(value, row) {
          return (
            <IconButton
              onClick={() => {
                onViewDocuments(row as IChapter);
              }}
            >
              <Iconify icon={GlobalIcons.eye} />
            </IconButton>
          );
        },
      },
      {
        id: 'progress',
        label: 'Progress',
        align: 'left',
        filterType: 'number',
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
        label: 'Action',
        minWidth: 70,
        isSort: false,
        isFilter: false,
        align: 'center',
        sticky: true,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showEditIcon
              showDeleteIcon
              handleViewClick={() => handleEyeClick(row.subjectName)}
              handleEditClick={() => {
                setEditData(row as IChapter);
                addChapterDialog.onTrue();
              }}
              handleDeleteClick={() => onDelete(row as IChapter)}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default ChapterTable;
