// components/ChapterTable.tsx
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IChapter, IChapterTableProps } from '../type';

const ChapterTable = ({
  addChapterDialog,
  isLoading,
  onDelete,
  setEditData,
  data,
  actions,
  handleEyeClick,
  onViewDocuments,
  subjectId,
  standardId,
}: IChapterTableProps) => {
  const tableData = useMemo(
    () =>
      data?.map((chapter) => ({
        ...chapter,
        chapterStartTime: chapter.chapterStartTime
          ? dayjs(chapter.chapterStartTime).format('DD-MM-YYYY')
          : '',
        chapterEndTime: chapter.chapterEndTime
          ? dayjs(chapter.chapterEndTime).format('DD-MM-YYYY')
          : '',
      })) || [],
    [data]
  );
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'chapterNumber',
        label: 'Chapter No.',
        align: 'left',
        sticky: true,
        minWidth: 120,
        filterType: 'number',
      },
      {
        id: 'chapterName',
        label: 'Chapter Name',
        align: 'left',
        filterType: 'string',
      },
      {
        id: 'chapterStartTime',
        label: 'Start Date',
        align: 'left',
        filterType: 'date',
      },
      {
        id: 'chapterEndTime',
        label: 'End Date',
        align: 'left',
        filterType: 'date',
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        filterType: 'string',
        render: (value, row) => {
          const plainText = value ? value.replace(/<[^>]*>/g, '') : '';
          return (
            <CustomTooltip
              title={value && <div dangerouslySetInnerHTML={{ __html: value || '' }} />}
              arrow
              sx={{ textAlign: 'justify' }}
            >
              <Typography
                variant="inherit"
                noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  maxWidth: 0,
                  minWidth: '100%',
                }}
              >
                {plainText}
              </Typography>
            </CustomTooltip>
          );
        },
      },

      {
        id: 'actions',
        label: 'Actions',
        minWidth: 90,
        isSort: false,
        isFilter: false,
        align: 'left',
        sticky: true,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showEditIcon
              showDeleteIcon
              showViewIcon
              handleViewClick={() => {
                onViewDocuments(row as IChapter);
              }}
              handleEditClick={() => {
                setEditData(row as IChapter);
                addChapterDialog.onTrue();
              }}
              handleDeleteClick={() => onDelete(row as IChapter)}
            />
          );
        },
      },
    ],
    [addChapterDialog, onDelete, onViewDocuments, setEditData]
  );
  return (
    <CustomizableTable
      tableId="chapterTable"
      isLoading={isLoading}
      noDataText={
        <>
          Chapters Data Not Found{' '}
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
      columns={columns}
      data={tableData}
    />
  );
};

export default ChapterTable;
