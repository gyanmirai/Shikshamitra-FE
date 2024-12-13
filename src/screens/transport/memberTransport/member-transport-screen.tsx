'use client'

import React, { useState } from 'react'

import { Box, Button, MenuItem, MenuList, } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TransportNotifyParentsDialog from '../starffTransport/component/transport-notify-parents.dialog';
import TransportStudentAndStaffUpdateInfoDialog from '../starffTransport/component/transport-student-update-route-dialog';



const assignments: any = [
    {
        name: "Ms. Anjali Verma",
        grade: "-",
        id: 9,
        assignedRoute: "R108",
        pickupPoint: "School",
        dropoffPoint: "Ved",
        role: "Teacher",
        grNo: "567"
    },
    {
        name: "Mr. Rahul Gandhi",
        grade: "-",
        id: 11,
        assignedRoute: "R109",
        pickupPoint: "School",
        dropoffPoint: "Dindoli",
        role: "Teacher",
        grNo: "568"
    },
    {
        name: "Ms. Kavita Desai",
        grade: "-",
        id: 10,
        assignedRoute: "R110",
        pickupPoint: "School",
        dropoffPoint: "Godadara",
        role: "Teacher",
        grNo: "569"
    },
    {
        name: "Aarav Patel",
        grade: "1",
        id: 1,
        assignedRoute: "R101",
        pickupPoint: "School",
        dropoffPoint: "Dindoli",
        role: "Student",
        grNo: "570"
    },
    {
        name: "Meera Shah",
        grade: "2",
        id: 3,
        assignedRoute: "R102",
        pickupPoint: "School",
        dropoffPoint: "Godadara",
        role: "Student",
        grNo: "571"
    },

];

const handleChange = (e: any) => {
    console.log(e);
};

const handleSaveForBulk = (e: any) => {
    console.log(e);
};
const handleSaveNotify = (e: any) => {
    console.log(e);
};
const MemberTransportScreen = () => {
    const columnData = [
        { id: 'grNo', label: 'Gr / Employee No' },
        { id: 'name', label: 'Name' },
        { id: 'grade', label: 'Standard' },
        { id: 'role', label: 'Role' },
        // {id:"gradeAndPosition", label:"Grade And Position", render(value:any, row:any){
        //     return <Typography sx={{fontSize:"12PX"}}>{`Grade ${row.grade}, ${row.position}`}</Typography>
        // }},
        { id: 'assignedRoute', label: 'Assigned Route' },
        { id: 'dropoffPoint', label: 'Pickup/DropOff Point' },

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
                                    Notify Parents
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
            <CustomBreadcrumbs
                heading="Member Transport Management"
                links={[{ name: 'Transport' }, { name: 'Member Transport Management' }]}
                sx={{ px: 1, mb: 2 }}
            />
            <Box gap={3} py="15px" display="flex" flexDirection="row" justifyContent="flex-end">
                <Button onClick={dialogForBulkEdit.onTrue} variant="contained" size="small">
                    Bulk Assign
                </Button>
                <Button onClick={dialog.onTrue} variant="contained" size="small">
                    Assign Route
                </Button>
            </Box>


            <CustomizableTable data={tableData} columns={columnData} />
            {dialog.value && (
                <TransportStudentAndStaffUpdateInfoDialog
                    onSave={handleSave}
                    dialogValue={dialog.value}
                    onClose={closeDialog}
                    data={selectedEntry}
                    isEdit={isEdit}
                    allData={tableData}
                    isStaff
                />
            )}
            {/* {dialogForBulkEdit.value && (
        <TransportBulkRouteDialog
          onSave={handleSaveForBulk}
          dialogValue={dialogForBulkEdit.value}
          onClose={closeDialogForBulk}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      )} */}
            {dialogNotify.value && (
                <TransportNotifyParentsDialog
                    onSave={handleSaveNotify}
                    dialogValue={dialogNotify.value}
                    onClose={closeDialogForNotify}
                    data={selectedEntry}
                    allData={tableData}
                />
            )}
        </>
    )
}

export default MemberTransportScreen