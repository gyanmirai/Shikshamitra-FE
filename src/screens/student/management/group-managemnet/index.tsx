import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { StudentApi } from 'src/redux/student';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { DashboardCard } from 'src/components/dashboard-card';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Grid,
  Alert,
  Stack,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';
import {
  useGetAllGroupQuery,
  useSetGroupLeaderMutation,
  useAddStudentGroupMutation,
  useGetAllStudentGroupQuery,
  useRemoveGroupLeaderMutation,
  useUpdateStudentGroupMutation,
  useAssignStudentGroupMutation,
  useRemoveDivisionLeaderMutation,
  useRemoveStudentFromGroupMutation,
  useSetGroupLeaderAsDivisionMutation,
} from 'src/redux/student/student-group/student-group';

import type { IStudentHouse } from './type';

const GroupManagement = ({ division }: { division: string }) => {
  // // State to store query parameters
  // const [queryParams, setQueryParams] = useState({
  //   SkipCount: 0,
  //   MaxResultCount: 10,
  //   Sorting: 'name ASC',
  // });

  // State to manage dialog for assigning students
  const assignStudentDialog = useBoolean();
  // Dialog state for add/edit form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();
  // State to manage group data
  const dispatch = useDispatch();
  // State to manage group data
  const isConfirmForDivisionLeader = useBoolean();
  // State to manage group data
  const isConfirmForMainLeader = useBoolean();
  // State to manage group data
  const isRemoveFromDivisionLeader = useBoolean();
  // State to manage group data
  const isRemoveLeader = useBoolean();
  // State to manage group data
  const isRemoveStudentToHouse = useBoolean();

  // State to store group data being edited
  const [editData, setEditData] = useState<null | IStudentHouse>(null);
  // State to control info alert visibility
  const [showInfoAlert, setShowInfoAlert] = useState(true);

  // Close dialog and reset edit data
  const handleClose = () => {
    setEditData(null);
    dialog.onFalse();
  };

  const {
    data: getAllStudentGroupData,
    isLoading: isGetAllStudentGroupLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    params: { division },
    currentQueryAndMutation: useGetAllStudentGroupQuery,
  });

  // set division leader  group mutation hook
  const [assignDivisionLeader, { isLoading: isAssignDivisionLeaderLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSetGroupLeaderAsDivisionMutation,
  });
  // set division leader  group mutation hook
  const [assignMainLeader, { isLoading: isAssignMainLeaderLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSetGroupLeaderMutation,
  });
  // set division leader  group mutation hook
  const [removeDivisionLeader, { isLoading: isRemoveDivisionLeaderLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRemoveDivisionLeaderMutation,
  });
  // remove  leader  group mutation hook
  const [removeLeader, { isLoading: isRemoveLeaderLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRemoveGroupLeaderMutation,
  });
  // remove  leader  group mutation hook
  const [removeStudentFromHouse, { isLoading: isRemoveStudentFromHouse }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRemoveStudentFromGroupMutation,
  });

  const stats = useMemo(() => {
    const allStudents: IStudentHouse[] = getAllStudentGroupData?.data || [];
    return {
      total: allStudents.length,
      assigned: allStudents.filter((s) => s.houseSetting).length,
      pending: allStudents.filter((s) => !s.houseSetting).length,
      leaders: allStudents.filter((s) => s.isGlobalHouseLeader || s.isDivisionHouseLeader).length,
    };
  }, [getAllStudentGroupData?.data]);

  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}
    >
      {/* <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setEditData(null);
        }}
        title="Delete House"
        content={
          <>
            Are you sure you want to delete <b>{`${editData?.studentName}`}</b> House ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteLoading}
            color="error"
            onClick={async () => {
              try {
                await deleteGroup(editData?.id).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                confirm.onFalse();
                shikshaMitraToast.success({
                  message: `${editData?.groupMembership?.groupName} House Deleted Successfully for ${editData?.studentName}`,
                });
              } catch (error) {
                console.error(error);
              }
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      /> */}
      <ConfirmDialog
        open={isRemoveFromDivisionLeader.value}
        onClose={() => {
          isRemoveFromDivisionLeader.onFalse();
          setEditData(null);
        }}
        title="Remove Division Leader"
        content={
          <>
            Are you sure want to Remove Student <b>{`${editData?.studentName}`}</b> from Division
            Leader ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isRemoveDivisionLeaderLoading}
            color="error"
            size="small"
            sx={{ px: 2, minWidth: 'auto' }}
            startIcon={<Iconify icon="material-symbols:delete-outline" width={18} />}
            onClick={async () => {
              try {
                await removeDivisionLeader(editData?.studentId).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                confirm.onFalse();

                shikshaMitraToast.success({
                  message: `Removed Division Leader Successfully for ${editData?.studentName}`,
                });
                isRemoveFromDivisionLeader.onFalse();
              } catch (error) {
                console.error(error);
              }
              setEditData(null);
            }}
          >
            Remove
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={isRemoveLeader.value}
        onClose={() => {
          isRemoveLeader.onFalse();
          setEditData(null);
        }}
        title="Remove House Leader"
        content={
          <>
            Are you sure want to Remove Student <b>{`${editData?.studentName}`}</b> from House
            Leader ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isRemoveLeaderLoading}
            color="error"
            startIcon={<Iconify icon="material-symbols:delete-outline" width={18} />}
            onClick={async () => {
              try {
                await removeLeader(editData?.studentId).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                confirm.onFalse();

                shikshaMitraToast.success({
                  message: `House Leader removed successfully for ${editData?.studentName}`,
                });
                isRemoveLeader.onFalse();
              } catch (error) {
                console.error(error);
              }
              setEditData(null);
            }}
          >
            Remove
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={isRemoveStudentToHouse.value}
        onClose={() => {
          isRemoveStudentToHouse.onFalse();
          setEditData(null);
        }}
        title="Remove Student from house"
        content={
          <>
            Are you sure want to Remove Student <b>{`${editData?.studentName}`}</b> from House ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isRemoveStudentFromHouse}
            color="error"
            size="small"
            sx={{ px: 2, minWidth: 'auto' }}
            startIcon={<Iconify icon="material-symbols:delete-outline" width={18} />}
            onClick={async () => {
              try {
                await removeStudentFromHouse({
                  groupId: editData?.houseSettingId,
                  studentId: editData?.studentId,
                }).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                confirm.onFalse();
                shikshaMitraToast.success({
                  message: `${editData?.houseSetting.name} House removed successfully for  ${editData?.studentName}`,
                });
                isRemoveStudentToHouse.onFalse();
              } catch (error) {
                console.error(error);
              }
              setEditData(null);
            }}
          >
            Remove
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={isConfirmForDivisionLeader.value}
        onClose={() => {
          isConfirmForDivisionLeader.onFalse();
          setEditData(null);
        }}
        // title="Assign Division Leader"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Assign Division Leader</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Assign a student as the Division Leader who will represent their house within this division."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        content={
          <>
            Are you sure want to Assign Division Leader to <b>{`${editData?.studentName}`}</b> ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isAssignDivisionLeaderLoading}
            size="small"
            sx={{ px: 2, minWidth: 'auto' }}
            startIcon={<Iconify icon="mdi:account-plus" width={18} />}
            onClick={async () => {
              try {
                await assignDivisionLeader(editData?.studentId).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                shikshaMitraToast.success({
                  message: `Division leader assigned successfully for ${editData?.studentName}`,
                });
              } catch (error) {
                console.error(error);
              } finally {
                isConfirmForDivisionLeader.onFalse();
                setEditData(null);
              }
            }}
          >
            Assign
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={isConfirmForMainLeader.value}
        onClose={() => {
          isConfirmForMainLeader.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Assign House Leader</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Assign a student as the House Leader who will lead this house across all divisions."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        content={
          <>
            Are you sure want to Assign House Leader to <b>{`${editData?.studentName}`}</b> ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isAssignMainLeaderLoading}
            size="small"
            sx={{ px: 2, minWidth: 'auto' }}
            startIcon={<Iconify icon="mdi:account-plus" width={18} />}
            onClick={async () => {
              try {
                await assignMainLeader(editData?.studentId).unwrap();
                dispatch(StudentApi.util.invalidateTags(['Student']));
                shikshaMitraToast.success({
                  message: `House Leader assigned successfully for ${editData?.studentName}`,
                });
              } catch (error) {
                console.error(error);
              } finally {
                isConfirmForMainLeader.onFalse();
                setEditData(null);
              }
            }}
          >
            Assign
          </LoadingButton>
        }
      />
      {/* ── Summary Statistics Cards ── */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardCard
            title="Total Students"
            value={stats.total}
            icon="mdi:account-group-outline"
            color="primary.main"
            bgColor="transparent"
            sx={{
              p: 0.5,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardCard
            title="Assigned"
            value={stats.assigned}
            icon="uil:house-user"
            color="success.main"
            bgColor="transparent"
            sx={{
              p: 0.5,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardCard
            title="Pending"
            value={stats.pending}
            icon="mdi:account-clock-outline"
            color="warning.main"
            bgColor="transparent"
            sx={{
              p: 0.5,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardCard
            title="Leaders"
            value={stats.leaders}
            icon="mdi:crown-outline"
            color="info.main"
            bgColor="transparent"
            sx={{
              p: 0.5,
            }}
          />
        </Grid>
      </Grid>
      {/* ── Instruction Banner ── */}
      {showInfoAlert && (
        <Alert
          variant="outlined"
          severity="info"
          icon={<Iconify icon="lucide:info" width={16} />}
          onClose={() => setShowInfoAlert(false)}
          sx={{ mb: 1 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
            <Typography variant="caption">
              Assign a house before assigning a House Leader
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              •
            </Typography>
            <Typography variant="caption">Only one House Leader is allowed per house</Typography>
          </Box>
        </Alert>
      )}
      <CustomizableTable
        // onSendNotification={handlerSendNotification}
        // showCheckbox={selectedStudent.length !== 0}
        tableTitle="House Management"
        tableId="group-management-table"
        noDataText="No Student data available"
        isLoading={isGetAllStudentGroupLoading || isFetching}
        columns={[
          {
            id: 'studentName',
            label: 'Student Name',
            align: 'left',
            minWidth: '200px',
            sticky: true,
            render: (value, row) => {
              const isBoth = row.isGlobalHouseLeader && row.isDivisionHouseLeader;
              const isHouseOnly = row.isGlobalHouseLeader && !row.isDivisionHouseLeader;
              const isDivisionOnly = row.isDivisionHouseLeader && !row.isGlobalHouseLeader;

              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2">{value || '-'}</Typography>

                  {isBoth && (
                    <CustomTooltip
                      arrow
                      placement="top"
                      title="House Leader & Division Leader — leads the house across all divisions and represents it within this division."
                    >
                      <Label
                        color="error"
                        variant="soft"
                        startIcon={<Iconify icon="mdi:trophy" width={12} />}
                        sx={{ fontSize: 11, cursor: 'default', fontWeight: 700 }}
                      >
                        HL/DL
                      </Label>
                    </CustomTooltip>
                  )}

                  {isHouseOnly && (
                    <CustomTooltip
                      arrow
                      placement="top"
                      title="House Leader — leads this house across all divisions."
                    >
                      <Label
                        color="success"
                        variant="soft"
                        startIcon={<Iconify icon="mdi:crown" width={12} />}
                        sx={{ fontSize: 11, cursor: 'default' }}
                      >
                        HL
                      </Label>
                    </CustomTooltip>
                  )}

                  {isDivisionOnly && (
                    <CustomTooltip
                      arrow
                      placement="top"
                      title="Division Leader — represents the house within this division."
                    >
                      <Label
                        color="warning"
                        variant="soft"
                        startIcon={<Iconify icon="mdi:star" width={12} />}
                        sx={{ fontSize: 11, cursor: 'default' }}
                      >
                        DL
                      </Label>
                    </CustomTooltip>
                  )}
                </Box>
              );
            },
          },
          {
            id: 'grNo',
            label: 'GR No.',
            align: 'left',
            minWidth: '110px',
            filterType: 'number',
            render: (value) => value || '-',
          },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
            minWidth: '120px',
            filterType: 'number',
            render: (value) => value || '-',
          },
          {
            id: 'houseSetting.name',
            label: 'House Name',
            minWidth: '160px',
            align: 'left',
            render(value, row) {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {row?.houseSetting ? (
                    <Label color="success" variant="soft">
                      {row.houseSetting.name}
                    </Label>
                  ) : (
                    <Typography variant="caption" fontStyle="italic" color="text.secondary">
                      No house assigned
                    </Typography>
                  )}
                </Box>
              );
            },
          },

          {
            id: 'actions',
            label: 'Action',
            minWidth: '40px',
            align: 'left',
            sticky: true,
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={({ popover }) => (
                    <MenuList>
                      {row?.houseSetting ? (
                        <MenuItem
                          onClick={() => {
                            setEditData(row as IStudentHouse);
                            isRemoveStudentToHouse.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify icon="bi:house-x" />
                          Remove From House
                        </MenuItem>
                      ) : (
                        <MenuItem
                          onClick={() => {
                            setEditData(row as IStudentHouse);
                            assignStudentDialog.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify icon="uil:house-user" />
                          Assign House
                        </MenuItem>
                      )}
                      {row?.isDivisionHouseLeader ? (
                        <MenuItem
                          onClick={() => {
                            setEditData(row as IStudentHouse);
                            isRemoveFromDivisionLeader.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify icon="jam:user-remove" />
                          Remove Division Leader
                        </MenuItem>
                      ) : (
                        <MenuItem
                          onClick={() => {
                            if (!row.houseSetting) {
                              shikshaMitraToast.error({ message: 'Please assign house first' });
                              return;
                            }
                            setEditData(row as IStudentHouse);
                            isConfirmForDivisionLeader.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify icon="fluent-mdl2:party-leader" />
                          Assign Division Leader
                        </MenuItem>
                      )}
                      {row?.isGlobalHouseLeader ? (
                        <MenuItem
                          onClick={() => {
                            setEditData(row as IStudentHouse);
                            isRemoveLeader.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify icon="jam:user-remove" />
                          Remove House Leader
                        </MenuItem>
                      ) : (
                        <MenuItem
                          onClick={() => {
                            if (!row.houseSetting) {
                              shikshaMitraToast.error({ message: 'Please assign house first' });
                              popover.onClose();

                              return;
                            }
                            setEditData(row as IStudentHouse);
                            isConfirmForMainLeader.onTrue();
                            popover.onClose();
                          }}
                        >
                          <Iconify icon="iconoir:leaderboard-star" />
                          Assign House Leader
                        </MenuItem>
                      )}
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={getAllStudentGroupData?.data || []}
      />{' '}
      {/* <CustomizableTable
        tableId="group-management-table"
        noDataText={
          <>
            No House Data Found{' '}
            <Box
              onClick={dialog.onTrue}
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
              Add House
            </Box>{' '}
          </>
        }
        searchFieldProps={{
          placeholder: 'Search by house name...',
          label: 'Search by house name',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        totalCount={groupData?.totalCount || 0}
        isLoading={isLoading}
        // serverSide
        onServerPagination={async (page, rowPerPage) => {
          const newParams = {
            ...queryParams,
            SkipCount: page * rowPerPage,
            MaxResultCount: rowPerPage,
          };
          setQueryParams(newParams);
        }}
        onServerSort={async (column, sort) => {}}
        columns={[
          { label: 'House Name', id: 'name' },
          {
            label: 'Action',
            id: 'action',
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: '100px',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  showDeleteIcon
                  handleEditClick={() => {
                    setEditData(row as IGroup);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setEditData(row as IGroup);
                    confirm.onTrue();
                  }}
                  placement="right-top"
                  actions={({ popover }) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setEditData(row as IGroup);
                          assignStudentDialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="hugeicons:student" />
                        Assign Student
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setEditData(row as IGroup);
                          assignLeaderDialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="fluent-mdl2:party-leader" />
                        Assign leader
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={groupData?.items || []}
      />{' '} */}
      <CustomDialog
        open={dialog.value}
        handleClose={handleClose}
        title={editData ? 'Update House' : 'Add House'}
      >
        <GroupManagementForm editData={editData} handleClose={handleClose} />
      </CustomDialog>
      <CustomDialog
        open={assignStudentDialog.value}
        handleClose={() => {
          assignStudentDialog.onFalse();
          setEditData(null);
          dispatch(StudentApi.util.invalidateTags(['Student']));
        }}
        // title="Assign House"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Assign House</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Assign students to houses for inter-house competitions, events, and administrative grouping within the school."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AssignStudentForm
          editData={editData}
          handleClose={() => {
            assignStudentDialog.onFalse();
            setEditData(null);
          }}
        />
      </CustomDialog>
      {/* <CustomDialog
        open={assignLeaderAsDivisionDialog.value}
        handleClose={() => {
          assignLeaderAsDivisionDialog.onFalse();
          setEditData(null);
        }}
        title="Assign Students"
      >
        <AssignStudentForm
          editData={editData}
          handleClose={() => {
            assignLeaderAsDivisionDialog.onFalse();
            setEditData(null);
          }}
        />
      </CustomDialog> */}
    </Box>
  );
};

export default GroupManagement;

const GroupManagementForm = ({
  editData,
  handleClose,
}: {
  editData: IStudentHouse | null;
  handleClose: () => void;
}) => {
  // Hooks for adding and updating student groups using custom query and mutation hook
  const [addGroup, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentGroupMutation,
  });
  const [updateGroup, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentGroupMutation,
  });

  // Initialize formik form with initial values and submit handler
  const formik = useFormik({
    // Set initial name value from editData if exists, otherwise empty string
    initialValues: {
      name: editData?.studentName || '',
    },
    // Handle form submission for both add and update operations
    onSubmit: async (values) => {
      try {
        if (editData) {
          // Update existing group if editData exists
          await updateGroup({
            houseSettingId: editData.houseSettingId,
            body: {
              name: values.name,
            },
          }).unwrap();
          shikshaMitraToast.success({ message: `${values.name} House Updated Successfully` });
        } else {
          // Add new group if no editData
          await addGroup({ name: values.name }).unwrap();
          shikshaMitraToast.success({ message: `${values.name} House added Successfully` });
        }
        // Close dialog after successful operation
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Stack spacing={2} p={2}>
        <TextField
          size="small"
          value={formik.values.name}
          name="name"
          label="House Name"
          autoFocus
          onChange={(e) => {
            const value = capitalize(e.target.value);
            formik.setFieldValue('name', value);
          }}
        />
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            size="small"
            variant="outlined"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            type="submit"
            variant="contained"
            loading={isLoading || isUpdateLoading}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            {editData ? 'Update' : 'Add'}
          </LoadingButton>
        </DialogActions>
      </Stack>
    </Box>
  );
};

/**
 * Component for assigning a leader to a group
 * @param {Object} props - Component props
 * @param {Function} props.handleClose - Function to handle dialog close
 * @param {Object|null} props.editData - Group data being edited
 */
const AssignStudentForm = ({
  handleClose,
  editData,
}: {
  handleClose: () => void;
  editData: IStudentHouse | null;
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  /**
   * Custom hook for assigning students as group leaders
   * Returns mutation function and loading state
   */
  const [assignStudent, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignStudentGroupMutation,
  });

  // Fetch all student groups
  // const { data: groupData, isLoading: isGetHouseLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetStudentGroupQuery,
  // });

  const { data: groupData, isLoading: isGetGroupLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllGroupQuery,
    params: currentMedium?.id,
  });

  const dispatch = useDispatch();

  /**
   * Formik instance for handling form state and validation
   * Manages student selection and form submission
   */
  const formik = useFormik<{
    house: { name: string; id: string };
  }>({
    // Initial form values
    initialValues: {
      house: { name: '', id: '' },
    },
    // Validation schema for form fields
    validationSchema: Yup.object({
      house: Yup.object({
        id: Yup.string().required('Please select a house'),
      }),
    }),
    /**
     * Handles form submission
     * Assigns selected student as group leader
     * @param {Object} values - Form values
     */
    onSubmit: async (values) => {
      try {
        await assignStudent({
          studentId: editData?.studentId,
          houseId: values.house.id,
        }).unwrap();
        shikshaMitraToast.success({
          message: `${formik.values.house?.name} House assigned successfully for ${editData?.studentName}`,
        });
        dispatch(StudentApi.util.invalidateTags(['Student']));
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <Box>
      <DialogScrollContent>
        <Stack p={0}>
          <Autocomplete
            noOptionsText="No House Found"
            fullWidth
            loading={isGetGroupLoading}
            value={formik.values.house}
            onChange={(__, val) => formik.setFieldValue('house', val)}
            renderOption={(props, option: any) => (
              <li {...props} key={option.id}>
                {option?.name}
              </li>
            )}
            options={groupData?.data || []}
            getOptionLabel={(option: any) => `${option?.name}`}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                size="small"
                label="Search House"
                error={formik.touched.house && Boolean(formik.errors.house?.id)}
                helperText={formik.touched.house && formik.errors.house?.id}
              />
            )}
          />
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          variant="outlined"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          type="submit"
          variant="contained"
          loading={isLoading}
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          startIcon={<Iconify icon="mdi:account-plus" width={18} />}
        >
          Assign
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
