'use client';

import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Card } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { financePermissions } from 'src/constants/finance-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useCreateFeeAdjustmentMutation } from 'src/redux/finance/adjustments/adjustmentApi';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';

import FeeCollectionTable from './Components/FeeCollectionTable';
import { useFinancePermissions } from '../hooks/useFinancePermissions';
import { buildAdjustmentApiPayload } from '../adjustments/types/adjustmentFormValues';

import type { IStudentFee } from './Components/type';
import type { IAdjustmentFullFormValues } from '../adjustments/types/adjustmentFormValues';

const FeeCollectComponentForm = dynamic(
  () => import('./FeeCollectionComponent/FeeCollectionForm')
);
const ViewFeeDetails = dynamic(() => import('./Components/ViewFeeDetails'));
const AdjustmentForm = dynamic(() => import('../adjustments/components/AdjustmentForm'));

const FeeCollection = () => {
  const access = useFinancePermissions(financePermissions.fees.collections);
  const adjustmentAccess = useFinancePermissions(financePermissions.fees.adjustment);
  const academicFilters = useFinanceAcademicFilters();
  const studentDialog = useBoolean();
  const viewDialog = useBoolean();
  const adjustmentDialog = useBoolean();
  const [selectedStudent, setSelectedStudent] = useState<IStudentFee | null>(null);
  // Get the changes status from the confirm popup redux state
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const dispatch = useDispatch();
  const [createFeeAdjustment] = useCreateFeeAdjustmentMutation();
  const { handleClose, confirmation: discardConfirmation } = useFinanceFormClose(
    studentDialog.value,
    () => {
      studentDialog.onFalse();
      setSelectedStudent(null);
    }
  );

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow:
          !studentDialog.value && !viewDialog.value && !adjustmentDialog.value
            ? 'hidden'
            : undefined,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {discardConfirmation}
      {studentDialog.value ? (
        <CustomBreadcrumbs
          description="Select fee items from each category and record a payment."
          heading="Collect fees"

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
            { name: 'Collect fees' },
          ]}
          isBack={studentDialog.value}
          onBack={() => {
            handleClose(null, false);
          }}
        />
      ) : viewDialog.value ? (
        <CustomBreadcrumbs
          description="View detailed fee information and payment history for the selected student."
          heading="Fee Details"

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
          description="Fill in the adjustment details for the selected student."
          heading="Give Adjustment"

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
          description="Select class and division to view students. Click a student to see their fee details and collect fees or send reminders."
          heading="Collections"

          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/fee-collection' },
            { name: 'Collections' },
          ]}
        />
      )}
      <Box
        sx={{
          display:
            !studentDialog.value && !viewDialog.value && !adjustmentDialog.value ? 'flex' : 'none',
          flex: 1,
          minHeight: 0,
          flexDirection: 'column',
        }}
      >
        <FeeCollectionTable
          onAddFee={studentDialog}
          onDelete={() => {}}
          onCollectFee={(row) => {
            if (!access.canAdd) return;
            studentDialog.onTrue();
            setSelectedStudent(row as any);
          }}
          onView={(row) => {
            viewDialog.onTrue();
            setSelectedStudent(row as any);
          }}
          onGiveAdjustment={(row) => {
            if (!adjustmentAccess.canAdd) return;
            adjustmentDialog.onTrue();
            setSelectedStudent(row as any);
          }}
          academicFilters={academicFilters}
        />
      </Box>
      {studentDialog.value && access.canAdd && (
        <CustomDialog
          open
          guardUnsavedChanges={false}
          title={`Collect Fees – ${selectedStudent?.name ?? 'Student'}`}
          fullScreen
          transitionDuration={{ enter: 0, exit: 0 }}
          handleClose={() => {
            studentDialog.onFalse();
            setSelectedStudent(null);
          }}
        >
          <FeeCollectComponentForm student={selectedStudent} onCancel={handleClose} />
        </CustomDialog>
      )}
      {viewDialog.value && selectedStudent && (
        <ViewFeeDetails
          student={selectedStudent}
          collectFeesDialog={studentDialog}
          viewDialog={viewDialog}
        />
      )}
      {adjustmentDialog.value && selectedStudent && adjustmentAccess.canAdd && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AdjustmentForm
            onCancel={() => {
              adjustmentDialog.onFalse();
              setSelectedStudent(null);
            }}
            onSubmit={async (values: IAdjustmentFullFormValues) => {
              try {
                if (!currentYear?.id) {
                  shikshaMitraToast.error({ message: 'Academic year is required.' });
                  return;
                }
                const body = buildAdjustmentApiPayload({
                  ...values,
                  studentId: selectedStudent.id,
                });
                await createFeeAdjustment({ academicYearId: currentYear.id, body }).unwrap();
                adjustmentDialog.onFalse();
                setSelectedStudent(null);
                shikshaMitraToast.success({
                  message: 'Adjustment request created. View it under Finance → Adjustments.',
                });
              } catch (err: any) {
                shikshaMitraToast.error({
                  message: err?.data?.error?.message || 'Failed to create adjustment.',
                });
              }
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
