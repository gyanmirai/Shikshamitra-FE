'use client';

import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';
import { useState, useEffect, useCallback, cloneElement } from 'react';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Stack,
  Button,
  Select,
  MenuList,
  MenuItem,
  useTheme,
  Typography,
  FormControl,
  DialogActions,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { flattenArray } from 'src/utils/helper';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { useDeleteClassMutation } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useDeleteMediumMutation } from 'src/redux/medium/mediumApi';
import { useDeleteDivisionMutation } from 'src/redux/division/divisionApi';
import { useDeleteOrganizationMutation } from 'src/redux/oraganization/oraganization';
import { boardApi, useGetBoardsQuery, useDeleteBoardMutation } from 'src/redux/board/boardApi';
import {
  useGetYearQuery,
  useAddYearMutation,
  useDeleteYearMutation,
  useUpdateYearMutation,
} from 'src/redux/year/yearApi';

import { Iconify } from '../iconify';
import RenderView from './render-view';
import ZoomAndDrag from '../zoom-drag';
import { BoardForm } from './board-setup';
import { ClassForm } from './class-setup';
import CustomDialog from '../customDialog';
import { MediumForm } from './medium-setup';
import { DivisionForm } from './division-setup';
import { ConfirmDialog } from '../confirm-dialog';
import { ComponentBlock } from '../component-block';
import ThreeDotsActions from '../three-dots-actions';
import { OrganizationForm } from './organization-setup';

type RoleData = {
  name?: string;
  count: number;
  employee?: any[];
  children?: RoleData[];
  depth?: number;
  type: 'Education Board' | 'Standard' | 'Division' | 'Medium' | 'Organization' | 'Academic Year';
  RenderThreeDotsAction?: (props: any) => JSX.Element | null;
  parentsData: OrgChartListProps['parentsData'];
};

export type OrgChartListProps = {
  data: {
    educationMediums?: Medium[];
    educationMediumStages?: Organization[];
    standards?: Standards[];
    divisions?: Division[];
  };
  depth: number;
  nodeItem: (props: any) => React.ReactElement<any>;
  parentsData: {
    medium?: Medium;
    organization?: Organization;
    standard?: Standards;
    division?: Division;
    year?: AcademicYear;
    board?: Board;
  };
};

type OrgChartSubListProps = {
  data: Medium[] | Organization[] | Standards[] | Division[];
  depth: number;
  nodeItem: (props: any) => React.ReactElement<any>;
  parentsData: OrgChartListProps['parentsData'];
};

const Tree = dynamic(() => import('react-organizational-chart').then((mod) => mod.Tree), {
  ssr: false,
});

const TreeNode = dynamic(() => import('react-organizational-chart').then((mod) => mod.TreeNode), {
  ssr: false,
});

const BoardActions = (data: Board & { parentsData: OrgChartListProps['parentsData'] }) => {
  const modal = useBoolean();
  const confirm = useBoolean();
  const [deleteBoard, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteBoardMutation,
    popupConfig: {
      success: true,
      successMessage: 'Board deleted Successfully',
    },
  });
  const dispatch = useDispatch();
  return (
    <>
      <CustomDialog
        title={
          <>
            Create Medium{' '}
            <Typography display="inline-block" variant="subtitle2" color="text.secondary">
              {' '}
              {`(${data?.parentsData?.year?.name} > ${data?.name})`}
            </Typography>
          </>
        }
        handleClose={modal.onFalse}
        open={modal.value}
      >
        <MediumForm handleClose={modal.onFalse} editData={null} boardId={data?.id} />
      </CustomDialog>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
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
              await deleteBoard(data?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <ThreeDotsActions
        sx={{
          position: 'absolute',
          right: '0px',
          top: '8px',
        }}
        actions={({ popover }) => (
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
              <Iconify icon="octicon:mortar-board-24" sx={{ height: '16px', width: '16px' }} />
              Add Medium
            </MenuItem>
          </MenuList>
        )}
      />
    </>
  );
};

const MediumActions = (data: Medium & { parentsData: OrgChartListProps['parentsData'] }) => {
  const modal = useBoolean();
  const { parentsData } = data;

  const { id: boardId = '' } = (parentsData?.board as Board) || {};
  const confirm = useBoolean();
  const edit = useBoolean();
  const [deleteMedium, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteMediumMutation,
    popupConfig: {
      success: true,
      successMessage: 'Medium deleted Successfully',
    },
  });
  const dispatch = useDispatch();
  return (
    <>
      <CustomDialog
        title={
          <>
            Create Organization{' '}
            <Typography display="inline-block" variant="subtitle2" color="text.secondary">
              {' '}
              {`(${data?.parentsData?.year?.name} > ${data?.parentsData?.board?.name} >  ${data?.name})`}
            </Typography>
          </>
        }
        handleClose={modal.onFalse}
        open={modal.value}
      >
        <OrganizationForm handleClose={modal.onFalse} editData={null} mediumId={data?.id} />
      </CustomDialog>
      <CustomDialog
        title={
          <>
            Update Medium{' '}
            <Typography display="inline-block" variant="subtitle2" color="text.secondary">
              {' '}
              {`(${data?.parentsData?.year?.name} > ${data?.parentsData?.board?.name})`}
            </Typography>
          </>
        }
        handleClose={edit.onFalse}
        open={edit.value}
      >
        <MediumForm handleClose={edit.onFalse} editData={data} boardId={boardId} />
      </CustomDialog>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
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
              await deleteMedium(data?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <ThreeDotsActions
        sx={{
          position: 'absolute',
          right: '0px',
          top: '8px',
        }}
        actions={({ popover }) => (
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
                edit.onTrue();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                modal.onTrue();
                popover.onClose();
              }}
            >
              <Iconify icon="ri:add-line" sx={{ height: '16px', width: '16px' }} />
              Add Organization
            </MenuItem>
          </MenuList>
        )}
      />
    </>
  );
};

const StandardActions = (data: Standards & { parentsData: OrgChartListProps['parentsData'] }) => {
  const modal = useBoolean();
  const confirm = useBoolean();
  const { parentsData } = data;
  const { id: organizationId = '' } = (parentsData?.organization as Organization) || {};
  const edit = useBoolean();
  const [deleteClass, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteClassMutation,
    popupConfig: {
      success: true,
      successMessage: 'Class deleted Successfully',
    },
  });
  const dispatch = useDispatch();
  return (
    <>
      <CustomDialog
        title={
          <>
            Create Division{' '}
            <Typography display="inline-block" variant="subtitle2" color="text.secondary">
              {' '}
              {`(${data?.parentsData?.year?.name} > ${data?.parentsData?.board?.name} > ${data?.parentsData?.medium?.name} > ${data?.parentsData?.organization?.name} > ${data?.name})`}
            </Typography>
          </>
        }
        handleClose={modal.onFalse}
        open={modal.value}
      >
        <DivisionForm handleClose={modal.onFalse} editData={null} classId={data?.id} />
      </CustomDialog>
      <CustomDialog
        title={
          <>
            Update Standard{' '}
            <Typography display="inline-block" variant="subtitle2" color="text.secondary">
              {' '}
              {`(${data?.parentsData?.year?.name} > ${data?.parentsData?.board?.name} > ${data?.parentsData?.medium?.name} > ${data?.parentsData?.organization?.name})`}
            </Typography>
          </>
        }
        handleClose={edit.onFalse}
        open={edit.value}
      >
        <ClassForm handleClose={edit.onFalse} editData={data} organizationId={organizationId} />
      </CustomDialog>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
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
              await deleteClass(data?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <ThreeDotsActions
        sx={{
          position: 'absolute',
          right: '0px',
          top: '8px',
        }}
        actions={({ popover }) => (
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
                edit.onTrue();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                modal.onTrue();
                popover.onClose();
              }}
            >
              <Iconify icon="ri:add-line" sx={{ height: '16px', width: '16px' }} />
              Add Division
            </MenuItem>
          </MenuList>
        )}
      />
    </>
  );
};

const DivisionActions = (data: Division & { parentsData: OrgChartListProps['parentsData'] }) => {
  const modal = useBoolean();
  const confirm = useBoolean();
  const edit = useBoolean();
  const { parentsData } = data;
  const { id: standardId = '' } = (parentsData?.standard as Standards) || {};
  const [deleteDivision, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteDivisionMutation,
    popupConfig: {
      success: true,
      successMessage: 'Division deleted Successfully',
    },
  });
  const dispatch = useDispatch();

  return (
    <>
      <CustomDialog
        title={
          <>
            Update Division{' '}
            <Typography display="inline-block" variant="subtitle2" color="text.secondary">
              {' '}
              {`(${data?.parentsData?.year?.name} > ${data?.parentsData?.board?.name}> ${data?.parentsData?.medium?.name} > ${data?.parentsData?.organization?.name}) > ${data?.parentsData?.standard?.name}`}
            </Typography>
          </>
        }
        handleClose={edit.onFalse}
        open={edit.value}
      >
        <DivisionForm handleClose={edit.onFalse} editData={data} classId={standardId} />
      </CustomDialog>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
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
              await deleteDivision(data?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <ThreeDotsActions
        sx={{
          position: 'absolute',
          right: '0px',
          top: '8px',
        }}
        actions={({ popover }) => (
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
                edit.onTrue();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
              Edit
            </MenuItem>
          </MenuList>
        )}
      />
    </>
  );
};
const OrganizationActions = (
  data: Organization & { parentsData: OrgChartListProps['parentsData'] }
) => {
  const modal = useBoolean();
  const confirm = useBoolean();
  const edit = useBoolean();

  const { parentsData } = data;
  const { id: mediumId = '' } = (parentsData?.medium as Medium) || {};
  const [deleteOrganization, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteOrganizationMutation,
    popupConfig: {
      success: true,
      successMessage: 'Organization deleted Successfully',
    },
  });
  const dispatch = useDispatch();
  return (
    <>
      <CustomDialog
        title={
          <>
            Create Standard{' '}
            <Typography display="inline-block" variant="subtitle2" color="text.secondary">
              {' '}
              {`(${data?.parentsData?.year?.name} > ${data?.parentsData?.board?.name} > ${data?.parentsData?.medium?.name} > ${data?.parentsData?.organization?.name})`}
            </Typography>
          </>
        }
        handleClose={modal.onFalse}
        open={modal.value}
      >
        <ClassForm handleClose={modal.onFalse} editData={null} organizationId={data?.id} />
      </CustomDialog>
      <CustomDialog
        title={
          <>
            Update Organization{' '}
            <Typography display="inline-block" variant="subtitle2" color="text.secondary">
              {' '}
              {`(${data?.parentsData?.year?.name} > ${data?.parentsData?.board?.name} > ${data?.parentsData?.medium?.name})`}
            </Typography>
          </>
        }
        handleClose={edit.onFalse}
        open={edit.value}
      >
        <OrganizationForm handleClose={edit.onFalse} editData={data} mediumId={mediumId} />
      </CustomDialog>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
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
              await deleteOrganization(data?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <ThreeDotsActions
        sx={{
          position: 'absolute',
          right: '0px',
          top: '8px',
        }}
        actions={({ popover }) => (
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
                edit.onTrue();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                modal.onTrue();
                popover.onClose();
              }}
            >
              <Iconify icon="ri:add-line" sx={{ height: '16px', width: '16px' }} />
              Add Standard
            </MenuItem>
          </MenuList>
        )}
      />
    </>
  );
};

export function TreeList({ data, depth, nodeItem, parentsData }: OrgChartListProps) {
  const childs =
    data?.educationMediums ||
    data?.educationMediumStages ||
    data?.standards ||
    data?.divisions ||
    [];

  let type: RoleData['type'] = 'Education Board';
  let RenderThreeDotsAction: (data: any) => JSX.Element | null = () => null;
  const newParentsData = { ...parentsData };
  if (data?.educationMediums) {
    type = 'Education Board';
    RenderThreeDotsAction = (prop) => BoardActions({ ...prop, parentsData: newParentsData });
    newParentsData.board = data as Board;
  } else if (data?.educationMediumStages) {
    type = 'Medium';
    RenderThreeDotsAction = (prop) => MediumActions({ ...prop, parentsData: newParentsData });
    newParentsData.medium = data as Medium;
  } else if (data?.standards) {
    type = 'Organization';
    RenderThreeDotsAction = (prop) => OrganizationActions({ ...prop, parentsData: newParentsData });
    newParentsData.organization = data as Organization;
  } else if (data?.divisions) {
    type = 'Standard';
    RenderThreeDotsAction = (prop) => StandardActions({ ...prop, parentsData: newParentsData });
    newParentsData.standard = data as Standards;
  } else {
    type = 'Division';
    RenderThreeDotsAction = (prop) => DivisionActions({ ...prop, parentsData: newParentsData });
    newParentsData.division = data as Division;
  }

  const cloneNode = (props: RoleData) => cloneElement(nodeItem(props));

  // @ts-ignore
  const totalChildren = childs ? flattenArray(childs).length : 0;

  const label = cloneNode({
    ...data,
    depth,
    count: totalChildren,
    type,
    RenderThreeDotsAction,
    parentsData: newParentsData,
  });

  return (
    <TreeNode label={label}>
      {childs?.length > 0 && (
        <TreeSubList data={childs} depth={depth} nodeItem={nodeItem} parentsData={newParentsData} />
      )}
    </TreeNode>
  );
}
function TreeSubList({ data, depth, nodeItem, parentsData }: OrgChartSubListProps) {
  return (
    <>
      {data.map((list: any, index) => (
        <TreeList
          key={index}
          data={list}
          depth={depth + 1}
          nodeItem={nodeItem}
          parentsData={parentsData}
        />
      ))}
    </>
  );
}

interface AcademicYear {
  id: string;
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
  name: string;
  startDate?: string;
  endDate?: string;
}

const YearSetup = () => {
  const theme = useTheme();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const { data: years, isLoading: isYearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
    options: {
      refetchOnMountOrArgChange: true,
    },
  });

  const [deleteYear, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteYearMutation,
    popupConfig: {
      success: true,
      successMessage: 'Academic Year deleted Successfully',
    },
  });
  const [editData, setEditData] = useState<null | AcademicYear>(null);

  const tabs = useTabs('');
  const modal = useBoolean(false);
  const confirm = useBoolean(false);
  const boardDialog = useBoolean(false);

  useEffect(() => {
    if (years?.items?.length) {
      setSelectedAcademicYear(years?.items?.[0]?.id);
    }
  }, [years?.items]);

  const handelAdd = useCallback(() => {
    modal.onTrue();
  }, [modal]);

  const handleSetTeb = (value: Record<string, any>) => {
    tabs.setValue(value?.data?.id);
  };

  const onCloseDialog = () => {
    modal.onFalse();
    setEditData(null);
  };

  const actions = useCallback(
    ({ popover: pop, data }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              setEditData(data);
              confirm.onTrue();
              pop.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
            Delete
          </MenuItem>

          <MenuItem
            onClick={() => {
              setEditData(data);
              modal.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              modal.onTrue();
              handelAdd();
              pop.onClose();
            }}
          >
            <Iconify icon="ri:add-line" sx={{ height: '16px', width: '16px' }} />
            Add Academic Year
          </MenuItem>
          <MenuItem
            onClick={() => {
              boardDialog.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="octicon:mortar-board-24" sx={{ height: '16px', width: '16px' }} />
            Add Education Board
          </MenuItem>
        </MenuList>
      </>
    ),
    [boardDialog, confirm, handelAdd, modal]
  );

  const currentAcademicYear = selectedAcademicYear
    ? years?.items?.find((item: any) => item.id === selectedAcademicYear)
    : years?.items?.[0];

  const { data: boardsData, isLoading: isBoardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  const boards =
    boardsData?.items?.filter((item: Board) => item?.academicYearId === currentAcademicYear?.id) ||
    [];
  return (
    <Box sx={{ height: '100%' }}>
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
              await deleteYear(editData?.id || '');
              confirm.onFalse();
              tabs.setValue('');
              setEditData(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <CustomDialog
        title={editData ? 'Update Academic Year' : 'Create Academic Year'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        <YearForm handleClose={onCloseDialog} handleSetTeb={handleSetTeb} editData={editData} />
      </CustomDialog>
      <CustomDialog
        title="Create Education Board"
        handleClose={boardDialog.onFalse}
        open={boardDialog.value}
      >
        <BoardForm
          handleClose={boardDialog.onFalse}
          handleSetTeb={handleSetTeb}
          academicYearId={selectedAcademicYear}
          editData={null}
          boards={boards}
        />
      </CustomDialog>
      <ComponentBlock title="Academic Setup" sx={{ height: '100%', mt: 2 }}>
        {isYearLoading || isBoardLoading ? (
          <Box className="loader" />
        ) : (
          <ZoomAndDrag>
            <Box>
              <Tree
                lineWidth="1px"
                nodePadding="4px"
                lineBorderRadius="24px"
                lineColor={theme.vars.palette.text.disabled}
                label={
                  <RenderView
                    type="Academic Year"
                    nameValue={
                      <FormControl sx={{ minWidth: 120 }} size="small">
                        <Select
                          labelId="academic-year-select-label"
                          id="academic-year-select"
                          value={selectedAcademicYear}
                          label="Academic Year"
                          onChange={(e) => setSelectedAcademicYear(e.target.value)}
                          size="small"
                          variant="standard"
                        >
                          {years?.items?.map((tab: AcademicYear) => (
                            <MenuItem key={tab.id} value={tab.id}>
                              {tab.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    }
                    RenderThreeDotsAction={(data) => (
                      <ThreeDotsActions
                        actions={({ popover }) => actions({ popover, data })}
                        sx={{
                          position: 'absolute',
                          right: '0px',
                          top: '8px',
                        }}
                      />
                    )}
                    id={currentAcademicYear?.id || ''}
                    name={currentAcademicYear?.name || ''}
                    creationTime={currentAcademicYear?.creationTime || ''}
                    creatorId={currentAcademicYear?.creatorId || ''}
                    lastModificationTime={currentAcademicYear?.lastModificationTime || ''}
                    lastModifierId={currentAcademicYear?.lastModifierId || ''}
                    startDate={currentAcademicYear?.startDate || ''}
                    endDate={currentAcademicYear?.endDate || ''}
                  />
                }
              >
                {boards?.map((list: Board, ind: number) => (
                  <TreeList
                    key={ind}
                    depth={1}
                    data={list}
                    nodeItem={(props) => <RenderView {...props} />}
                    parentsData={{
                      year: currentAcademicYear,
                    }}
                  />
                ))}
              </Tree>
            </Box>
          </ZoomAndDrag>
        )}
      </ComponentBlock>
    </Box>
  );
};
export default YearSetup;

interface IYearForm {
  handleClose: () => void;
  handleSetTeb: (value: Record<string, any>) => void;
  editData: null | Record<string, any>;
}
const YearForm = ({ handleClose, handleSetTeb, editData }: IYearForm) => {
  const confirm = useBoolean();
  const [addYear, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddYearMutation,
    popupConfig: {
      success: true,
      successMessage: 'Academic Year added Successfully',
      // error: true,
    },
  });
  const [updateYear, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateYearMutation,
    popupConfig: {
      success: true,
      successMessage: 'Academic Year updated Successfully',
    },
  });

  const onSubmit = async () => {
    try {
      if (editData) {
        const res = await updateYear({
          id: editData.id,
          body: {
            name: `${formik.values.startDate.format('YYYY')}-${formik.values.endDate.format('YYYY')}`,
            startDate: dateConvertor(formik.values.startDate.format(dateFormat)),
            endDate: dateConvertor(formik.values.endDate.format(dateFormat)),
          },
        }).unwrap();
      } else {
        const res = await addYear({
          name: `${formik.values.startDate.format('YYYY')}-${formik.values.endDate.format('YYYY')}`,
          startDate: dateConvertor(formik.values.startDate.format(dateFormat)),
          endDate: dateConvertor(formik.values.endDate.format(dateFormat)),
        }).unwrap();
      }
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  const formik = useFormik({
    initialValues: {
      startDate: editData
        ? dayjs(editData.startDate)
        : dayjs().year(dayjs().year()).month(2).date(1),
      endDate: editData
        ? dayjs(editData.endDate)
        : dayjs()
            .year(dayjs().year() + 1)
            .month(1)
            .endOf('month'),
    },
    validationSchema: Yup.object().shape({
      startDate: Yup.date().required('Start Date is required'),
      endDate: Yup.date().required('End Date is required'),
    }),
    onSubmit: async (values) => {
      confirm.onTrue();
    },
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
        }}
        title={`${editData ? 'Update' : 'Create'}`}
        content={`Are you sure want to ${editData ? 'Update' : 'Create'} Academic Year ?`}
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading || isUpdateLoading}
            // color="error"
            onClick={onSubmit}
          >
            Confirm
          </LoadingButton>
        }
      />
      <Stack spacing={2} direction="column" p={2}>
        <DatePicker
          label="Start Date"
          name="startDate"
          autoFocus
          value={formik.values.startDate}
          format="DD-MMM-YYYY"
          onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
          slotProps={{
            textField: {
              size: 'small',
              helperText: formik.touched.startDate && (formik.errors.startDate as string),
              error: formik.touched.startDate && Boolean(formik.errors.startDate),
              autoFocus: true,
            },
          }}
        />

        <DatePicker
          label="End Date"
          name="endDate"
          value={formik.values.endDate}
          format="DD-MMM-YYYY"
          onChange={(newValue) => formik.setFieldValue('endDate', newValue)}
          slotProps={{
            textField: {
              size: 'small',
              helperText: formik.touched.endDate && (formik.errors.endDate as string),
              error: formik.touched.endDate && Boolean(formik.errors.endDate),
            },
          }}
        />
        <DialogActions sx={{ p: 0 }}>
          <Button variant="outlined" size="small" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton
            loading={isLoading || isUpdateLoading}
            type="submit"
            variant="contained"
            size="small"
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Stack>
    </Box>
  );
};
