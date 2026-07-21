import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Button, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import TransportBulkRouteDialog from './component/transport-bulk-route-dialog';
import TransportNotifyParentsDialog from './component/transport-notify-parents.dialog';
import TransportStudentAndStaffUpdateInfoDialog from './component/transport-student-update-route-dialog';

const assignments: any = [
  {
    name: 'Aarav Patel',
    grade: '1',
    id: 1,
    assignedRoute: 'R101',
    pickupPoint: 'School',
    dropoffPoint: 'Dindoli',
  },
  {
    name: 'Meera Shah',
    grade: '2',

    assignedRoute: 'R102',
    pickupPoint: 'School',
    dropoffPoint: 'Godadara',
    id: 3,
  },
  {
    name: 'Rohan Joshi',
    grade: '3',
    id: 4,
    assignedRoute: 'R103',
    pickupPoint: 'School',
    dropoffPoint: 'Mini Bazar',
  },
  {
    name: 'Priya Desai',
    grade: '10',
    id: 5,
    assignedRoute: 'R104',
    pickupPoint: 'School',
    dropoffPoint: 'Ved',
  },
  {
    name: 'Vikram Mehta',
    grade: '9',
    id: 6,
    assignedRoute: 'R105',
    pickupPoint: 'School',
    dropoffPoint: 'Dindoli',
  },
  {
    name: 'Neha Sharma',
    grade: '12',
    id: 7,
    assignedRoute: 'R106',
    pickupPoint: 'School',
    dropoffPoint: 'Godadara',
  },
  {
    name: 'Sanjay Kumar',
    grade: '11',
    id: 8,
    assignedRoute: 'R107',
    pickupPoint: 'School',
    dropoffPoint: 'Mini Bazar',
  },
  {
    name: 'Anjali Verma',
    grade: '10',
    id: 9,
    assignedRoute: 'R108',
    pickupPoint: 'School',
    dropoffPoint: 'Ved',
  },
  {
    name: 'Rahul Gandhi',
    grade: '9',
    id: 11,
    assignedRoute: 'R109',
    pickupPoint: 'School',
    dropoffPoint: 'Dindoli',
  },
  {
    name: 'Kavita Desai',
    grade: '12',
    id: 10,
    assignedRoute: 'R110',
    pickupPoint: 'School',
    dropoffPoint: 'Godadara',
  },
];

const handleSaveForBulk = (e: any) => {};
const handleSaveNotify = (e: any) => {};

const StudentTransportScreen = () => {
  const columnData = [
    { id: 'name', label: 'Name' },
    { id: 'grade', label: 'Grade' },
    // {id:"gradeAndPosition", label:"Grade And Position", render(value:any, row:any){
    //     return <Typography sx={{fontSize:"12PX"}}>{`Grade ${row.grade}, ${row.position}`}</Typography>
    // }},
    { id: 'assignedRoute', label: 'Assigned Route' },
    { id: 'pickupPoint', label: 'Pickup Point' },
    { id: 'dropoffPoint', label: 'Drop-Off Point' },
    {
      id: 'action',
      label: 'Action',
      render(value: any, row: any) {
        return (
          <ThreeDotsActions
            actions={({ popover }: any) => (
              <MenuList>
                <MenuItem
                  onClick={() => {
                    setIsEdit(true);
                    setSelectedEntry(row);

                    dialog.onTrue();
                  }}
                >
                  <Iconify icon="solar:pen-bold" />
                  Assign/Change Route
                </MenuItem>
                {/* <MenuItem
                                    onClick={() => {
                                        // handleDelete(row)
        
                                    }}
                                >
                                     <Iconify icon="solar:pen-bold" />
                                    Update Pickup/Drop-off Point
                                   
                                </MenuItem> */}
                <MenuItem
                  onClick={() => {
                    setSelectedEntry(row);
                    dialogNotify.onTrue();
                  }}
                >
                  <Iconify icon="mingcute:notification-fill" />
                  Notify Parent/Staff
                </MenuItem>
              </MenuList>
            )}
          />
        );
      },
    },
  ];
  const dialog = useBoolean();
  const dialogForBulkEdit = useBoolean();
  const dialogNotify = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(assignments);
  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  const closeDialogForBulk = () => {
    dialogForBulkEdit.onFalse();
  };
  const closeDialogForNotify = () => {
    dialogNotify.onFalse();
  };

  const handleSave = (e: any) => {
    const { id, name, grade, assignedRoute, pickupPoint, dropoffPoint } = e;

    if (isEdit) {
      const existingIndex = tableData.findIndex((val: any) => val.id === id);

      if (existingIndex !== -1) {
        const updatedData = tableData.map((val: any, index: any) =>
          index === existingIndex ? { ...val, assignedRoute, pickupPoint, dropoffPoint } : val
        );
        setTableData(updatedData);

        closeDialog();
        return;
      }
    }

    const studentRouteData = {
      id,
      name,
      grade,
      assignedRoute,
      pickupPoint,
      dropoffPoint,
    };

    const updatedData = [...tableData, studentRouteData];

    setTableData(updatedData);
    closeDialog();
  };

  return (
    <>
      <Box gap={1} py="15px" display="flex" flexDirection="row" justifyContent="flex-end">
        <Button onClick={dialogForBulkEdit.onTrue} variant="contained" size="small">
          Bulk Assign
        </Button>
        <Button onClick={dialog.onTrue} variant="contained" size="small">
          Add Assign Route
        </Button>
      </Box>
      {/* <Box py="15px">
        <Typography component="span" variant="h6" gutterBottom>
          Student Assignment List
        </Typography>
      </Box> */}
      <Box display="flex" alignItems="center" gap={1}>
        {/* <CustomSelect
          isSearch
            label="Route"
            options={[]}
            value=""
            onChange={handleChange}
            formControlProps={{ sx: { minWidth: 120 } }}
          /> */}
        {/* <CustomSelect
          label="Class"
          options={[]}
          value=""
          onChange={handleChange}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Division"
          options={[]}
          value=""
          onChange={handleChange}
          formControlProps={{ sx: { minWidth: 120 } }}
        /> */}
      </Box>
      <CustomizableTable data={tableData} columns={columnData} tableId="student-transport-table" />
      {dialog.value && selectedEntry && (
        <TransportStudentAndStaffUpdateInfoDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
          isStaff={false}
        />
      )}
      {dialogForBulkEdit.value && selectedEntry && (
        <TransportBulkRouteDialog
          onSave={handleSaveForBulk}
          dialogValue={dialogForBulkEdit.value}
          onClose={closeDialogForBulk}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      )}
      {dialogNotify.value && selectedEntry && (
        <TransportNotifyParentsDialog
          onSave={handleSaveNotify}
          dialogValue={dialogNotify.value}
          onClose={closeDialogForNotify}
          data={selectedEntry}
          allData={tableData}
        />
      )}
    </>
  );
};

export default StudentTransportScreen;
