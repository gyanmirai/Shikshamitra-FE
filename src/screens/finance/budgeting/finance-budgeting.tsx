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
import FinanceBudgetAllocationDialog from './component/finance-budget-allocation-dialog';



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
    const dialogSecond = useBoolean();
    const [selectedEntry, setSelectedEntry] = useState(data);
    const [isEdit, setIsEdit] = useState(false);
    const [tableData, setTableData] = useState(data);

    const closeDialog = () => {
        setIsEdit(false);
        dialogSecond.onFalse();
    }

    const handleDelete = (item: any) => {

        data = data.filter(val =>
            (val.id) !== (item.id) ||
            (val.id) !== (item.id)
        );

        setTableData([...data]);

    }

    const handleSave = (item: any) => {
        // expenseData = expenseData.filter(val =>
        //     (val.id) !== (item.id)
        // );
        // setTableData([...expenseData]);
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

                                                    dialogSecond.onTrue();

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
                maxWidth="sm"
                open={dialog.value}
                handleClose={dialog.onFalse}
                title="New Budget"
            >
                <TimetableForm />
            </CustomDialog>

            <Box>
        {dialogSecond.value && selectedEntry && (
            <FinanceBudgetAllocationDialog
                onSave={handleSave}
                dialogValue={dialogSecond.value}
                onClose={closeDialog}
                data={selectedEntry}
                isEdit={isEdit}
                allData={tableData}
            />
        )}
    </Box>

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

const DepartmentAllocation = () => (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
<CustomSelect
        options={[]}
        label="Select departments"
        name="selectDepartments"
        value=""
        onChange={() => { }}
        formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
    <TextField

    name="fundallocation"
    label="Fund allocation"
    value=""
    onChange={() => { }}
    size="small"

// error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
// helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
/>
    </Box>
    

);

const CategoryAllocation = () => (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
    <CustomSelect
        options={[]}
        label="Categories within departments"
        name="categoriesWithinDepartments"
        value=""
        onChange={() => { }}
        formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
    <TextField

    name="fundallocation"
    label="Fund allocation"
    value=""
    onChange={() => { }}
    size="small"

// error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
// helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
/>
</Box>
);

const TotalBudget = () => (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
    <TextField

name="totalBudget"
label="Total Budget"
value=""
onChange={() => { }}
size="small"

// error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
// helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
/>
    <TextField

    name="fundallocation"
    label="Fund allocation"
    value=""
    onChange={() => { }}
    size="small"

// error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
// helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
/>
</Box>
);
const allTimetableSteps = [
    BudgetTitleAndTimePeriod,
    DepartmentAllocation,
    CategoryAllocation,
    TotalBudget,
    
    
];

const TimetableForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    return (
        <CustomStepperWithFormik
            initialValues={{}}
            steps={[
                
                'Budget Title & Time Period',
                'Department Allocation',
                'Category Allocation',
                'Total Budget',
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

