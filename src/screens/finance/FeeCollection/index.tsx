'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Box, Card } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import ViewFeeDetails from './Components/ViewFeeDetails';
import FeeCollectionTable from './Components/FeeCollectionTable';
import AdjustmentForm from '../adjustments/components/AdjustmentForm';
import FeeCollectComponentForm from './FeeCollectionComponent/FeeCollectionForm';

import type { IStudentFee } from './Components/type';

const FeeCollection = () => {
  const studentDialog = useBoolean();
  const viewDialog = useBoolean();
  const adjustmentDialog = useBoolean();
  const [selectedStudent, setSelectedStudent] = useState<IStudentFee | null>(null);
  // Get the changes status from the confirm popup redux state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function for triggering actions
  const dispatch = useDispatch();
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      studentDialog.onFalse();
      setSelectedStudent(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      studentDialog.onFalse();
      setSelectedStudent(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {studentDialog.value ? (
        <CustomBreadcrumbs
          heading="Fee Collection Form"
          description="Select the applicable fee term and enter payment details. Once completed, click 'Generate Receipt' to collect the fee."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/fee-collection' },
            {
              name: 'Collections',
              href: '/finance/fee-collection',
              onClick() {
                studentDialog.onFalse();
              },
            },
            { name: 'Fee Collection Form' },
          ]}
          isBack={studentDialog.value}
          onBack={() => {
            handleClose(null, false);
          }}
        />
      ) : viewDialog.value ? (
        <CustomBreadcrumbs
          heading="Fee Details"
          description="View detailed fee information and payment history for the selected student."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/fee-collection' },
            {
              name: 'Collections',
              href: '/finance/fee-collection',
              onClick() {
                viewDialog.onFalse();
                setSelectedStudent(null);
              },
            },
            { name: 'Fee Details' },
          ]}
          isBack={viewDialog.value}
          onBack={() => {
            viewDialog.onFalse();
            setSelectedStudent(null);
          }}
        />
      ) : adjustmentDialog.value ? (
        <CustomBreadcrumbs
          heading="Give Adjustment"
          description="Fill in the adjustment details for the selected student."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/fee-collection' },
            {
              name: 'Collections',
              href: '/finance/fee-collection',
              onClick() {
                adjustmentDialog.onFalse();
                setSelectedStudent(null);
              },
            },
            { name: 'Give Adjustment' },
          ]}
          isBack={adjustmentDialog.value}
          onBack={() => {
            adjustmentDialog.onFalse();
            setSelectedStudent(null);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Collections"
          description="Select class and division to view students. Click a student to see their fee details and collect fees or send reminders."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/fee-collection' },
            { name: 'Collections' },
          ]}
        />
      )}
      {!studentDialog.value && !viewDialog.value && !adjustmentDialog.value && (
        <FeeCollectionTable
          onAddFee={studentDialog}
          onDelete={() => {}}
          onCollectFee={(row) => {
            studentDialog.onTrue();
            setSelectedStudent(row as any);
          }}
          onView={(row) => {
            viewDialog.onTrue();
            setSelectedStudent(row as any);
          }}
          onGiveAdjustment={(row) => {
            adjustmentDialog.onTrue();
            setSelectedStudent(row as any);
          }}
        />
      )}
      <CustomDialog
        open={studentDialog.value}
        title={`Fee Collection - ${selectedStudent?.name ?? selectedStudent?.name ?? 'Student'}`}
        fullScreen
        transitionDuration={{ enter: 0, exit: 0 }}
        handleClose={() => {
          studentDialog.onFalse();
          setSelectedStudent(null);
        }}
      >
        <FeeCollectComponentForm student={selectedStudent} onCancel={handleClose} />
      </CustomDialog>
      {viewDialog.value && selectedStudent && (
        <ViewFeeDetails
          student={selectedStudent}
          collectFeesDialog={studentDialog}
          viewDialog={viewDialog}
        />
      )}
      {adjustmentDialog.value && selectedStudent && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AdjustmentForm
            onCancel={() => {
              adjustmentDialog.onFalse();
              setSelectedStudent(null);
            }}
            onSubmit={(values) => {
              adjustmentDialog.onFalse();
              setSelectedStudent(null);
            }}
            hideStudentInfoForm
            initialData={{ studentId: selectedStudent.id }}
          />
        </Card>
      )}
    </Box>
  );
};

export default FeeCollection;
