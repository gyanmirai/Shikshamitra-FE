import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { useState, useEffect, useCallback } from 'react';

import Table from '@mui/material/Table';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import {
  Paper,
  Button,
  MenuList,
  MenuItem,
  Collapse,
  TableBody,
  IconButton,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Scrollbar } from 'src/components/scrollbar';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';

// ----------------------------------------------------------------------

// interface Standard {
//   id: string;
//   creationTime: string;
//   creatorId: string;
//   lastModificationTime: string;
//   lastModifierId: string;
//   name: string;
//   divisions: Division[];
//   educationMediumStageId: string;
// }

interface CustomAcademicTableProps {
  id: string | number;
  name: string;
  getLazyQuery: () => void;
  deleteMutation: () => void;
  formComp: (props: any) => React.ReactNode;
  children?: CustomAcademicTableProps;
  dataKey: string;
  isParent?: boolean;
}

export const CustomAcademicTable = ({
  id,
  getLazyQuery,
  deleteMutation,
  formComp,
  name,
  children = undefined,
  dataKey,
  isParent = false,
}: CustomAcademicTableProps) => {
  const [getData, { data, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: getLazyQuery,
  });
  useEffect(() => {
    getData(id);
  }, [getData, id]);

  const [editData, setEditData] = useState<null | Record<string, any>>(null);
  const modal = useBoolean(false);
  const onCloseDialog = async () => {
    modal.onFalse();
    setEditData(null);
    await getData(id);
  };
  const handleAdd = () => {
    modal.onTrue();
  };
  return (
    <Scrollbar>
      <CustomDialog
        title={editData ? `Update ${name}` : `Create ${name}`}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        {formComp({ editData, onCloseDialog, id })}
      </CustomDialog>
      <Table sx={{ minWidth: 800, '& *': { fontSize: '12px !important' } }} size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: '10%' }} />
            <TableCell align="center">
              {name} {/* {isParent && ( */}
              {/* <Iconify
                icon="zondicons:add-solid"
                sx={{ color: 'primary.main', cursor: 'pointer' }}
                onClick={handleAdd}
              /> */}
              {/* )} */}
            </TableCell>
            {children && <TableCell align="center">Total {children.name}</TableCell>}
            <TableCell align="center">Action</TableCell>
            <TableCell align="right">
              <Button
                variant="outlined"
                startIcon={<Add />}
                // sx={{ maxWidth: '15%', width: '100%' }}
                size="small"
                onClick={handleAdd}
              >
                {name}
              </Button>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {!isLoading ? (
            data?.[dataKey]?.length ? (
              data?.[dataKey]?.map((row: Record<string, any>) => (
                <CollapsibleTableRow
                  key={row.name}
                  row={row}
                  modal={modal}
                  editData={editData}
                  setEditData={setEditData}
                  getData={getData}
                  id={id}
                  name={name}
                  deleteMutation={deleteMutation}
                  children={children}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No Data Found
                </TableCell>
              </TableRow>
            )
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="left">
                <CircularProgress size={20} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Scrollbar>
  );
};

// export function AcademicTable({ mediumId }: AcademicTableProps) {
//   const [getMedium, { data, isLoading }] = useQueryAndMutation({
//     type: 'mutation',
//     currentQueryAndMutation: useLazyGetMediumByIdQuery,
//   });

//   useEffect(() => {
//     getMedium(mediumId);
//   }, [getMedium, mediumId]);

//   const [editData, setEditData] = useState<null | EducationMediumStage>(null);
//   const modal = useBoolean(false);

//   const onCloseDialog = async () => {
//     modal.onFalse();
//     setEditData(null);
//     await getMedium(mediumId);
//   };
//   const handleAddOrganization = () => {
//     modal.onTrue();
//   };
//   return (
//     <Scrollbar>
//       <CustomDialog
//         title={editData ? 'Update Organization' : 'Create Organization'}
//         handleClose={onCloseDialog}
//         open={modal.value}
//       >
//         <OrganizationForm
//           mediumId={mediumId}
//           handleClose={onCloseDialog}
//           //   handleSetTeb={handleSetTeb}
//           editData={editData}
//         />
//       </CustomDialog>
//       <Table sx={{ minWidth: 800, '& *': { fontSize: '12px !important' } }} size="small">
//         <TableHead>
//           <TableRow>
//             <TableCell />
//             <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               Organization{' '}
//               <Iconify
//                 icon="zondicons:add-solid"
//                 sx={{ color: 'primary.main', cursor: 'pointer' }}
//                 onClick={handleAddOrganization}
//               />
//             </TableCell>
//             <TableCell align="center">Class</TableCell>
//             <TableCell align="center">Division</TableCell>
//           </TableRow>
//         </TableHead>

//         <TableBody>
//           {!isLoading ? (
//             data?.educationMediumStages?.map((row: EducationMediumStage) => (
//               <CollapsibleTableRow
//                 key={row.name}
//                 row={row}
//                 modal={modal}
//                 editData={editData}
//                 setEditData={setEditData}
//                 getMedium={getMedium}
//                 mediumId={mediumId}
//               />
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={6} align="left">
//                 <CircularProgress size={20} />
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </Scrollbar>
//   );
// }

// ----------------------------------------------------------------------

type CollapsibleTableRowProps = {
  row: Record<string, any>;
  modal: UseBooleanReturn;
  setEditData: (data: Record<string, any> | null) => void;
  editData: Record<string, any> | null;
  getData: (id: string | number) => void;
  id: string | number;
  deleteMutation: any;
  name: string;
  children?: CustomAcademicTableProps | undefined;
};

function CollapsibleTableRow({
  row,
  modal,
  setEditData,
  editData,
  getData,
  id,
  deleteMutation,
  name,
  children,
}: CollapsibleTableRowProps) {
  const collapsible = useBoolean();
  const confirm = useBoolean(false);
  const [childEditData, setChildEditData] = useState<CustomAcademicTableProps | undefined>(
    undefined
  );
  const [deleteOrganization, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: deleteMutation,
    popupConfig: {
      success: true,
      successMessage: `${name} deleted Successfully`,
    },
  });
  const childModal = useBoolean(false);

  const actions = useCallback(
    ({ popover }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            modal.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
        {/* {children && (
          <MenuItem
            onClick={() => {
              childModal.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="ic:baseline-add" sx={{ height: '16px', width: '16px' }} />
            Create {childEditData?.name}
          </MenuItem>
        )} */}
      </MenuList>
    ),
    [confirm, modal]
  );
  const onCloseDialog = () => {
    setChildEditData(undefined);
    // await getData(id);
    childModal.onFalse();
    // collapsible.onFalse();
    // setTimeout(() => {
    //   collapsible.onTrue();
    // }, 1000);
  };
  return (
    <>
      <CustomDialog
        title={`Create ${childEditData?.name || ''}`}
        handleClose={onCloseDialog}
        open={childModal.value}
      >
        {childEditData?.formComp({ editData: null, onCloseDialog, id: row.id })}
      </CustomDialog>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            onClick={async () => {
              await deleteOrganization(editData?.id || '');
              await getData(id);
              confirm.onFalse();
              setEditData(null);
              // isInitial.current = true;
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
        <TableCell align="center">
          {children && (
            <IconButton
              size="small"
              color={collapsible.value ? 'inherit' : 'default'}
              onClick={collapsible.onToggle}
            >
              <Iconify
                icon={
                  collapsible.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'
                }
              />
            </IconButton>
          )}
        </TableCell>
        <TableCell align="center">{`${row.name}${row?.strength ? ` (${row.strength})` : ''}`}</TableCell>
        {children && <TableCell align="center">{row[children.dataKey].length}</TableCell>}

        <TableCell align="center" sx={{ display: 'flex', justifyContent: 'center' }}>
          <ThreeDotsActions
            showDeleteIcon
            showEditIcon
            handleDeleteClick={() => {
              confirm.onTrue();
              setEditData(row);
              if (children) {
                setChildEditData(children);
              }
            }}
            handleEditClick={() => {
              setEditData(row);
              if (children) {
                setChildEditData(children);
              }
              modal.onTrue();
            }}
            showThreeDots={false}
          />
        </TableCell>
        <TableCell align="right" />
      </TableRow>

      <TableRow>
        <TableCell align="center" sx={{ py: 0 }} colSpan={6}>
          <Collapse in={collapsible.value} timeout="auto" unmountOnExit>
            <Paper
              variant="outlined"
              sx={{
                py: 2,
                mb: 2,
                borderRadius: 1.5,
                ...(collapsible.value && { boxShadow: (theme) => theme.customShadows.z20 }),
              }}
            >
              {children && <CustomAcademicTable {...children} id={row.id} />}
            </Paper>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
