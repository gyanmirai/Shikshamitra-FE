'use client';

import type { IKanbanColumn } from 'src/types/kanban';
import type { LabelColor } from 'src/components/label';
import type { EntranceExamStatusType } from 'src/enums/entranceExam-type';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Stack,
  Button,
  Drawer,
  Dialog,
  Divider,
  useTheme,
  MenuList,
  MenuItem,
  Checkbox,
  Skeleton,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  drawerClasses,
  CircularProgress,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import calculateAge from 'src/utils/calculate-age';
import { convertBase64Format } from 'src/utils/base64Formate';

import { GenderType } from 'src/enums/gender';
import { paper, varAlpha } from 'src/theme/styles';
import { DocumentType } from 'src/enums/documnet-type';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EntranceExamStatusTypeColors } from 'src/enums/entranceExam-type';
import { RegistrationStatusType } from 'src/enums/registration-status-type';
import { useGetStudentDocumentTypeQuery } from 'src/redux/student/document-type/document-type-api';
import FeeNewCollectionForm from 'src/screens/finance/fee-collection/collectFees/fee-collection-form';
import { useGetEntranceExamByStudentIdQuery } from 'src/redux/student/entrance-exam/entrance-exam-api';
import {
  useGetStudentAdmissionQuery,
  useChangeAdmissionStatusMutation,
} from 'src/redux/student/admission/admission-api';
import {
  useGetStudentDocumentsQuery,
  useGetStudentDocumentByIdQuery,
} from 'src/redux/student/registration/registration-api';
import {
  AdmissionPaymentStatusType,
  AdmissionPaymentStatusOptions,
  AdmissionPaymentStatusTypeColors,
} from 'src/enums/admission-payment-statusType';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CommunicationForm } from '../follow-up';
import RegisterForm from '../register/register-form';

import type { IInquiryData } from '../Inquiry';

const cssVars = {
  '--item-gap': '16px',
  '--item-radius': '12px',
  '--column-gap': '24px',
  '--column-width': '336px',
  '--column-radius': '16px',
  '--column-padding': '20px 16px 16px 16px',
};

const columns: IKanbanColumn[] = [
  {
    id: 'pendingApproval',
    name: 'Pending Approval',
  },
  {
    id: 'approved',
    name: 'Approved',
  },
  {
    id: 'rejected',
    name: 'Rejected',
  },
];

const data = [
  {
    id: '1',
    name: 'John Doe',
    description: 'Description 1',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Jane Smith',
    description: 'Description 2',
    status: 'approved',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    description: 'Description 3',
    status: 'rejected',
  },
];

// const AdmissionScreen = () => {
//   const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
//   const [columnFixed, setColumnFixed] = useState(true);

//   const openDetails = useBoolean();

//   const ref = useRef<any>(null);

//   const [board, setBoard] = useState<{
//     columns: IKanbanColumn[];
//     tasks: Record<UniqueIdentifier, IKanbanTask[]>;
//   }>({
//     columns,
//     tasks,
//   });

//   const recentlyMovedToNewContainer = useRef(false);

//   const lastOverId = useRef<UniqueIdentifier | null>(null);

//   // const { board, boardLoading, boardEmpty } = useGetBoard();

//   const sensors = useSensors(
//     useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
//     useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
//     useSensor(KeyboardSensor, { coordinateGetter })
//   );
//   /**
//    * onDragStart
//    */
//   const onDragStart = ({ active }: DragStartEvent) => {
//     setActiveId(active.id);
//   };

//   /**
//    * onDragOver
//    */
//   const onDragOver = ({ active, over }: DragOverEvent) => {
//     const overId = over?.id;

//     if (overId == null || active.id in board.tasks) {
//       return;
//     }

//     const overColumn = findColumn(overId);

//     const activeColumn = findColumn(active.id);

//     if (!overColumn || !activeColumn) {
//       return;
//     }

//     if (activeColumn !== overColumn) {
//       const activeItems = board.tasks[activeColumn].map((task) => task.id);
//       const overItems = board.tasks[overColumn].map((task) => task.id);
//       const overIndex = overItems.indexOf(overId);
//       const activeIndex = activeItems.indexOf(active.id);

//       let newIndex: number;

//       if (overId in board.tasks) {
//         newIndex = overItems.length + 1;
//       } else {
//         const isBelowOverItem =
//           over &&
//           active.rect.current.translated &&
//           active.rect.current.translated.top > over.rect.top + over.rect.height;

//         const modifier = isBelowOverItem ? 1 : 0;

//         newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
//       }

//       recentlyMovedToNewContainer.current = true;

//       const updateTasks = {
//         ...board.tasks,
//         [activeColumn]: board.tasks[activeColumn].filter((task) => task.id !== active.id),
//         [overColumn]: [
//           ...board.tasks[overColumn].slice(0, newIndex),
//           board.tasks[activeColumn][activeIndex],
//           ...board.tasks[overColumn].slice(newIndex, board.tasks[overColumn].length),
//         ],
//       };

//       setBoard((prev) => ({
//         ...prev,
//         tasks: updateTasks,
//       }));
//     }
//   };

//   const findColumn = (id: UniqueIdentifier) => {
//     if (id in board.tasks) {
//       return id;
//     }

//     return Object.keys(board.tasks).find((key) =>
//       board.tasks[key].map((task) => task.id).includes(id)
//     );
//   };

//   /**
//    * onDragEnd
//    */
//   const onDragEnd = ({ active, over }: DragEndEvent) => {
//     if (active.id in board.tasks && over?.id) {
//       const activeIndex = columnIds.indexOf(active.id);
//       const overIndex = columnIds.indexOf(over.id);

//       const updateColumns = arrayMove(board.columns, activeIndex, overIndex);

//       // moveColumn(updateColumns);
//       setBoard((prev) => ({
//         ...prev,
//         columns: updateColumns,
//       }));
//     }

//     const activeColumn = findColumn(active.id);

//     if (!activeColumn) {
//       setActiveId(null);
//       return;
//     }

//     const overId = over?.id;

//     if (overId == null) {
//       setActiveId(null);
//       return;
//     }

//     const overColumn = findColumn(overId);

//     if (overColumn) {
//       const activeContainerTaskIds = board.tasks[activeColumn].map((task) => task.id);
//       const overContainerTaskIds = board.tasks[overColumn].map((task) => task.id);

//       const activeIndex = activeContainerTaskIds.indexOf(active.id);
//       const overIndex = overContainerTaskIds.indexOf(overId);

//       if (activeIndex !== overIndex) {
//         const updateTasks = {
//           ...board.tasks,
//           [overColumn]: arrayMove(board.tasks[overColumn], activeIndex, overIndex),
//         };

//         // moveTask(updateTasks);
//         setBoard((prev) => ({
//           ...prev,
//           tasks: updateTasks,
//         }));
//       }
//     }

//     setActiveId(null);
//   };

//   const collisionDetectionStrategy: CollisionDetection = useCallback(
//     (args) => {
//       if (activeId && activeId in board.tasks) {
//         return closestCenter({
//           ...args,
//           droppableContainers: args.droppableContainers.filter(
//             (column) => column.id in board.tasks
//           ),
//         });
//       }

//       // Start by finding any intersecting droppable
//       const pointerIntersections = pointerWithin(args);

//       const intersections =
//         pointerIntersections.length > 0
//           ? // If there are droppables intersecting with the pointer, return those
//             pointerIntersections
//           : rectIntersection(args);
//       let overId = getFirstCollision(intersections, 'id');

//       if (overId != null) {
//         if (overId in board.tasks) {
//           const columnItems = board.tasks[overId].map((task) => task.id);

//           // If a column is matched and it contains items (columns 'A', 'B', 'C')
//           if (columnItems.length > 0) {
//             // Return the closest droppable within that column
//             overId = closestCenter({
//               ...args,
//               droppableContainers: args.droppableContainers.filter(
//                 (column) => column.id !== overId && columnItems.includes(column.id)
//               ),
//             })[0]?.id;
//           }
//         }

//         lastOverId.current = overId;

//         return [{ id: overId }];
//       }

//       // When a draggable item moves to a new column, the layout may shift
//       // and the `overId` may become `null`. We manually set the cached `lastOverId`
//       // to the id of the draggable item that was moved to the new column, otherwise
//       // the previous `overId` will be returned which can cause items to incorrectly shift positions
//       if (recentlyMovedToNewContainer.current) {
//         lastOverId.current = activeId;
//       }

//       // If no droppable is matched, return the last match
//       return lastOverId.current ? [{ id: lastOverId.current }] : [];
//     },
//     [activeId, board?.tasks]
//   );

//   const columnIds = board.columns.map((column) => column.id);

//   const isSortingContainer = activeId ? columnIds.includes(activeId) : false;

//   return (
//     <Box height="100%" className="admission-container" ref={ref}>
//       <DashboardContent
//         maxWidth={false}
//         disablePadding
//         sx={{
//           ...cssVars,
//           pb: 0,
//           pl: { sm: 0, md: 0 },
//           pr: { sm: 0 },
//           flex: '1 1 0',
//           display: 'flex',
//           overflow: 'hidden',
//           flexDirection: 'column',
//           height: '100%',
//         }}
//       >
//         <CustomBreadcrumbs
//           heading="Admission"
//           links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Admission' }]}
//           sx={{ px: 1, mb: 2 }}
//         />
//         <DndContext
//           id="admission-dnd"
//           sensors={sensors}
//           collisionDetection={collisionDetectionStrategy}
//           measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
//           onDragStart={onDragStart}
//           onDragOver={onDragOver}
//           onDragEnd={onDragEnd}
//         >
//           <Scrollbar sx={{ flex: '1 1 auto', overflowX: 'auto' }}>
//             <Stack
//               sx={{
//                 pb: 3,
//                 display: 'unset',
//                 height: '100%',
//                 ...(columnFixed && { minHeight: 0, display: 'flex', flex: '1 1 auto' }),
//               }}
//             >
//               <Stack
//                 direction="row"
//                 sx={{
//                   gap: 'var(--column-gap)',
//                   ...(columnFixed && {
//                     minHeight: 0,
//                     flex: '1 1 auto',
//                     [`& .${kanbanClasses.columnList}`]: { ...hideScrollY, flex: '1 1 auto' },
//                   }),
//                 }}
//               >
//                 <SortableContext items={[...columnIds]} strategy={horizontalListSortingStrategy}>
//                   {board?.columns.map((column) => (
//                     <AdmissionColumn key={column.id} column={column} tasks={board.tasks[column.id]}>
//                       <SortableContext
//                         items={board.tasks[column.id]}
//                         strategy={verticalListSortingStrategy}
//                       >
//                         <TextField
//                           label="Search Student"
//                           variant="outlined"
//                           size="small"
//                           sx={{ mt: 1 }}
//                         />
//                         {board.tasks[column.id].map((task) => (
//                           <AdmissionItemBase
//                             task={task}
//                             key={task.id}
//                             columnId={column.id}
//                             disabled={isSortingContainer}
//                             openDetails={openDetails}
//                           />
//                         ))}
//                       </SortableContext>
//                     </AdmissionColumn>
//                   ))}
//                 </SortableContext>
//               </Stack>
//             </Stack>
//           </Scrollbar>

//           <AdmissionOverlay
//             columns={board?.columns}
//             tasks={board?.tasks}
//             activeId={activeId}
//             sx={cssVars}
//           />
//         </DndContext>
//       </DashboardContent>
//       {/* {container && openDetails.value && ( */}

//       <Drawer
//         anchor="right"
//         open={openDetails.value}
//         onClose={openDetails.onFalse}
//         slotProps={{ backdrop: { invisible: true } }}
//         sx={{
//           [`& .${drawerClasses.paper}`]: (theme) => ({
//             ...paper({
//               theme,
//               color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
//             }),
//             width: 400,
//           }),
//         }}
//       >
//         <Paper
//           elevation={12}
//           component="button"
//           autoFocus
//           sx={{
//             border: 'none',
//             maxWidth: '400px',
//             width: '100%',
//             zIndex: 9999,
//             height: '100%',
//             textAlign: 'left',
//             // transition: 'all 0.3s ease',
//             // transform: openDetails.value ? 'translateX(0)' : 'translateX(110%)',
//           }}

//           // ref={ref}
//         >
//           <Scrollbar sx={{ height: '100%', p: 2 }}>
//             <Iconify
//               icon="zondicons:close-outline"
//               onClick={openDetails.onFalse}
//               sx={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer' }}
//             />
//             <StudentDetails />
//           </Scrollbar>
//         </Paper>
//       </Drawer>
//     </Box>
//   );
// };

const AdmissionScreen = () => {
  const tabs = useTabs(RegistrationStatusType.Pending);
  const dialogForCollectFees = useBoolean();
  const divisionDialog = useBoolean();
  const statusDialog = useBoolean();
  const openDetails = useBoolean();
  const followUpDialog = useBoolean();
  const [open, setOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const [editData, setEditData] = useState<IInquiryData | null>(null);

  const { data: admissionData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentAdmissionQuery,
  });

  console.log('admissionData----', admissionData);

  const counts = useMemo(
    () => ({
      pending: admissionData?.items.filter(
        (i: any) => i.studentEnrollmentApprovalState === RegistrationStatusType.Pending
      )?.length,
      approved: admissionData?.items.filter(
        (i: any) => i.studentEnrollmentApprovalState === RegistrationStatusType.Approved
      )?.length,
      rejected: admissionData?.items.filter(
        (i: any) => i.studentEnrollmentApprovalState === RegistrationStatusType.Rejected
      )?.length,
    }),
    [admissionData?.items]
  );
  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: RegistrationStatusType.Pending,
        count: counts.pending || 0,
        color: 'warning',
      },
      {
        label: 'Approved',
        value: RegistrationStatusType.Approved,
        count: counts.approved || 0,
        color: 'success',
      },
      {
        label: 'Rejected',
        value: RegistrationStatusType.Rejected,
        count: counts.rejected || 0,
        color: 'error',
      },
    ],
    [counts]
  );

  const tableData = useMemo(
    () =>
      admissionData?.items
        .filter((i: any) => i.studentEnrollmentApprovalState === tabs.value)
        .map((item: IInquiryData) => ({
          ...item,
          dobValue: dayjs(item.dateOfBirth).format('DD-MM-YYYY'),
          ageValue: calculateAge(dayjs(item.dateOfBirth).format()),
          doiValue: dayjs(item.dateOfInquiry).format('DD-MM-YYYY'),
          studentName: `${item.firstName} ${item.lastName} ${item.middleName}`,
          genderValue: GenderType[item?.genderType],
        })),
    [admissionData?.items, tabs.value]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Admission"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Admission' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={1} alignItems="flex-start">
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{
            mb: 2,
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}{' '}
                  <Label
                    // variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
                    color={(tab?.color as LabelColor) || 'default'}
                  >
                    {tab.count}
                  </Label>
                </Box>
              }
              // icon={tab.icon}
              value={tab.value}
            />
          ))}
        </Tabs>

        <Button
          variant="contained"
          size="small"
          disabled={!selectedStudents.length}
          onClick={statusDialog.onTrue}
        >
          Change Status
        </Button>
      </Box>
      <CustomizableTable
        tableId="student-enrollment-admission-table"
        isLoading={isLoading}
        columns={[
          {
            id: 'checkBox',
            align: 'left',
            minWidth: '60px',
            isSort: false,
            isFilter: false,
            label: '',
            renderColumn() {
              return (
                <Checkbox
                  checked={tableData?.length && selectedStudents?.length === tableData?.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(tableData);
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                />
              );
            },
            render(value, row) {
              return (
                <Checkbox
                  checked={!!selectedStudents.find((i: any) => i.id === row.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents([...selectedStudents, row]);
                    } else {
                      setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                    }
                  }}
                />
              );
            },
          },
          { id: 'formNumber', label: 'Form No', minWidth: '110px' },
          {
            id: 'inquiryNumber',
            label: 'Inquiry Number',

            minWidth: '162px',
            isFilter: true,
            filterType: 'string',
          },
          { id: 'standard.name', label: 'Class' },
          { id: 'studentName', label: 'Student Name', minWidth: '160px' },
          {
            id: 'dobValue',
            label: 'DOB',
            minWidth: '120px',
            align: 'left',
            isFilter: true,
            filterType: 'date',
          },
          { id: 'ageValue', label: 'Age' },
          {
            id: 'doiValue',
            label: 'DOI',
            minWidth: '120px',
            align: 'left',
            isDateRangeFilter: true,
            filterType: 'date',
          },
          { id: 'genderValue', label: 'Gender' },
          { id: 'address', label: 'Address', minWidth: '120px' },
          { id: 'parentContactNumber', label: 'Parents Co. No.', minWidth: '160px' },
          { id: 'alternativeContactNumber', label: 'Alternate Contact Details', minWidth: '232px' },
          { id: 'previousSchoolName', label: 'Previous School', minWidth: '170px' },
          {
            id: 'inquiryPreference.preferenceName',
            label: 'Inquiry Preferences',
            minWidth: '200px',
          },

          { id: 'educationMedium.name', label: 'Organization' },

          { id: 'inquiryNo', align: 'left', label: 'Inquiry No', minWidth: '104px' },
          // { id: 'FirstName', label: 'First Name', minWidth: '110px' },
          // { id: 'MiddleName', label: 'Middle Name', minWidth: '125px' },
          { id: 'Name', label: 'Name' },
          { id: 'Code', label: 'Code' },
          { id: 'class', label: 'Class' },
          { id: 'Organization', label: 'Organization' },
          { id: 'parentContactNo', label: 'Parent Contact No', minWidth: '170px' },
          { id: 'totalAmount', label: 'Total Amount', minWidth: '135px', filterType: 'number' },
          { id: 'paidAmount', label: 'Paid Amount', minWidth: '125px', filterType: 'number' },
          {
            id: 'feeStatusType',
            label: 'Payment Status',
            filterType: 'enum',
            enumOptions: AdmissionPaymentStatusOptions,
            render(value, row) {
              const color = AdmissionPaymentStatusTypeColors[
                value as Partial<AdmissionPaymentStatusType>
              ] as LabelColor;

              console.log(value, AdmissionPaymentStatusType[value]);
              return (
                <Label color={color}>
                  {AdmissionPaymentStatusType[value as AdmissionPaymentStatusType]}
                </Label>
              );
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  showViewIcon
                  handleEditClick={() => {
                    setEditData(row as IInquiryData);
                    setOpen(true);
                  }}
                  handleViewClick={() => {
                    setEditData(row as IInquiryData);
                    openDetails.onTrue();
                  }}
                  actions={({ popover }) => (
                    <MenuList>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          divisionDialog.onTrue();
                          setEditData(row as IInquiryData);
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="fluent-mdl2:assign" sx={{ height: '16px', width: '16px' }} />
                        Assign Division
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          dialogForCollectFees.onTrue();
                        }}
                      >
                        <Iconify icon="tdesign:money" />
                        Pay Fees
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          followUpDialog.onTrue();
                          setEditData(row as IInquiryData);
                          popover.onClose();
                        }}
                      >
                        <Iconify
                          icon="icon-park:follow-up-date-sort"
                          color="default.main"
                          sx={{ mr: 2 }}
                        />
                        Follow Up
                      </MenuItem>
                    </MenuList>
                  )}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />

      <CustomDialog
        maxWidth="xl"
        open={open}
        handleClose={() => {
          setEditData(null);
          setOpen(false);
        }}
        title="Edit Admission"
      >
        <RegisterForm
          editData={editData}
          handleClose={() => {
            setEditData(null);
            setOpen(false);
          }}
        />
      </CustomDialog>
      <CustomDialog
        open={divisionDialog.value}
        handleClose={() => {
          divisionDialog.onFalse();
          setEditData(null);
        }}
        title="Assign Division"
      >
        <AssignDivisionForm
          handleClose={divisionDialog.onFalse}
          standardName={editData?.standard?.name}
        />
      </CustomDialog>
      <CustomDialog
        open={statusDialog.value}
        handleClose={statusDialog.onFalse}
        title="Change Status"
      >
        <ChangeStatusForm
          handleClose={() => {
            setSelectedStudents([]);
            statusDialog.onFalse();
          }}
          tabValue={tabs.value}
          selectedStudents={selectedStudents}
        />
      </CustomDialog>

      <CustomDialog
        open={followUpDialog.value}
        handleClose={() => {
          setEditData(null);
          followUpDialog.onFalse();
        }}
        title="Follow Up"
      >
        <CommunicationForm
          handleCloseDialog={() => {
            setEditData(null);
            followUpDialog.onFalse();
          }}
          studentEnrollmentId={(editData as IInquiryData)?.id || ''}
        />{' '}
      </CustomDialog>

      {dialogForCollectFees.value && (
        // <FeeCollectionForm
        //   dialogValue={dialog.value}
        //   onClose={closeDialog}
        // />
        <FeeNewCollectionForm
          isFromStudentAdmissionFlow
          dialogValue={dialogForCollectFees.value}
          onClose={() => {
            dialogForCollectFees.onFalse();
          }}
          data={[]}
        />
        // <FinanceNewCollectFeeDialog
        //   isFromStudentAdmission={false}
        //   onSave={() => {}}
        //   dialogValue={dialog.value}
        //   onClose={closeDialog}
        //   data={selectedStudent}
        // />
      )}

      <Drawer
        anchor="right"
        open={openDetails.value}
        onClose={() => {
          setEditData(null);
          openDetails.onFalse();
        }}
        slotProps={{ backdrop: { invisible: true } }}
        sx={{
          [`& .${drawerClasses.paper}`]: (theme) => ({
            ...paper({
              theme,
              color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
            }),
            width: 400,
          }),
        }}
      >
        <Paper
          elevation={12}
          component="button"
          autoFocus
          sx={{
            border: 'none',
            maxWidth: '400px',
            width: '100%',
            zIndex: 9999,
            height: '100%',
            textAlign: 'left',
            // transition: 'all 0.3s ease',
            // transform: openDetails.value ? 'translateX(0)' : 'translateX(110%)',
          }}

          // ref={ref}
        >
          <Scrollbar sx={{ height: '100%', p: 2 }}>
            <Iconify
              icon="zondicons:close-outline"
              onClick={() => {
                setEditData(null);
                openDetails.onFalse();
              }}
              sx={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer' }}
            />
            <StudentDetails
              tabValue={tabs.value}
              editData={editData}
              onClose={() => {
                setEditData(null);
                openDetails.onFalse();
              }}
            />
          </Scrollbar>
        </Paper>
      </Drawer>
    </Box>
  );
};

export default AdmissionScreen;

const StudentDetails = ({ tabValue, editData, onClose }: any) => {
  const [changeStatus, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeAdmissionStatusMutation,
  });

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Student Details
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        Name : {editData?.firstName || `${editData?.lastName}` || `${editData?.middleName}` || '-'}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        Class : {editData?.standard?.name}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        Parent Name : {editData?.fatherDetails.name || '-'}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        Contact :{editData?.parentContactNumber || '-'}
      </Typography>

      <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
      <EntranceExamSections editData={editData} />
      <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
      <DocumentsSections editData={editData} />
      <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
      {tabValue === RegistrationStatusType.Pending && (
        <>
          <Button
            fullWidth
            variant="soft"
            color="success"
            sx={{ mt: 2 }}
            onClick={async () => {
              await changeStatus({
                approvalStatus: RegistrationStatusType.Approved,
                body: [editData.id],
              }).unwrap();
              onClose();
            }}
          >
            Approve Application
          </Button>
          <Button
            fullWidth
            variant="soft"
            color="error"
            sx={{ mt: 2 }}
            onClick={async () => {
              await changeStatus({
                approvalStatus: RegistrationStatusType.Rejected,
                body: [editData.id],
              }).unwrap();
              onClose();
            }}
          >
            Reject Application
          </Button>
        </>
      )}

      {tabValue === RegistrationStatusType.Approved && (
        <>
          <Button
            fullWidth
            variant="soft"
            color="error"
            sx={{ mt: 2 }}
            onClick={async () => {
              await changeStatus({
                approvalStatus: RegistrationStatusType.Rejected,
                body: [editData.id],
              }).unwrap();
              onClose();
            }}
          >
            Reject Application
          </Button>
          <Button
            fullWidth
            variant="soft"
            color="info"
            sx={{ mt: 2 }}
            onClick={async () => {
              await changeStatus({
                approvalStatus: RegistrationStatusType.Pending,
                body: [editData.id],
              }).unwrap();
              onClose();
            }}
          >
            Pending{' '}
          </Button>
        </>
      )}

      {tabValue === RegistrationStatusType.Rejected && (
        <>
          <Button
            fullWidth
            variant="soft"
            color="success"
            sx={{ mt: 2 }}
            onClick={async () => {
              await changeStatus({
                approvalStatus: RegistrationStatusType.Approved,
                body: [editData.id],
              }).unwrap();
              onClose();
            }}
          >
            Approve Application
          </Button>
          <Button
            fullWidth
            variant="soft"
            color="info"
            sx={{ mt: 2 }}
            onClick={async () => {
              await changeStatus({
                approvalStatus: RegistrationStatusType.Pending,
                body: [editData.id],
              }).unwrap();
              onClose();
            }}
          >
            Pending
          </Button>
        </>
      )}
      {/* <Button fullWidth variant="soft" sx={{ mt: 2 }}>
      Schedule Interview
    </Button> */}
      <TextField label="Remarks" multiline rows={4} fullWidth sx={{ my: 2 }} />
    </Box>
  );
};

const EntranceExamSections = ({ editData }: any) => {
  const exam = useBoolean(true);
  const { data: entranceExamData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamByStudentIdQuery,
  });
  const theme = useTheme();
  const examData = useMemo(
    () => ({
      ...entranceExamData,
      date: dayjs(entranceExamData?.examDate).format('DD-MM-YYYY'),
      examTime: `${dayjs(entranceExamData?.entranceExamSlot?.startDate).format('hh:mm A')} to ${dayjs(
        entranceExamData?.entranceExamSlot?.endDate
      ).format('hh:mm A')}`,
      name: `${entranceExamData?.studentEnrollment?.firstName} ${entranceExamData?.studentEnrollment?.lastName}`,
      medium: entranceExamData?.studentEnrollment?.educationMedium?.name,
      class: entranceExamData?.studentEnrollment?.standard?.name,
      status:
        entranceExamData?.marksObtained === null
          ? 'Pending'
          : entranceExamData?.marksObtained >= entranceExamData?.passingMark
            ? 'Pass'
            : 'Fail',
      percentage:
        entranceExamData?.marksObtained === null || entranceExamData?.totalMarks === 0
          ? 0
          : +(
              ((entranceExamData?.marksObtained ?? 0) / (entranceExamData?.totalMarks ?? 1)) *
              100
            ).toFixed(2),
      obtainMarks: entranceExamData?.marksObtained ?? '-',
    }),
    [entranceExamData]
  );
  const color = EntranceExamStatusTypeColors[
    examData.status as EntranceExamStatusType
  ] as LabelColor;
  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ typography: 'subtitle2' }}
      >
        Entrance Exam Information
        <IconButton size="small" onClick={exam.onToggle}>
          <Iconify
            icon={exam.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        </IconButton>
      </Stack>

      {exam.value && (
        <Stack spacing={3} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 100, color: 'text.secondary', mr: 2 }}>
              Status
            </Box>
            <Label color={color}>{examData?.status}</Label>
          </Stack>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 100, color: 'text.secondary', mr: 2 }}>
              Date
            </Box>
            {dayjs(editData?.examDate).format('DD/MM/YYYY')}
          </Stack>

          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 100, color: 'text.secondary', mr: 2 }}>
              Obtained Marks
            </Box>
            {examData?.obtainMarks || 0}/{examData?.totalMarks || 0}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

const DocumentsSections = ({ editData }: any) => {
  const document = useBoolean(true);
  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentTypeQuery,
  });

  const { data: employeeDocuments, isLoading: isEmployeeDocLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentsQuery,
    params: editData?.id,
  });

  const tableData = useMemo(
    () =>
      documents?.items?.map((item: any) => ({
        ...item,
        statusVal: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName)
          ? 'Uploaded'
          : 'Not Uploaded',
        docType: item.documentTypes.map((ite: number) => DocumentType[ite]).join(', '),
        statusColor: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName)
          ? 'success'
          : 'warning',
        uploadDocument: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName),
      })) || [],
    [documents?.items, employeeDocuments]
  );
  const viewDialog = useBoolean();
  const [docId, setDocId] = useState<null | string>(null);
  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ typography: 'subtitle2' }}
      >
        Documents
        <IconButton size="small" onClick={document.onToggle}>
          <Iconify
            icon={document.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        </IconButton>
      </Stack>

      {document.value && (
        <Stack spacing={3} sx={{ p: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
          {isLoading ? (
            <CircularProgress size={20} />
          ) : tableData.length ? (
            tableData?.map((item: any) => (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ typography: 'caption', textTransform: 'capitalize' }}
              >
                <Box component="span" sx={{ color: 'text.secondary', mr: 2 }}>
                  {item.documentName}
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Label color={item.uploadDocument ? 'success' : 'warning'}>
                    {item.uploadDocument ? 'Uploaded' : 'Pending'}
                  </Label>
                  <IconButton disabled={!item.uploadDocument} sx={{ p: 0 }}>
                    <Iconify
                      icon="ri:eye-line"
                      onClick={() => {
                        setDocId(item.uploadDocument.id);
                        viewDialog.onTrue();
                      }}
                    />
                  </IconButton>
                  <IconButton disabled={!item.uploadDocument} sx={{ p: 0 }}>
                    <Iconify icon="mingcute:download-line" />
                  </IconButton>
                </Box>
              </Stack>
            ))
          ) : (
            'No Documents Found'
          )}
        </Stack>
      )}
      <Dialog open={viewDialog.value} onClose={viewDialog.onFalse}>
        <ViewDocuments id={editData?.id} docId={docId} />
      </Dialog>
    </Stack>
  );
};

const ViewDocuments = ({ id, docId }: { id: string; docId: string | null }) => {
  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentByIdQuery,
    params: { id, documentId: docId },
  });

  return (
    <Box>
      {isLoading ? (
        <Skeleton variant="rectangular" height={300} />
      ) : (
        <iframe
          src={convertBase64Format(documents.content)}
          style={{ width: '100%', height: 500 }}
          title="Employee Document"
        />
      )}
    </Box>
  );
};

const AssignDivisionForm = ({
  handleClose,
  standardName,
}: {
  handleClose: () => void;
  standardName?: string;
}) => {
  const formik = useFormik({
    initialValues: {
      division: '',
      standardName: standardName || '',
    },
    onSubmit: () => {},
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'Background.neutral',
          gap: 2,
        }}
      >
        <TextField value={formik.values.standardName} label="Standard" disabled size="small" />
        <CustomSelect
          options={[]}
          value=""
          onChange={() => {}}
          label="Division"
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      </Box>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" variant="contained">
          Assign
        </Button>
      </DialogActions>
    </Box>
  );
};

interface ChangeStatusFormProps {
  handleClose: () => void;
  tabValue?: any; // Add correct type if `tabValue` is needed, or remove if unused
  selectedStudents: any[];
}

const ChangeStatusForm: React.FC<ChangeStatusFormProps> = ({
  handleClose,
  tabValue,
  selectedStudents,
}: ChangeStatusFormProps) => {
  const [changeStatus, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangeAdmissionStatusMutation,
  });
  const formik = useFormik<{
    status: RegistrationStatusType;
  }>({
    initialValues: {
      status: 0,
    },
    onSubmit: async (values) => {
      try {
        await changeStatus({
          approvalStatus: values.status,
          body: selectedStudents.map((i: any) => i.id),
        }).unwrap();
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });

  const getStatusOptions = () => {
    switch (tabValue) {
      case RegistrationStatusType.Pending:
        return [
          { label: 'Approved', value: RegistrationStatusType.Approved },
          { label: 'Rejected', value: RegistrationStatusType.Rejected },
        ];
      case RegistrationStatusType.Approved:
        return [
          { label: 'Rejected', value: RegistrationStatusType.Rejected },
          { label: 'Pending', value: RegistrationStatusType.Pending },
        ];
      case RegistrationStatusType.Rejected:
        return [
          { label: 'Approved', value: RegistrationStatusType.Approved },
          { label: 'Pending', value: RegistrationStatusType.Pending },
        ];
      default:
        return [];
    }
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Box sx={{ p: 2, bgcolor: 'Background.neutral' }}>
        <CustomSelect
          options={getStatusOptions()}
          value={formik.values.status}
          onChange={(val) => {
            formik.setFieldValue('status', val);
          }}
          label="Status"
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      </Box>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton loading={isLoading} type="submit" variant="contained">
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
