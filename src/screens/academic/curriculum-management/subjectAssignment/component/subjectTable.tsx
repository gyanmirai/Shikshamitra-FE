// SubjectTable.tsx

import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo, useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { RemoveCircle } from '@mui/icons-material';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, MenuList, MenuItem, IconButton, Typography } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { PublishUnpublishStatusOptions } from 'src/enums/publishUnpublish-status';

import { SubjectType, SubjectAssignmentStatus } from '../enum/subjectType';

import type { ISubjectTableProps } from './type';

const SubjectTable = ({
  isLoading,
  classId,
  addSubjectDialog,
  subjectTableData,
  setEditData,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  query,
  setQuery,
  totalCount,
}: ISubjectTableProps) => {
  const theme = useTheme();

  const subjectData = useMemo(
    () =>
      subjectTableData?.map((item) => ({
        ...item,
        subjectTypeValue: SubjectType[item.subjectType] || 'Core',
        subjectName: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {item?.subjects?.map((sub: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SubjectColorIndicator color={sub.color} />
                <Typography variant="body2">
                  {sub.subjectName} ({sub.subjectCode})
                </Typography>
              </Box>
            ))}
          </Box>
        ),
        statusValue: SubjectAssignmentStatus[item.status] || 'Draft',
      })) || [],
    [subjectTableData]
  );

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList disablePadding dense>
        <MenuItem
          onClick={() => {
            onDelete(row);
            pop.onClose();
          }}
        >
          <RemoveCircle sx={{ width: '20px', height: '20px', color: 'error.main' }} />
          Remove
        </MenuItem>
      </MenuList>
    ),
    [onDelete]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'subjectTypeValue',
        label: 'Subject Type',
        align: 'left',
        minWidth: 110,
        sticky: true,
        render: (value) => <Typography variant="body2">{value}</Typography>,
      },
      {
        id: 'subjectName',
        label: 'Subject Name',
        align: 'left',
        isFilter: false,
        isSort: false,
      },
      {
        id: 'statusValue',
        label: 'Status',
        align: 'left',
        minWidth: 60,
        isSort: false,
        isFilter: false,
        sticky: true,
        enumOptions: PublishUnpublishStatusOptions,
        render(value, row) {
          const statusColor =
            row.status === SubjectAssignmentStatus.Published
              ? theme.vars.palette.success.main
              : theme.vars.palette.text.secondary;

          return (
            <CustomTooltip title={value} arrow placement="left">
              {/* Using a span or div wrapper to avoid nested button issues if any */}
              <Box component="span">
                <IconButton
                  onClick={() => onToggleStatus(row as any)}
                  sx={{
                    p: 0.6,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.08)' },
                  }}
                >
                  <Iconify
                    icon={GlobalIcons.tick}
                    sx={{ width: 20, height: 20, color: statusColor }}
                  />
                </IconButton>
              </Box>
            </CustomTooltip>
          );
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 70,
        align: 'left',
        sticky: true,
        isSort: false,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-top"
              actions={(prop) => actions({ ...prop, row })}
              showViewIcon
              showEditIcon
              handleViewClick={() => {
                onView(row as any);
              }}
              handleEditClick={() => {
                onEdit(row as any);
              }}
            />
          );
        },
      },
    ],

    [
      actions,
      onEdit,
      onToggleStatus,
      onView,
      theme.vars.palette.success.main,
      theme.vars.palette.text.secondary,
    ]
  );
  return (
    <CustomizableTable
      tableId="subject-table"
      isLoading={isLoading}
      totalCount={totalCount}
      noDataText={
        <>
          No Subject data found
          <Box
            onClick={() => {
              addSubjectDialog.onTrue();
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
            Add Subject
          </Box>
        </>
      }
      serverSidePagination
      onServerPagination={(page, rowPerPage) => {
        setQuery({
          page: page - 1,
          pageSize: rowPerPage,
        });
      }}
      columns={columns}
      data={subjectData}
    />
  );
};

export default SubjectTable;
