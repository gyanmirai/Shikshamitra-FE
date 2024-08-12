import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { useState, useEffect, useCallback } from 'react';

import Table from '@mui/material/Table';
import { LoadingButton } from '@mui/lab';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import {
  Paper,
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

interface EducationMediumStage {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  educationMediumId: string;
  name: string;
  standards: Standard[];
}

interface Standard {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  divisions: Division[];
  educationMediumStageId: string;
}

interface Division {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  strength: number;
  standardId: string;
}
interface AcademicTableProps {
  mediumId: string;
}
interface CustomAcademicTableProps {
  id: string;
  name: string;
  getLazyQuery: () => void;
  deleteMutation: () => void;
  formComp: (props: any) => React.ReactNode;
  children?: CustomAcademicTableProps;
  dataKey: string;
}

export const CustomAcademicTable = ({
  id,
  getLazyQuery,
  deleteMutation,
  formComp,
  name,
  children = undefined,
  dataKey,
}: CustomAcademicTableProps) => {
  const [getData, { data, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: getLazyQuery,
  });
  console.log(children, 'children');
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
            <TableCell sx={{ width: '10%' }} />
            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {name}{' '}
              <Iconify
                icon="zondicons:add-solid"
                sx={{ color: 'primary.main', cursor: 'pointer' }}
                onClick={handleAdd}
              />
            </TableCell>
            {/* <TableCell align="center">Class</TableCell>
            <TableCell align="center">Division</TableCell> */}
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
  getData: (id: string) => void;
  id: string;
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
  const [deleteOrganization, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: deleteMutation,
    popupConfig: {
      success: true,
      successMessage: `${name} deleted Successfully`,
    },
  });

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
      </MenuList>
    ),
    [confirm, modal]
  );

  return (
    <>
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
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
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
        <TableCell component="th" scope="row">
          {`${row.name}${row?.strength ? ` (${row.strength})` : ''}`}
          <ThreeDotsActions onClickThreeDots={() => setEditData(row)} actions={actions} />
        </TableCell>
        {/* <TableCell align="right">{row.calories}</TableCell>
        <TableCell align="right">{row.fat}</TableCell>
        <TableCell align="right">{row.carbs}</TableCell>
        <TableCell align="right">{row.protein}</TableCell> */}
      </TableRow>

      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={6}>
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
