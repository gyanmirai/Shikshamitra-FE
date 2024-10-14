'use client'

import * as yup from 'yup';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, MenuItem, MenuList, TextField, } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';



interface Data {
    budgetTitle: string,
    totalAmountAllocated: string,
    spent: string,
    remainingBudget: string,
    startDate: string,
    endDate: string,
    departmentBreaked: string,
    id: number,
    action?: string,
}


let data: Data[] = [
    {
        id: 1,
        budgetTitle: 'Tuition Fees',
        totalAmountAllocated: '500',
        spent: 'online',
        remainingBudget: "12",
        startDate: "paid",
        endDate: 'View',
        departmentBreaked: "it",
        action: "edit",

    },
    {
        id: 3,
        budgetTitle: 'Tuition Fees',
        totalAmountAllocated: '500',
        spent: 'online',
        remainingBudget: "12",
        startDate: "paid",
        endDate: 'View',
        departmentBreaked: "it",
        action: "edit",


    },
    {
        id: 2,
        budgetTitle: 'Tuition Fees',
        totalAmountAllocated: '500',
        spent: 'online',
        remainingBudget: "12",
        startDate: "paid",
        endDate: 'View',
        departmentBreaked: "it",
        action: "edit",


    },

];
const FinanceBudgetingScreen = () => {

    const dialog = useBoolean();
    const [selectedEntry, setSelectedEntry] = useState(data);
    const [isEdit, setIsEdit] = useState(false);
    const [tableData, setTableData] = useState(data);

    const handleDelete = (item: any) => {

        data = data.filter(val =>
            (val.id) !== (item.id) ||
            (val.id) !== (item.id)
        );

        setTableData([...data]);

    }


    return (
        <>
            <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">

                <Button onClick={dialog.onTrue} variant="contained" size="small">
                    Create New Budget
                </Button>
            </Box>
            {/* <Box>
                <Typography component="span" variant="h6" gutterBottom>
                    Income OverView
                </Typography>
            </Box> */}

            <CustomizableTable
                columns={[
                    { id: 'budgetTitle', label: 'Budget Title' },
                    { id: 'totalAmountAllocated', label: 'Total Amount Allocated' },
                    { id: 'spent', label: 'Spent' },
                    { id: 'remainingBudget', label: 'Remaining Budget' },
                    { id: 'startDate', label: 'Start Date' },
                    { id: 'endDate', label: 'End Date' },
                    { id: 'departmentBreaked', label: 'Department Breaked' },
                    {
                        id: 'action',
                        label: 'Action',
                        render(value, row: any) {
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
                                                Edit
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {
                                                    handleDelete(row)

                                                }}
                                            >
                                                <Iconify icon="solar:trash-bin-trash-bold" />
                                                Delete
                                            </MenuItem>
                                        </MenuList>
                                    )}
                                />
                            );
                        },
                    },
                ]}
                data={tableData}

            />
            <CustomDialog
                maxWidth="lg"
                open={dialog.value}
                handleClose={dialog.onFalse}
                title="New Timetable"
            >
                <TimetableForm />
            </CustomDialog>

            {/* <Box>
        {dialog.value && selectedEntry && (
            <FinanceAddNewIncomeDialog
                onSave={handleSave}
                dialogValue={dialog.value}
                onClose={closeDialog}
                data={selectedEntry}
                isEdit={isEdit}
                allData={tableData}
            />
        )}
    </Box> */}

        </>
    )
};

export default FinanceBudgetingScreen;

const BudgetTitleAndTimePeriod = () => (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField

            name="Budgettitle"
            label="Budget Title"
            value=""
            onChange={() => { }}
            size="small"

        // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
        // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
        />

        <DatePicker label="Start Date" slotProps={{ textField: { size: 'small' } }} />
        <DatePicker label="End Date" slotProps={{ textField: { size: 'small' } }} />
    </Box>
);

const AddSubject = () => (
    <CustomSelect
        options={[]}
        label="Select Subject"
        name="class"
        value=""
        onChange={() => { }}
        formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
);

const AssignTeacher = () => (
    <CustomSelect
        options={[]}
        label="assign teacher"
        name="class"
        value=""
        onChange={() => { }}
        formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
);

const RoomAllocation = () => (
    <Box>
        <CustomSelect
            options={[]}
            label="list of available rooms"
            name="class"
            value=""
            onChange={() => { }}
            formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
        />
        &nbsp;
    </Box>
);

const SetRecurrence = () => (
    <Box>
        <CustomSelect
            options={[]}
            label="Frequency Selection"
            name="class"
            value=""
            onChange={() => { }}
            formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
        />
        &nbsp;
    </Box>
);

const allTimetableSteps = [
    BudgetTitleAndTimePeriod,
    AddSubject,
    AssignTeacher,
    RoomAllocation,
    SetRecurrence,
];

const TimetableForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    return (
        <CustomStepperWithFormik
            initialValues={{}}
            steps={[
                'Create New Timetable',
                'Add Subject',
                'Assign Teacher',
                'Room Allocation',
                'Set Recurrence',
            ]}
            activeStep={activeStep}
            handleBack={() => {
                setActiveStep(activeStep - 1);
            }}
            // validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
            validationSchema={yup.object().shape({})}
            handleNext={(isLastStep, _values) => {
                if (isLastStep) return;
                setActiveStep(activeStep + 1);
            }}
            renderItem={({ formik, activeStep: step }: any) => {
                const StepComponent = allTimetableSteps[step];
                return (
                    <Box p={2}>
                        <StepComponent />
                    </Box>
                );
            }}
        />
    );
};

