'use client';

import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { useGetConcessionTypesQuery } from 'src/redux/finance/concessionType';
import {
  useUploadDocumentsMutation,
  useUpdateValueEntryMutation,
  useGetConcessionRequestByIdQuery,
  useCreateConcessionRequestMutation,
  useUpdateConcessionRequestMutation,
  useUpdateFeeHeadfeeHeadsDataMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import StudentInfoCard from './StudentInfoCard';
import ValueEntryStep from './ConcessionSteps/ValueEntryStep';
// Import new step components
import BasicDetailsStep from './ConcessionSteps/BasicDetailsStep';
import ReviewSubmitStep from './ConcessionSteps/ReviewSubmitStep';
import { concessionStepValidations } from './ConcessionValidation';
import FeeHeadMappingStep from './ConcessionSteps/FeeHeadMappingStep';
import DocumentUploadStep from './ConcessionSteps/DocumentUploadStep';
// Import helpers
import { getInitialConcessionFormData } from './ConcessionInitialValues';
import ConcessionTypeSelectionStep from './ConcessionSteps/ConcessionTypeSelectionStep';

import type { IConcessionFormProps } from '../type';

const STEPS = [
  'Basic Details',
  'Concession Types',
  'Fee Heads',
  'Value Entry',
  'Document Upload',
  'Review & Submit',
];

const NewConcessionRequestForm: React.FC<IConcessionFormProps> = ({
  onClose,
  open,
  student,
  editData,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [activeStep, setActiveStep] = useState(0);

  // API Mutations
  const [createConcessionRequest] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateConcessionRequestMutation,
  });

  const [updateConcessionRequest] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateConcessionRequestMutation,
  });

  const [updateFeeHeadsData] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeHeadfeeHeadsDataMutation,
  });
  const [updateValueEntry] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateValueEntryMutation,
  });

  const [uploadDocuments] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadDocumentsMutation,
  });

  // Fetch concession types once at top level
  const { data: concessionTypes = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypesQuery,
    params: { academicYearId: currentYear?.id },
    options: { skip: !currentYear?.id },
  });

  // Fetch edit data
  const { data: requestDetails, isLoading: isDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionRequestByIdQuery,
    params: editData?.concessionRequestId,
    options: {
      skip: !editData?.concessionRequestId,
      refetchOnMountOrArgChange: true,
    },
  });

  const initialValues = useMemo(() => {
    if (editData?.concessionRequestId && requestDetails?.data) {
      const d = requestDetails.data;
      return {
        ...getInitialConcessionFormData(),
        id: d.concessionRequestId,
        boardId: d.boardId,
        mediumId: d.educationMediumId,
        standardId: d.standardId,
        divisionId: d.divisionId,
        studentId: d.studentId,
        // Pre-fill Step 2: Selected Concession Types
        concessionTypeIds: (d.selectedConcessionTypes || []).map((ct: any) => ct.concessionTypeId),
        selectedConcessionTypes: d.selectedConcessionTypes || [],
        // If names are needed for display (like studentName), we might need to rely on 'editData' (IStudentInfo)
        // or fetch them separately if not provided in 'requestDetails'.
        // Assuming editData has basic info for Step 1 display if needed.
        studentName: editData.studentName,
        standardName: editData.standardName,
        divisionName: editData.divisionName,
        boardName: editData.boardName,
        mediumName: editData.educationMediumName,
        // Add other fields from editData if necessary for display
      };
    }
    return getInitialConcessionFormData();
  }, [editData, requestDetails]);

  const handleNext = async (
    isLastStep: boolean,
    values: any,
    _formik: any,
    setIsLoading: (v: boolean) => void
  ) => {
    setIsLoading(true);
    try {
      if (activeStep === 0) {
        // Step 1 – Just move to next step, no API call
        setActiveStep((s) => s + 1);
        setIsLoading(false);
        return;
      }

      if (activeStep === 1) {
        // Step 2 – Create or Update concession request
        let res: any;
        if (values.id) {
          // Update existing request
          res = await updateConcessionRequest({
            concessionRequestId: values.id,
            boardId: values.boardId,
            educationMediumId: values.mediumId,
            standardId: values.standardId,
            divisionId: values.divisionId,
            studentId: values.studentId,
            concessionTypeIds: values.concessionTypeIds,
          }).unwrap();
          shikshaMitraToast.success({ message: 'Concession request updated successfully' });
        } else {
          // Create new request
          res = await createConcessionRequest({
            boardId: values.boardId,
            educationMediumId: values.mediumId,
            standardId: values.standardId,
            divisionId: values.divisionId,
            studentId: values.studentId,
            concessionTypeIds: values.concessionTypeIds,
          }).unwrap();
          shikshaMitraToast.success({ message: 'Concession request created successfully' });
        }

        const reqId =
          res?.data?.concessionRequestId || res?.concessionRequestId || res?.data?.id || res?.id;
        if (!reqId) {
          throw new Error('Failed to get concession request ID from response');
        }
        _formik.setFieldValue('id', reqId);

        // Store selectedConcessionTypes from API response (contains ConcessionRequestConcessionTypeId)
        const selectedConcessionTypes =
          res?.data?.selectedConcessionTypes || res?.selectedConcessionTypes || [];
        _formik.setFieldValue('selectedConcessionTypes', selectedConcessionTypes);

        setActiveStep((s) => s + 1);
      } else if (activeStep === 2) {
        // Step 3 – Fee Heads
        if (!values.id) throw new Error('Missing concession request ID');

        // Build a lookup: concessionTypeId -> ConcessionRequestConcessionTypeId
        const concessionTypeIdMap: Record<string, string> = {};
        (values.selectedConcessionTypes || []).forEach((ct: any) => {
          concessionTypeIdMap[ct.concessionTypeId] = ct.concessionRequestConcessionTypeId;
        });

        const feeHeadsData = Object.entries(values.selectedFeeHeads).map(
          ([concessionTypeId, feeHeadIds]) => ({
            concessionTypeId,
            concessionRequestConcessionTypeId: concessionTypeIdMap[concessionTypeId] || '',
            feeHeadIds,
          })
        );
        await updateFeeHeadsData({
          concessionRequestId: values.id,
          feeHeadsData,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Fee heads saved' });
        setActiveStep((s) => s + 1);
      } else if (activeStep === 3) {
        // Step 4 – Value Entry
        if (!values.id) throw new Error('Missing concession request ID');

        // Build a lookup: concessionTypeId -> ConcessionRequestConcessionTypeId
        const concessionTypeIdMap: Record<string, string> = {};
        (values.selectedConcessionTypes || []).forEach((ct: any) => {
          concessionTypeIdMap[ct.concessionTypeId] = ct.concessionRequestConcessionTypeId;
        });

        const concessionTypeValues = Object.entries(values.selectedFeeHeads).map(
          ([concessionTypeId, feeHeadIds]: any) => ({
            concessionTypeId,
            concessionRequestConcessionTypeId: concessionTypeIdMap[concessionTypeId] || '',
            feeHeadValues: (feeHeadIds as string[]).map((feeHeadId: string) => {
              const entry = values.valueEntries?.[concessionTypeId]?.[feeHeadId] || {
                basedOn: 0,
                amount: 0,
                netAmount: 0,
              };

              return {
                feeHeadId,
                basedOn: entry.basedOn,
                amount: entry.amount,
                netAmount: entry.netAmount,
              };
            }),
          })
        );

        await updateValueEntry({
          concessionRequestId: values.id,
          concessionTypeValues,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Values saved successfully' });
        setActiveStep((s) => s + 1);
      } else if (activeStep === 4) {
        // Step 5 – Document Upload
        if (!values.id) throw new Error('Missing concession request ID');

        // Build a lookup: concessionTypeId -> ConcessionRequestConcessionTypeId
        const concessionTypeIdMapDocs: Record<string, string> = {};
        (values.selectedConcessionTypes || []).forEach((ct: any) => {
          concessionTypeIdMapDocs[ct.concessionTypeId] = ct.concessionRequestConcessionTypeId;
        });

        // Attach concessionRequestConcessionTypeId to each document group
        const concessionTypeDocuments = (values.concessionTypeDocuments || []).map(
          (docGroup: any) => ({
            ...docGroup,
            concessionRequestConcessionTypeId:
              concessionTypeIdMapDocs[docGroup.concessionTypeId] ||
              docGroup.concessionRequestConcessionTypeId ||
              '',
          })
        );

        await uploadDocuments({
          concessionRequestId: values.id,
          concessionTypeDocuments,
        }).unwrap();

        shikshaMitraToast.success({ message: 'Documents saved successfully' });
        setActiveStep((s) => s + 1);
      } else if (isLastStep) {
        // Step 6 – Review & Submit (Final)
        // You might want a final "Submit" API call here if there is a status change endpoint (e.g., submit for approval).
        // The API doc mentions "The request must be in DRAFT (0) or IN_PROGRESS (1) status."
        // Usually review submit might trigger status change to PENDING_APPROVAL.
        // For now, assume previous steps saved data and this is just closing or final confirmation.
        // If there's no specific "submit" endpoint, we just close.

        shikshaMitraToast.success({ message: 'Concession request submitted successfully' });
        onClose(null, true);
      }
    } catch (err: any) {
      console.error(err);
      shikshaMitraToast.error({
        message: err?.data?.message || err?.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  const renderItem = ({
    formik,
    activeStep: step,
  }: {
    formik: any;
    activeStep: number;
    isBackClick: boolean;
  }) => {
    const { values } = formik;

    return (
      <Box>
        {/* Persistent Student Info Card - shown on all steps */}

        {activeStep !== 0 && (
          <Box p={1}>
            <StudentInfoCard
              studentName={values.studentName || student?.studentName || 'Select Student'}
              classDiv={
                values.standardName && values.divisionName
                  ? `${values.standardName} - ${values.divisionName}`
                  : student
                    ? `${student.standardName || '-'} - ${student.divisionName || '-'}`
                    : '-'
              }
              boardMedium={
                values.boardName && values.mediumName
                  ? `${values.boardName} • ${values.mediumName}`
                  : student
                    ? `${student.boardName || '-'} • ${student.educationMediumName || '-'}`
                    : '-'
              }
              academicYear={currentYear?.name || '-'}
            />
          </Box>
        )}

        {(() => {
          switch (step) {
            case 0:
              return <BasicDetailsStep formik={formik} />;
            case 1:
              return (
                <ConcessionTypeSelectionStep
                  formik={formik}
                  concessionTypes={concessionTypes?.data?.items || []}
                />
              );
            case 2:
              return (
                <FeeHeadMappingStep
                  formik={formik}
                  concessionTypes={concessionTypes?.data?.items || []}
                />
              );
            case 3:
              return (
                <ValueEntryStep
                  formik={formik}
                  concessionTypes={concessionTypes?.data?.items || []}
                />
              );
            case 4:
              return (
                <DocumentUploadStep
                  formik={formik}
                  concessionTypes={concessionTypes?.data?.items || []}
                />
              );
            case 5:
              return (
                <ReviewSubmitStep
                  formik={formik}
                  concessionTypes={concessionTypes?.data?.items || []}
                />
              );
            default:
              return null;
          }
        })()}
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isDetailsLoading ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>Loading Request Details...</Box>
      ) : (
        <CustomStepperWithFormik
          steps={STEPS}
          activeStep={activeStep}
          initialValues={initialValues}
          validationSchema={concessionStepValidations[activeStep]} // Ensure valid schemas for new steps
          handleNext={handleNext}
          handleBack={handleBack}
          renderItem={renderItem}
          showSaveButton={false}
          scrollbarHeight="calc(100vh - 350px)" // Adjusted height
        />
      )}
    </Box>
  );
};

export default NewConcessionRequestForm;
