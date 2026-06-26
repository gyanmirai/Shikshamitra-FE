// components/ChapterTable.tsx
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Tooltip, IconButton, Typography } from '@mui/material';

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
  onCreateQuestion,
  onViewQuestions,
  subjectId,
  standardId,
  canAdd = true,
  canView = true,
  canDelete = true,
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
        // Keep original HTML for tooltip display
        descriptionHtml: chapter.description || '',
        // Strip HTML for export and table display
        description: chapter.description ? chapter.description.replace(/<[^>]*>/g, '') : '',
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
          // value is already plain text (HTML stripped in tableData), use descriptionHtml for tooltip
          const htmlContent = row.descriptionHtml;
          return (
            <CustomTooltip
              title={
                htmlContent && (
                  <Box
                    sx={{
                      p: 1.5,
                      maxWidth: { xs: 'calc(100vw - 48px)', sm: 420 },
                      maxHeight: 'min(360px, 50vh)',
                      overflow: 'auto',
                      textAlign: 'left',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      lineHeight: 1.45,
                      '& p': { m: 0 },
                      '& p + p': { mt: 1 },
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                )
              }
              arrow
              placement="left-start"
              sx={{
                '& .MuiTooltip-tooltip': {
                  maxWidth: { xs: 'calc(100vw - 48px)', sm: 420 },
                },
              }}
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
                {value}
              </Typography>
            </CustomTooltip>
          );
        },
      },

      {
        id: 'actions',
        label: 'Actions',
        minWidth: 160,
        isSort: false,
        isFilter: false,
        align: 'left',
        sticky: true,
        render(value, row) {
          const chapter = row as IChapter;
          return (
            <Stack direction="row" alignItems="center" spacing={0.25}>
              <Tooltip title="Create Question" placement="top">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateQuestion?.(chapter);
                  }}
                >
                  <Iconify icon="mingcute:question-line" width={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Questions" placement="top">
                <IconButton
                  size="small"
                  color="info"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewQuestions?.(chapter);
                  }}
                >
                  <Iconify icon="mingcute:list-check-line" width={18} />
                </IconButton>
              </Tooltip>
              <ThreeDotsActions
                showThreeDots={false}
                placement="right-top"
                showEditIcon={canAdd}
                showDeleteIcon={canDelete}
                showViewIcon={canView}
                handleViewClick={() => {
                  onViewDocuments(chapter);
                }}
                handleEditClick={() => {
                  setEditData(chapter);
                  addChapterDialog.onTrue();
                }}
                handleDeleteClick={() => onDelete(chapter)}
              />
            </Stack>
          );
        },
      },
    ],
    [
      addChapterDialog,
      canAdd,
      canDelete,
      canView,
      onCreateQuestion,
      onDelete,
      onViewDocuments,
      onViewQuestions,
      setEditData,
    ]
  );
  return (
    <CustomizableTable
      tableId="chapterTable"
      isLoading={isLoading}
      noDataText={<>Chapters Data Not Found </>}
      columns={columns}
      data={tableData}
    />
  );
};

export default ChapterTable;
