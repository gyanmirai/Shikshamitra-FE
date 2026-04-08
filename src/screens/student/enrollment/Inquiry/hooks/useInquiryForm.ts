// Types
import type { Board, AcademicYear } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
// Redux / API
import { useGetYearQuery } from 'src/redux/year/yearApi';
// Utils / Components
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';
import {
  useAddStudentInquiryMutation,
  useGetStudentInquiryByIdQuery,
  useUpdateStudentInquiryMutation,
} from 'src/redux/student/inquiry/inquiry-api';

import { inquiryInitialValues } from '../initialvalues';
import { inquiryValidationSchema } from '../validationSchema';

import type { IInquiryResponse, IInquiryFormValues } from '../type';

/**
 * useInquiryForm Hook
 *
 * Encapsulates the logic for the Student Inquiry Form, including:
 * - Form state management (Formik)
 * - Data fetching (RTK Query) for dropdowns and existing data
 * - Cascading dropdown logic (Year -> Board -> Medium -> Class)
 * - CRUD operations (Add/Update Inquiry)
 *
 * @param handleClose - Function to close the dialog/modal
 * @param editData - Data of the student to edit (if any)
 */
export const useInquiryForm = (
  handleClose: (e: any, isSubmit?: boolean) => void,
  editData: IInquiryResponse | null
) => {
  const { currentYear } = useSelector((state: any) => state.globalState);
  const dialog = useBoolean(); // For "Add new Inquiry Preference" modal if needed
  const isSaveAndNewRef = useRef(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [boards, setBoards] = useState<Board[]>([]);

  // --- API Hooks ---

  // 1. Academic Years
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });

  // 2. Boards
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  // 3. Inquiry Preferences
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
    params: {
      academicYearId: currentYear?.id,
    },
    options: {
      skip: !currentYear?.id,
    },
  });

  // 4. Classes (Lazy Fetch)
  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  // 5. Add Mutation
  const [addInquiry, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentInquiryMutation,
  });

  // 6. Update Mutation
  const [updateInquiry, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentInquiryMutation,
  });

  // 7. Get Single Inquiry (for Edit, usually if editData has partial info or needing fresh fetch)
  const { data: inquiryData, isLoading: isGetLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentInquiryByIdQuery,
    params: { studentId: editData?.studentId },
    options: { skip: !editData?.studentId },
  });

  // --- Helper Functions ---

  const preparePayload = (values: IInquiryFormValues, isUpdate: boolean) => {
    const commonPayload = {
      firstName: values.firstName || undefined,
      middleName: values.middleName || undefined,
      lastName: values.lastName || undefined,
      previousSchool: values.previousSchool || undefined,
      dateOfBirth: dateConvertor(values.dateOfBirth?.format(dateFormat) || '') || '',
      dateOfInquiry: dateConvertor(values.dateOfInquiry?.format(dateFormat) || '') || '',
      gender: +values.gender,
      primaryContactNo: values.primaryContactNumber || undefined,
      secondaryContactNo: values.secondaryContactNumber || undefined,
      city: values?.city?.name || undefined,
      state: values?.state?.name
        ? { name: values?.state?.name, isoCode: values?.state?.isoCode }
        : undefined,
      country: values?.country?.name
        ? { name: values?.country?.name, isoCode: values?.country?.isoCode }
        : undefined,
      pinCode: values.pinCode || undefined,
      address1: values.addressLine1 || undefined,
      address2: values.addressLine2 || undefined,
      address3: values.addressLine3 || undefined,
      academicMediumId: values.medium || undefined,
      standardId: values.class || undefined,
      inquiryPreferenceId: values.inquiryPreferences || undefined,
      email: values.email || undefined,
      // Note: academicYearId and educationBoardId might be needed if they are editable
      // original code commented them out in payload or relied on backend defaults?
      // Re-enabling explicit send if values exist and it makes sense
      // academicYearId: values.academicYear || undefined,
      // educationBoardId: values.board || undefined,
    };

    return commonPayload;
  };

  // --- Formik ---

  const initialValues = useMemo(() => {
    // Determine default academic year logic if not editing
    const latestYearId = academicYear?.items?.length
      ? academicYear.items[academicYear.items.length - 1].id
      : undefined;

    // We can filter boards here initially for non-edit mode
    if (!editData) {
      // const findBoards = board?.items.filter((item: Board) => item.academicYearId === latestYearId);
      // Side effect in useMemo is generally bad practice,
      // but we need to setBoards somewhere. Better in useEffect.
      // However, we'll return values here.
    }

    return inquiryInitialValues(editData, latestYearId);
  }, [academicYear.items, editData]);

  const formik = useFormik({
    initialValues,
    validationSchema: inquiryValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true, // Important for editData loading
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = preparePayload(values, !!editData);

        if (editData) {
          await updateInquiry({
            id: editData.studentId,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `Inquiry for ${values.firstName} ${values.lastName} updated successfully for ${selectedAcademicYear}`,
          });
        } else {
          await addInquiry(payload).unwrap();
          shikshaMitraToast.success({
            message: `Inquiry for ${values.firstName} ${values.lastName} added successfully for ${selectedAcademicYear}`,
          });
        }

        if (isSaveAndNewRef.current && !editData) {
          resetForm();
          // Reset default year
          formik.setFieldValue('academicYear', currentYear?.id);
        } else {
          handleClose(null, true);
        }
      } catch (error) {
        console.error('Error submitting inquiry:', error);
        // Toast handled by RTK Query middleware typically, or add here if needed
      }
    },
  });

  const { values, resetForm } = formik;

  // --- Side Effects ---

  // 1. Sync data when fetched by ID (detailed edit data)
  useEffect(() => {
    if (inquiryData?.data) {
      // Derive board from medium when academicBoardId is null
      let derivedBoardId = inquiryData.data.academicBoardId || '';
      let derivedYearId = inquiryData.data.academicYearId || '';

      if (!derivedBoardId && inquiryData.data.academicMediumId && board?.items) {
        const derivedBoard = board.items.find((b: Board) =>
          b.educationMediums?.some((m: any) => m.id === inquiryData.data.academicMediumId)
        );
        if (derivedBoard) {
          derivedBoardId = derivedBoard.id;
          if (!derivedYearId) {
            derivedYearId = derivedBoard.academicYearId || '';
          }
        }
      }

      const fallbackYearId = derivedYearId || currentYear?.id || '';

      resetForm({
        values: {
          ...inquiryInitialValues(inquiryData.data, fallbackYearId),
          board: derivedBoardId,
          academicYear: fallbackYearId,
        },
      });
    }
  }, [inquiryData?.data, board?.items, currentYear?.id, resetForm]);

  // 2. Cascading Dropdowns Logic
  useEffect(() => {
    // Update selected Academic Year Name for toast/display
    const year = academicYear?.items?.find((item: AcademicYear) => item.id === values.academicYear);
    if (year) setSelectedAcademicYear(year.name);

    // Filter Boards based on Academic Year
    // Use values.academicYear (already derived/fallback-populated) rather than editData?.academicYearId
    // which can be null when the backend doesn't return it
    if (board?.items) {
      const yearIdToFilter = values.academicYear || editData?.academicYearId;
      if (yearIdToFilter) {
        const findBoards = board.items.filter(
          (item: Board) => item.academicYearId === yearIdToFilter
        );
        setBoards(findBoards);
      }
    }
  }, [academicYear?.items, board?.items, editData?.academicYearId, values.academicYear]);

  // 3. Load Classes when Medium is present (Edit Mode or Selection)
  useEffect(() => {
    if (editData?.academicMediumId) {
      getClassByMedium(editData.academicMediumId);
    }
    // Note: We also trigger this in the onChange of the Medium dropdown in UI.
  }, [editData?.academicMediumId, getClassByMedium]);

  return {
    formik,
    data: {
      academicYear,
      board,
      boards, // Filtered boards
      classes,
      inquiryPreference,
      inquiryData,
    },
    loading: {
      yearLoading,
      boardLoading,
      classLoading,
      inquiryPrefrenceLoading,
      isAddLoading,
      isUpdateLoading,
      isGetLoading,
    },
    actions: {
      getClassByMedium,
      dialog, // for Preference Modal
      isSaveAndNewRef,
    },
  };
};
