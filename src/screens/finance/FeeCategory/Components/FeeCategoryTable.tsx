import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/type';

import React, { useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  feeCategoryApi,
  useGetFeeCategoriesQuery,
  useDeleteFeeCategoryMutation,
} from 'src/redux/feeCategory/feeCategoryApi';

import type { IFeeCategory, IFeeCategoryTableProps } from './type';

const FeeCategoryTable: React.FC<IFeeCategoryTableProps> = ({
  onAddFeeCategory,
  setOpenDialog,
  setEditData,
}) => {
  // Custom hook to fetch fee category data
  const { data: feeCategoryData, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoriesQuery,
  });

  const { currentAcademicYearId } = useSelector((state: RootState) => state.globalState);
  const [deleteFeeCategory, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteFeeCategoryMutation,
    params: { academicYearId: currentAcademicYearId },
  });

  const deleteFeeCategoryDialog = useBoolean();
  const [selectedFeeCategory, setSelectedFeeCategory] = React.useState<IFeeCategory | null>(null);
  const { confirmWithUndo } = useConfirmWithUndo();

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'feeCategoryName',
        label: 'Name',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        render: (value) => (
          <Typography
            variant="caption"
            fontSize="13px"
            sx={{
              maxWidth: 300,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 50,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {
                setSelectedFeeCategory(row as IFeeCategory);
                deleteFeeCategoryDialog.onTrue();
              }}
              handleEditClick={() => {
                setEditData(row as IFeeCategory);
                onAddFeeCategory.onTrue();
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <CustomizableTable
        tableId="fee-category-data-table"
        noDataText={
          <>
            Fee Category Data Not Found{' '}
            <Box
              onClick={() => {
                onAddFeeCategory.onTrue();
                setOpenDialog(true);
                setEditData(null);
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Fee Category
            </Box>
          </>
        }
        columns={columns}
        data={feeCategoryData?.data || []}
      />
      <ConfirmDialog
        open={deleteFeeCategoryDialog.value}
        onClose={() => {
          setSelectedFeeCategory(null);
          deleteFeeCategoryDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete fee category{' '}
            <strong>{selectedFeeCategory?.feeCategoryName}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleteLoading}
            onClick={async () => {
              confirmWithUndo({
                item: selectedFeeCategory,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    feeCategoryApi.util.updateQueryData(
                      'getFeeCategories',
                      undefined,
                      (draft: any) => {
                        const index = draft.data?.findIndex(
                          (b: any) => b.id === (selectedFeeCategory as any)?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.data.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () =>
                  deleteFeeCategory({
                    academicYearId: currentAcademicYearId?.id,
                    id: (selectedFeeCategory as any).id,
                  }),
              });
              deleteFeeCategoryDialog.onFalse();
              setSelectedFeeCategory(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </>
  );
};

export default FeeCategoryTable;
