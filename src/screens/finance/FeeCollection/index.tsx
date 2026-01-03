'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Box, Card } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import ViewFeeDetails from './Components/ViewFeeDetails';
import FeeCollectionTable from './Components/FeeCollectionTable';
import FeeCollectComponent from './Components/FeeCollectComponent';

import type { IStudentFee } from './Components/type';

const FeeCollection = () => {
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedMedium, setSelectedMedium] = useState('');

  const studentDialog = useBoolean();
  const viewDialog = useBoolean();
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
            {
              name: 'Fee Collection',
              href: '/finance/fee-collection',
              onClick() {
                studentDialog.onFalse();
              },
            },
            { name: 'Fee Collection Form' },
          ]}
          sx={{ mb: 2 }}
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
            { name: 'Fee Collection' },
            { name: 'Fee Details' },
          ]}
          isBack={viewDialog.value}
          onBack={() => {
            viewDialog.onFalse();
            setSelectedStudent(null);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Fee Collection"
          description="Select class and division to view students. Click a student to see their fee details and collect fees or send reminders."
          links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Fee Collection' }]}
          sx={{ mb: 2 }}
        />
      )}
      {!studentDialog.value && !viewDialog.value && (
        <FeeCollectionTable
          onAddFee={studentDialog}
          selectedBoard={selectedBoard}
          setSelectedBoard={setSelectedBoard}
          selectedMedium={selectedMedium}
          setSelectedMedium={setSelectedMedium}
          onDelete={() => {}}
          onCollectFee={(row) => {
            studentDialog.onTrue();
            setSelectedStudent(row as IStudentFee);
          }}
          onView={(row) => {
            viewDialog.onTrue();
            setSelectedStudent(row as IStudentFee);
          }}
        />
      )}
      {studentDialog.value && selectedStudent && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <FeeCollectComponent student={selectedStudent} onCancel={handleClose} />
        </Card>
      )}
      {viewDialog.value && selectedStudent && (
        <ViewFeeDetails
          student={selectedStudent}
          collectFeesDialog={studentDialog}
          viewDialog={viewDialog}
        />
      )}{' '}
    </Box>
  );
};

export default FeeCollection;
