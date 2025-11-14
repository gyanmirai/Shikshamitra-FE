// components/ChapterTable.tsx
import { Box, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
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
    columns={[
      {
        id: 'chapterNo',
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
        id: 'description',
        label: 'Description',
        align: 'left',
        filterType: 'string',
        render: (value, row) => (
          <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
            <Typography
              variant="caption"
              noWrap
              sx={{
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {value}
            </Typography>
          </CustomTooltip>
        ),
      },
      // {
      //   id: 'viewMaterial',
      //   label: 'Material',
      //   isFilter: false,
      //   isSort: false,
      //   render(value, row) {
      //     return (
      //       <IconButton
      //         onClick={() => {

      //         }}
      //       >
      //         <Iconify icon={GlobalIcons.eye} />
      //       </IconButton>
      //     );
      //   },
      // },
      // {
      //   id: 'progress',
      //   label: 'Progress',
      //   filterType: 'number',
      //   render(value) {
      //     return (
      //       <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      //         <CircularProgress variant="determinate" value={value} />
      //         <Box
      //           sx={{
      //             top: 0,
      //             left: 0,
      //             bottom: 0,
      //             right: 0,
      //             position: 'absolute',
      //             display: 'flex',
      //             alignItems: 'center',
      //             justifyContent: 'center',
      //           }}
      //         >
      //           <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
      //             {value}%
      //           </Typography>
      //         </Box>
      //       </Box>
      //     );
      //   },
      // },
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
    ]}
    data={data}
  />
);

export default ChapterTable;
