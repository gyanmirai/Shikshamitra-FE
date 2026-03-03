import type { RootState } from 'src/redux/store';

import { Box } from '@mui/system';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingScreen } from 'src/components/loading-screen';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddBookMutation,
  useGetBookByIdQuery,
  useUpdateBookMutation,
  useGetBookCopiesQuery,
  useUpdateBookCopiesMutation,
} from 'src/redux/library/bookList/bookList-api';

import BookCopiesStep from './BookCopiesStep';
import BookGeneralStep from './BookGeneralForm';
import { bookValidationSchema } from './BookManageValidation';
import { getInitialBookData } from '../Components/BookManageInitialValues';

import type { IBookCopy, IBookPayload } from '../Components/type';

const BookFormStepper = ({
  onClose,
  editData,
}: {
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: (IBookPayload & { id?: string }) | null;
}) => {
  const [activeStep, setActiveStep] = useState(1);

  const { currentAcademicYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = (currentAcademicYear as any)?.id;

  // Mutations
  const [addBook] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBookMutation,
  });
  const [updateBook] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBookMutation,
  });
  const [updateBookCopies] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBookCopiesMutation,
  });

  const steps = ['General Information', 'Manage Copies'];

  const stepComponents = [BookGeneralStep, BookCopiesStep];

  const handleGeneralInfo = useCallback(
    async (values: IBookPayload & { id?: string }, formik: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { copies, ...bookBody } = values;
      const payload = {
        academicYearId,
        body: bookBody,
      };

      if (editData?.id || values.id) {
        const res = await updateBook({
          bookId: editData?.id || values.id,
          ...payload,
        }).unwrap();
        return res;
      }
      const res = await addBook(payload).unwrap();
      formik.setFieldValue('id', res.id);
      return res;
    },
    [academicYearId, addBook, editData?.id, updateBook]
  );

  const handleManageCopies = useCallback(
    async (values: IBookPayload & { id?: string }, formik: any) => {
      const payload = {
        bookId: editData?.id || values.id,
        academicYearId,
        body: {
          copies: values.copies.map((copy: IBookCopy) => ({
            accessionNo: copy.accessionNo,
            section: copy.section,
            shelf: copy.shelf,
          })),
        },
      };

      const res = await updateBookCopies(payload).unwrap();
      return res;
    },
    [academicYearId, editData?.id, updateBookCopies]
  );

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: IBookPayload & { id?: string },
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      setIsLoading(true);
      try {
        if (activeStep === 0) {
          // await handleGeneralInfo(values, formik);
          shikshaMitraToast.success({
            message: `Book "${values.title}" general information saved successfully`,
          });
        } else if (activeStep === 1) {
          // await handleManageCopies(values, formik);
          shikshaMitraToast.success({
            message: `Book "${values.title}" added successfully`,
          });
        }

        if (!isLastStep) {
          if (!isSaveButton) {
            setActiveStep(activeStep + 1);
          }
        } else {
          onClose?.(null, true);
        }
      } catch (error: any) {
        console.error('Book form error:', error);
        shikshaMitraToast.error({
          message:
            error?.data?.message || error?.message || 'Something went wrong. Please try again',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeStep, onClose]
  );

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={getInitialBookData(editData)}
      steps={steps}
      activeStep={activeStep}
      handleBack={() => setActiveStep(activeStep - 1)}
      validationSchema={bookValidationSchema[activeStep as keyof typeof bookValidationSchema]}
      validateOnChange={false}
      isDisabledLabel={!editData}
      onStepClick={(step) => {
        if (editData) {
          setActiveStep(step);
        }
      }}
      handleNext={(
        isLastStep: boolean,
        value: any,
        formik: any,
        setIsLoading: (val: boolean) => void
      ) => handleSave(isLastStep, value, formik, setIsLoading)}
      onSave={(isLastStep, value, formik, setIsLoading) =>
        handleSave(isLastStep, value, formik, setIsLoading, true)
      }
      renderItem={({ formik, activeStep: step }) => (
        <BookStepForm
          activeStep={step}
          formik={formik}
          editData={editData}
          allSteps={stepComponents}
          academicYearId={academicYearId}
        />
      )}
    />
  );
};

export default BookFormStepper;

const BookStepForm = ({ activeStep: step, formik, editData, allSteps, academicYearId }: any) => {
  const initializedStepsRef = useRef<Record<number, boolean>>({});
  const bookId = editData?.id || formik.values.id;

  const { data: bookDetails, isLoading: bookLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookByIdQuery,
    params: { bookId, academicYearId },
    options: { skip: !bookId || step !== 0 },
  });

  const { data: copiesDetails, isLoading: copiesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookCopiesQuery,
    params: { bookId, academicYearId },
    options: { skip: !bookId || step !== 1 },
  });

  useEffect(() => {
    if (initializedStepsRef.current[step]) return;

    if (bookDetails && step === 0) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...bookDetails,
        id: bookId,
      }));
      initializedStepsRef.current[step] = true;
    } else if (copiesDetails && step === 1) {
      formik.setFieldValue('copies', copiesDetails.docs || []);
      initializedStepsRef.current[step] = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookDetails, copiesDetails, step]);

  if (bookLoading || copiesLoading) {
    return <LoadingScreen />;
  }

  const StepComponent = allSteps[step];
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box p={2}>
        <StepComponent formik={formik} />
      </Box>
    </BackPopUpChecked>
  );
};
