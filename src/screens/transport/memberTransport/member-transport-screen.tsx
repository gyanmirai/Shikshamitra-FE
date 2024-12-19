'use client'

import type { LabelColor } from 'src/components/label';

import React, { useMemo, useState } from 'react'

import { Box, Tab, Tabs, Button, Divider, MenuItem, MenuList, } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import TransportNotifyParentsDialog from '../starffTransport/component/transport-notify-parents.dialog';
import TransportStudentAndStaffUpdateInfoDialog from '../starffTransport/component/transport-student-update-route-dialog';


const TABS = [
    {
        value: 'student',
        label: 'Student',
        icon: <Iconify icon="stash:feed-duotone" width={20} />,
        color: 'default',
        count: 100,
        //   component: () => <FinanceFeeStructureOverview />,
    },
    {
        value: 'staff',
        label: 'Staff',
        icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
        color: 'success',
        count: 20
        //   component: () => <FinanceStudentStructureOverview />,
    },
];
const assignmentsForStaff: any = [
    {
        name: "Ms. Anjali Verma",
        grade: "-",
        id: 9,
        assignedRoute: "R108",
        pickupPoint: "School",
        dropoffPoint: "Ved",
        role: "Teacher",
        employeeNo: "567"
    },
    {
        name: "Mr. Rahul Gandhi",
        grade: "-",
        id: 11,
        assignedRoute: "R109",
        pickupPoint: "School",
        dropoffPoint: "Dindoli",
        role: "Teacher",
        employeeNo: "568"
    },
    {
        name: "Ms. Kavita Desai",
        grade: "-",
        id: 10,
        assignedRoute: "R110",
        pickupPoint: "School",
        dropoffPoint: "Godadara",
        role: "Teacher",
        employeeNo: "569"
    },


];

const assignments: any = [

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
        { id: 'grNo', label: 'Gr No' },
        { id: 'name', label: 'Name' },
        { id: 'grade', label: 'Standard' },


        { id: 'assignedRoute', label: 'Assigned Route' },
        { id: 'dropoffPoint', label: 'Stop' },

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
                                        setIsStaff(false)
                                        setClickFromTable(true);

                                        dialog.onTrue();
                                    }}
                                >
                                    <Iconify icon="solar:pen-bold" />
                                    Change Route
                                </MenuItem>

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

    const columnDataForStaff = [
        { id: 'employeeNo', label: 'Employee No' },
        { id: 'name', label: 'Name' },



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
                                        setIsStaff(true)
                                        setSelectedEntry(row);
                                        setClickFromTable(true);
                                        dialog.onTrue();
                                    }}
                                >
                                    <Iconify icon="solar:pen-bold" />
                                    Assign/Change Route
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
    const [isStaff, setIsStaff] = useState(false);
    const [clickFromTable, setClickFromTable] = useState(false);
    const [tableData, setTableData] = useState(assignments);
    const [tableDataForStaff, setTableDataForStaff] = useState(assignmentsForStaff);
    const closeDialog = () => {
        setClickFromTable(false)
        setIsStaff(false);
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



    const [searchParams, setSearchParams] = useState({ tab: 'student' });

    const currentActiveComponent = useMemo(
        () => TABS.find((tab) => tab.value === searchParams?.tab),
        [searchParams.tab,]
    );


    return (
        <>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                {/* Tabs aligned to the left */}
                <Tabs
                    value={searchParams.tab}
                    onChange={(e, value) => setSearchParams({ tab: value })}
                    sx={{
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
                                        variant="soft"
                                        color={(tab?.color as LabelColor) || 'default'}
                                    >
                                        {tab.count}
                                    </Label>
                                </Box>
                            }
                            value={tab.value}
                        />
                    ))}
                </Tabs>

                {/* CTA buttons aligned to the right */}
                <Box display="flex" gap={3}>
                    <Button onClick={dialogForBulkEdit.onTrue} variant="contained" size="small">
                        Bulk Assign
                    </Button>
                    <Button onClick={dialog.onTrue} variant="contained" size="small">
                        Assign Route
                    </Button>
                </Box>
            </Box>


            <Divider />
            {searchParams.tab === "student" && <CustomizableTable data={tableData} columns={columnData} />}
            {searchParams.tab === "staff" && <CustomizableTable data={tableDataForStaff} columns={columnDataForStaff} />}
            {dialog.value && (
                <TransportStudentAndStaffUpdateInfoDialog
                    onSave={handleSave}
                    dialogValue={dialog.value}
                    onClose={closeDialog}
                    data={selectedEntry}
                    isEdit={isEdit}
                    allData={tableData}
                    isStaff={isStaff}
                    clickFromTable={clickFromTable}
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