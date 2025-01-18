'use client';

import type { IKanbanColumn } from 'src/types/kanban';
import type { LabelColor } from 'src/components/label';

import { useFormik } from 'formik';
import { useMemo, useState } from 'react';

import {
  Box,
  Tab,
  Tabs,
  Paper,
  Stack,
  Button,
  Drawer,
  Divider,
  MenuList,
  MenuItem,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  drawerClasses,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { paper, varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RegisterForm from '../register/RegisterForm';

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

const tableData = [
  {
    Organization: 'primary',
    Code: 'REG001',
    Name: 'Sarah Anderson',
    FirstName: 'Sarah',
    MiddleName: 'Marie',
    EmployeeDesignation: 'Student',
    StatusName: 'Active',
    parentContactNo: '+91-555-0101',
    class: '5',
    inquiryNo: 'INQ001',
    progress: '100',
  },
  {
    Organization: 'pre-primary',
    Code: 'REG002',
    Name: 'Michael Chen',
    FirstName: 'Michael',
    MiddleName: 'James',
    EmployeeDesignation: 'Student',
    StatusName: 'Inactive',
    parentContactNo: '+91-555-0102',
    class: 'KG-2',
    inquiryNo: 'INQ002',
    progress: '75',
  },
  {
    Organization: 'primary',
    Code: 'REG003',
    Name: 'Emily Rodriguez',
    FirstName: 'Emily',
    MiddleName: 'Sofia',
    EmployeeDesignation: 'Student',
    StatusName: 'Active',
    parentContactNo: '+91-555-0103',
    class: '3',
    inquiryNo: 'INQ003',
    progress: '50',
  },
  {
    Organization: 'secondary',
    Code: 'REG004',
    Name: 'David Thompson',
    FirstName: 'David',
    MiddleName: 'Alexander',
    EmployeeDesignation: 'Student',
    StatusName: 'Active',
    parentContactNo: '+91-555-0104',
    class: '9',
    inquiryNo: 'INQ004',
    progress: '25',
  },
  {
    Organization: 'higher secondary',
    Code: 'REG005',
    Name: 'Lisa Wong',
    FirstName: 'Lisa',
    MiddleName: 'Grace',
    EmployeeDesignation: 'Student',
    StatusName: 'Inactive',
    parentContactNo: '+91-555-0105',
    class: '11',
    inquiryNo: 'INQ005',
    progress: '0',
  },
];

const AdmissionScreen = () => {
  const tabs = useTabs('pending');
  const divisionDialog = useBoolean();
  const statusDialog = useBoolean();
  const openDetails = useBoolean();
  const [open, setOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<any>([]);

  const counts = useMemo(
    () => ({
      pending: data.filter((i) => i.status === 'pending').length,
      approved: data.filter((i) => i.status === 'approved').length,
      rejected: data.filter((i) => i.status === 'rejected').length,
    }),
    []
  );
  const TABS = useMemo(
    () => [
      {
        value: 'pending',
        label: 'Pending',
        count: counts.pending || 0,
        color: 'warning',
      },
      {
        value: 'approved',
        label: 'Approved',
        count: counts.approved || 0,
        color: 'success',
      },
      {
        value: 'rejected',
        label: 'Rejected',
        count: counts.rejected || 0,
        color: 'error',
      },
    ],
    [counts]
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
        columns={[
          {
            id: 'checkBox',
            align: 'left',
            minWidth: '60px',
            isSort: false,
            label: '',
            renderColumn() {
              return (
                <Checkbox
                  checked={selectedStudents.length === tableData.length}
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
                  checked={!!selectedStudents.find((i: any) => i.inquiryNo === row.inquiryNo)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents([...selectedStudents, row]);
                    } else {
                      setSelectedStudents(
                        selectedStudents.filter((i: any) => i.inquiryNo !== row.inquiryNo)
                      );
                    }
                  }}
                />
              );
            },
          },
          { id: 'inquiryNo', align: 'left', label: 'Inquiry No', minWidth: '104px' },
          // { id: 'FirstName', label: 'First Name', minWidth: '110px' },
          // { id: 'MiddleName', label: 'Middle Name', minWidth: '125px' },
          { id: 'Name', label: 'Name' },
          { id: 'Code', label: 'Code' },
          { id: 'class', label: 'Class' },
          { id: 'Organization', label: 'Organization' },
          { id: 'parentContactNo', label: 'Parent Contact No', minWidth: '162px' },

          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showEditIcon
                  showViewIcon
                  handleEditClick={() => {
                    setOpen(true);
                  }}
                  handleViewClick={() => {
                    openDetails.onTrue();
                  }}
                  actions={({ popover }) => (
                    <MenuList>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          divisionDialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="fluent-mdl2:assign" sx={{ height: '16px', width: '16px' }} />
                        Assign Division
                      </MenuItem>
                    </MenuList>
                  )}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={tableData}
      />

      <CustomDialog
        maxWidth="xl"
        open={open}
        handleClose={() => setOpen(false)}
        title="Registration"
      >
        <RegisterForm />
      </CustomDialog>
      <CustomDialog
        open={divisionDialog.value}
        handleClose={divisionDialog.onFalse}
        title="Assign Division"
      >
        <AssignDivisionForm handleClose={divisionDialog.onFalse} />
      </CustomDialog>
      <CustomDialog
        open={statusDialog.value}
        handleClose={statusDialog.onFalse}
        title="Change Status"
      >
        <ChangeStatusForm handleClose={statusDialog.onFalse} />
      </CustomDialog>

      <Drawer
        anchor="right"
        open={openDetails.value}
        onClose={openDetails.onFalse}
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
              onClick={openDetails.onFalse}
              sx={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer' }}
            />
            <StudentDetails />
          </Scrollbar>
        </Paper>
      </Drawer>
    </Box>
  );
};

export default AdmissionScreen;

const StudentDetails = () => (
  <Box>
    <Typography variant="h6" mb={2}>
      Student Details
    </Typography>
    <Typography variant="subtitle2" color="text.secondary">
      Name : John Doe
    </Typography>
    <Typography variant="subtitle2" color="text.secondary">
      Class : 3
    </Typography>
    <Typography variant="subtitle2" color="text.secondary">
      Parent Name : Man Doe
    </Typography>
    <Typography variant="subtitle2" color="text.secondary">
      Contact : +91 99243 12399
    </Typography>

    <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
    <EntranceExamSections />
    <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
    <DocumentsSections />
    <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
    <Button fullWidth variant="soft" color="success" sx={{ mt: 2 }}>
      Approve Application
    </Button>
    <Button fullWidth variant="soft" color="error" sx={{ mt: 2 }}>
      Reject Application
    </Button>
    <Button fullWidth variant="soft" color="info" sx={{ mt: 2 }}>
      Request Information
    </Button>
    <Button fullWidth variant="soft" sx={{ mt: 2 }}>
      Schedule Interview
    </Button>
    <TextField label="Remarks" multiline rows={4} fullWidth sx={{ my: 2 }} />
  </Box>
);

const EntranceExamSections = () => {
  const exam = useBoolean(true);
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
            <Label color="success">Completed</Label>
          </Stack>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 100, color: 'text.secondary', mr: 2 }}>
              Date
            </Box>
            10/10/2024
          </Stack>

          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 100, color: 'text.secondary', mr: 2 }}>
              Obtained Marks
            </Box>
            90/100
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

const DocumentsSections = () => {
  const document = useBoolean(true);
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
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ typography: 'caption', textTransform: 'capitalize' }}
          >
            <Box component="span" sx={{ color: 'text.secondary', mr: 2 }}>
              Birth Certificate
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Iconify icon="ri:eye-line" />
              <Iconify icon="mingcute:download-line" />
            </Box>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ typography: 'caption', textTransform: 'capitalize' }}
          >
            <Box component="span" sx={{ color: 'text.secondary', mr: 2 }}>
              Transfer Certificate
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Iconify icon="ri:eye-line" />
              <Iconify icon="mingcute:download-line" />
            </Box>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ typography: 'caption', textTransform: 'capitalize' }}
          >
            <Box component="span" sx={{ color: 'text.secondary', mr: 2 }}>
              Report Card
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Iconify icon="ri:eye-line" />
              <Iconify icon="mingcute:download-line" />
            </Box>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

const AssignDivisionForm = ({ handleClose }: { handleClose: () => void }) => {
  const formik = useFormik({
    initialValues: {
      division: '',
    },
    onSubmit: () => {},
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Box sx={{ p: 2, bgcolor: 'Background.neutral' }}>
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
const ChangeStatusForm = ({ handleClose }: { handleClose: () => void }) => {
  const formik = useFormik({
    initialValues: {
      status: '',
    },
    onSubmit: () => {},
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Box sx={{ p: 2, bgcolor: 'Background.neutral' }}>
        <CustomSelect
          options={[
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ]}
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
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Box>
  );
};
