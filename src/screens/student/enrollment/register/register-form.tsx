import type { BoxProps } from '@mui/material';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { MotherTongueType } from 'src/enums/mother-tongue';
import { getBase64String } from 'src/utils/get-base64-string';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { Box, Grid, Slide, Button, TextField, Typography } from '@mui/material';
import {
  useGetBasicDetailsQuery,
  useGetFamilyDetailsQuery,
  useGetParentBankDetailsQuery,
  useUpdateBasicDetailsMutation,
  useUpdateFamilyDetailsMutation,
  useGetPreviousSchoolDetailsQuery,
  useGetStudentMedicalDetailsQuery,
  useAddStudentRegistrationMutation,
  useUpdateParentBankDetailsMutation,
  useGetStudentAdditionalDetailsQuery,
  useUpdatePreviousSchoolDetailsMutation,
  useUpdateStudentMedicalDetailsMutation,
  useGetStudentCommunicationDetailsQuery,
  useUpdateStudentAdditionalDetailsMutation,
  useUpdateStudentCommunicationDetailsMutation,
} from 'src/redux/student/registration/registration-api';

import { allFields } from './register-fields';
import { StepSkeleton } from './register-form-skeleton';
import { validationSchemas } from './register-form-validation';
import {
  bankDetailsInitialValues,
  familyFieldsInitialValues,
  generalFieldsInitialValues,
  medicalFieldsInitialValues,
  documentFieldsInitialValues,
  additionalDetailsInitialValues,
  CommunicationFieldsInitialValues,
  previousSchoolFieldsInitialValues,
} from './initialvalues';

import type {
  FieldsType,
  IBankDetailsResponse,
  IPreviousSchoolResponse,
  IFamilyInformationResponse,
  IGeneralInformationResponse,
  IMedicalInformationResponse,
  IAdditionalInformationResponse,
  ICommunicationInformationResponse,
} from './type';

const SyncReduxDirty = ({ formik }: { formik: any }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    let isReallyDirty = false;

    if (formik.dirty) {
      isReallyDirty = Object.keys(formik.values).some((key) => {
        const val1 = formik.values[key];
        const val2 = formik.initialValues[key];

        if (val1 === val2) return false;

        if (val1 instanceof FormData || val2 instanceof FormData) return false;

        if (dayjs.isDayjs(val1) || dayjs.isDayjs(val2)) {
          if (dayjs.isDayjs(val1) && dayjs.isDayjs(val2)) {
            return val1.format('YYYY-MM-DD') !== val2.format('YYYY-MM-DD');
          }
          return val1 !== val2;
        }

        if (key === 'mobileNo' || key === 'secondaryMobileNo') {
          const clean1 = (val1 || '').replace(/[^0-9]/g, '');
          const clean2 = (val2 || '').replace(/[^0-9]/g, '');

          if (clean1 !== clean2) {
            if (!clean2 && clean1.length <= 2) return false; // Default country code
            return true;
          }
          return false;
        }

        if (Array.isArray(val1) && Array.isArray(val2)) {
          return JSON.stringify(val1) !== JSON.stringify(val2);
        }

        if (val1 && val2 && typeof val1 === 'object' && typeof val2 === 'object') {
          return JSON.stringify(val1) !== JSON.stringify(val2);
        }
        return val1 !== val2;
      });
    }
    dispatch(setIsChanges(isReallyDirty));
  }, [dispatch, formik.dirty, formik.values, formik.initialValues]);

  return null;
};

// Required field keys per step (derived from each step's validation schema)
const REQUIRED_FIELD_KEYS: string[][] = [
  // Step 0 – General
  [
    'formNo',
    'firstName',
    'lastName',
    'dob',
    'gender',
    'familyCast',
    'castCategory',
    'primaryContactNumber',
    'addressLine1',
    'addressLine2',
    'medium',
    'board',
    'academicYear',
    'class',
    'country',
    'city',
    'state',
  ],
  // Step 1 – Documents (no required fields)
  [],
  // Step 2 – Family
  ['fatherName', 'motherName'],
  // Step 3 – Communication (no required fields)
  [],
  // Step 4 – Additional Details (no required fields)
  [],
  // Step 5 – Medical Records
  ['covidVaccination'],
  // Step 6 – Prev. School Details (no required fields)
  [],
  // Step 7 – Bank Details (no required fields)
  [],
];

const BASE_STEPS = [
  'General',
  'Documents',
  'Family',
  'Communication',
  // 'Account Detail',
  'Additional Details',
  'Medical Records',
  'Prev. School Details',
  'Bank Details',
];

function isFieldFilled(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (dayjs.isDayjs(value)) return value.isValid();
  if (typeof value === 'object' && !Array.isArray(value)) return !!(value as any).name;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !Number.isNaN(value);
  return Boolean(value);
}

function computeStepFieldCounts(values: any): { completed: number; total: number }[] {
  return REQUIRED_FIELD_KEYS.map((keys) => ({
    total: keys.length,
    completed: keys.filter((key) => isFieldFilled(values[key])).length,
  }));
}

/**
 * Watches formik values and notifies parent when required-field counts change.
 * Avoids triggering unnecessary state updates via a string-keyed comparison.
 */
const StepCountSyncer = ({
  formikValues,
  onCountChange,
}: {
  formikValues: any;
  onCountChange: (counts: { completed: number; total: number }[]) => void;
}) => {
  const prevKeyRef = useRef('');
  useEffect(() => {
    const newCounts = computeStepFieldCounts(formikValues);
    const newKey = newCounts.map((c) => `${c.completed}/${c.total}`).join(',');
    if (prevKeyRef.current !== newKey) {
      prevKeyRef.current = newKey;
      onCountChange(newCounts);
    }
  }, [formikValues, onCountChange]);
  return null;
};

const RegisterForm = ({
  editData,
  handleClose,
  isComeFromIssueForm = false,
}: {
  editData:
    | null
    | IGeneralInformationResponse
    | IBankDetailsResponse
    | IPreviousSchoolResponse
    | IFamilyInformationResponse
    | ICommunicationInformationResponse
    | IAdditionalInformationResponse
    | IMedicalInformationResponse;
  handleClose: (e: any, isSubmit?: boolean) => void;
  isComeFromIssueForm?: boolean;
}) => {
  const dispatch = useDispatch();
  const formikRef = useRef<any>(null);
  const resetCurrentStepRef = useRef<(() => void) | null>(null);
  const [savedStudentId, setSavedStudentId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [stepCounts, setStepCounts] = useState<{ completed: number; total: number }[]>(
    BASE_STEPS.map((_, i) => ({ completed: 0, total: REQUIRED_FIELD_KEYS[i].length }))
  );
  const handleCountChange = useCallback(
    (counts: { completed: number; total: number }[]) => setStepCounts(counts),
    []
  );
  const stepsWithCounts = BASE_STEPS.map((label, i) => {
    const { completed, total } = stepCounts[i];
    return total > 0 ? `${label} (${completed}/${total})` : label;
  });
  const [pendingStep, setPendingStep] = useState<number | null>(null);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const [addRegistration] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentRegistrationMutation,
  });
  const [updateBasicDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBasicDetailsMutation,
  });
  const [updateFamilyDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFamilyDetailsMutation,
  });
  const [updateCommunicationDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentCommunicationDetailsMutation,
  });
  const [updateMedicalDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentMedicalDetailsMutation,
  });
  const [updatePreviousSchoolDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePreviousSchoolDetailsMutation,
  });
  const [updateAdditionDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentAdditionalDetailsMutation,
  });
  const [updateBankDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateParentBankDetailsMutation,
  });

  const handleGeneralFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        const targetStudentId = editData?.studentId || values?.id || savedStudentId;
        if (targetStudentId) {
          await updateBasicDetails({
            id: targetStudentId,
            body: {
              firstName: values.firstName,
              middleName: values.middleName || undefined,
              lastName: values.lastName,
              dateOfBirth: dateConvertor(values.dob?.format(dateFormat) || '') || '',
              gender: +values.gender,
              profilePictureUrl: values.photo ? getBase64String(values.photo) : '',
              primaryContactNo: values.primaryContactNumber,
              secondaryContactNo: values.secondaryContactNumber || undefined,
              email: values.email || undefined,
              aadharNo: values.adharNo ? String(values.adharNo) : undefined,
              apparId: values.apparId || undefined,
              panNo: values.panNo || undefined,
              pennNo: values.pennNo || undefined,
              religion: values.religion || undefined,
              familyCast: values.familyCast,
              castCategory: values.castCategory,
              nationality: values.nationality || undefined,
              birthPlace: values.birthPlace || undefined,
              motherTongue:
                values.motherTongue != null && values.motherTongue !== ''
                  ? MotherTongueType[values.motherTongue as keyof typeof MotherTongueType]
                  : undefined,
              address1: values.addressLine1,
              address2: values.addressLine2,
              address3: values.addressLine3 || undefined,
              city: values?.city?.name,
              inquiryPreferenceId: values.inquiryPreference || undefined,
              state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              pincode: values.pinCode ? String(values.pinCode) : undefined,
              academicMediumId: values.medium,
              standardId: values.class,
              formNumber: values.formNo,
              // academicYearId: values.academicYear,
              // educationBoardId: values.board,
            },
          }).unwrap();
          // if (isComeFromIssueForm) {
          //   await moveToRegistration(editData?.id);
          //   // router.push('/student/enrollment/registration');
          // }
        } else {
          const resp = await addRegistration({
            firstName: values.firstName,
            middleName: values.middleName || undefined,
            lastName: values.lastName,
            dateOfBirth: dateConvertor(values.dob?.format(dateFormat) || '') || '',
            gender: values.gender,
            profilePictureUrl: values.photo ? getBase64String(values.photo) : '',
            primaryContactNo: values.primaryContactNumber,
            secondaryContactNo: values.secondaryContactNumber || undefined,
            email: values.email || undefined,
            aadharNo: values.adharNo ? String(values.adharNo) : undefined,
            apparId: values.apparId || undefined,
            panNo: values.panNo || undefined,
            pennNo: values.pennNo || undefined,
            inquiryPreferenceId: values.inquiryPreference || undefined,
            religion: values.religion || undefined,
            familyCast: values.familyCast,
            castCategory: values.castCategory,
            nationality: values.nationality || undefined,
            birthPlace: values.birthPlace || undefined,
            motherTongue:
              values.motherTongue != null && values.motherTongue !== ''
                ? MotherTongueType[values.motherTongue as keyof typeof MotherTongueType]
                : undefined,
            address1: values.addressLine1,
            address2: values.addressLine2,
            address3: values.addressLine3 || undefined,
            city: values?.city?.name,
            state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
            country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
            pincode: values.pinCode ? String(values.pinCode) : undefined,
            previousSchool: values.previousSchool || undefined,
            lastClassPassed: values.lastClassPassed || undefined,
            academicMediumId: values.medium,
            standardId: values.class,

            formNumber: values.formNo,
            // academicYearId: values.academicYear,
            // educationBoardId: values.board,
          }).unwrap();
          // Safe fallback checking both studentId and id
          const newStudentId = resp?.data?.studentId || resp?.data?.id;

          if (newStudentId) {
            setSavedStudentId(newStudentId);
            formik.setFieldValue('id', newStudentId);
          }
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    [addRegistration, editData, updateBasicDetails, savedStudentId]
  );
  const handleFamilyFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateFamilyDetails({
          id: editData?.studentId || values?.id,
          body: {
            fatherDetails: {
              fullName: values.fatherName,
              dateOfBirth: values.fatherDob
                ? dateConvertor(values.fatherDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.fatherOccupation,
              email: values.fatherEmail,
              contactNo: values.fatherContactNo,
              officeNo: values.fatherOfficeNo,
              qualification: values.fatherQualification,
              yearOfPassing: values.fatherPassOutYear,
              designation: values.fatherDesignation,
              organization: values.fatherOrganization,
              aadharNo: String(values.fatherAadharNo),
              officeAddress: {
                address1: values.fatherOfficeAddress1,
                address2: values.fatherOfficeAddress2,
                address3: values.fatherOfficeAddress3,
                country: {
                  name: values?.fatherOfficeCountry?.name,
                  isoCode: values?.fatherOfficeCountry?.isoCode,
                },
                state: {
                  name: values?.fatherOfficeState?.name,
                  isoCode: values?.fatherOfficeState?.isoCode,
                },
                city: values?.fatherOfficeCity?.name,
                pincode: values.fatherOfficePincode,
              },
              localAddress: {
                address1: values.fatherAddress1,
                address2: values.fatherAddress2,
                address3: values.fatherAddress3,
                country: {
                  name: values?.fatherLocalCountry?.name,
                  isoCode: values?.fatherLocalCountry?.isoCode,
                },
                state: {
                  name: values?.fatherLocalState?.name,
                  isoCode: values?.fatherLocalState?.isoCode,
                },
                city: values?.fatherLocalCity?.name,
                pincode: values.fatherLocalPincode,
              },
              remarks: values.fatherRemarks,
            },
            motherDetails: {
              fullName: values.motherName,
              dateOfBirth: values.motherDob
                ? dateConvertor(values.motherDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.motherOccupation,
              qualification: values.motherQualification,
              contactNo: values.motherContactNo,
              email: values.motherEmail,
              yearOfPassing: values.motherPassOutYear,
              officeNo: values.motherOfficeNo,
              designation: values.motherDesignation,
              organization: values.motherOrganization,
              aadharNo: String(values.motherAadharNo),
              remarks: values.motherRemarks,
              officeAddress: {
                address1: values.motherOfficeAddress1,
                address2: values.motherOfficeAddress2,
                address3: values.motherOfficeAddress3,
                country: {
                  name: values?.motherOfficeCountry?.name,
                  isoCode: values?.motherOfficeCountry?.isoCode,
                },
                state: {
                  name: values?.motherOfficeState?.name,
                  isoCode: values?.motherOfficeState?.isoCode,
                },
                city: values?.motherOfficeCity?.name,
                pincode: values.motherOfficePincode,
              },
              localAddress: {
                address1: values.motherAddress1,
                address2: values.motherAddress2,
                address3: values.motherAddress3,
                country: {
                  name: values?.motherLocalCountry?.name,
                  isoCode: values?.motherLocalCountry?.isoCode,
                },
                state: {
                  name: values?.motherLocalState?.name,
                  isoCode: values?.motherLocalState?.isoCode,
                },
                city: values?.motherLocalCity?.name,
                pincode: values.motherLocalPincode,
              },
            },
            siblingStudentIds: (values.siblingStudents ?? []).map((s: any) => s.id),
            guardianDetails: {
              fullName: values.guardianName,
              dateOfBirth: values.guardianDob
                ? dateConvertor(values.guardianDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.guardianOccupation,
              qualification: values.guardianQualification,
              contactNo: values.guardianContactNo,
              email: values.guardianEmail,
              yearOfPassing: values.guardianPassOutYear,
              officeNo: values.guardianOfficeNo,
              designation: values.guardianDesignation,
              organization: values.guardianOrganization,
              aadharNo: String(values.guardianAadharNo),
              remarks: values.guardianRemarks,
              officeAddress: {
                address1: values.guardianOfficeAddress1,
                address2: values.guardianOfficeAddress2,
                address3: values.guardianOfficeAddress3,
                country: {
                  name: values?.guardianOfficeCountry?.name,
                  isoCode: values?.guardianOfficeCountry?.isoCode,
                },
                state: {
                  name: values?.guardianOfficeState?.name,
                  isoCode: values?.guardianOfficeState?.isoCode,
                },
                city: values?.guardianOfficeCity?.name,
                pincode: values.guardianOfficePincode,
              },
              localAddress: {
                address1: values.guardianAddress1,
                address2: values.guardianAddress2,
                address3: values.guardianAddress3,
                country: {
                  name: values?.guardianLocalCountry?.name,
                  isoCode: values?.guardianLocalCountry?.isoCode,
                },
                state: {
                  name: values?.guardianLocalState?.name,
                  isoCode: values?.guardianLocalState?.isoCode,
                },
                city: values?.guardianLocalCity?.name,
                pincode: values.guardianLocalPincode,
              },
            },
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updateFamilyDetails]
  );
  const handleCommunicationFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateCommunicationDetails({
          id: editData?.studentId || values?.id,
          body: {
            localAddress: {
              address1: values.localAddressLine1,
              address2: values.localAddressLine2,
              address3: values.localAddressLine3,
              country: { name: values?.localCountry?.name, isoCode: values?.localCountry?.isoCode },
              state: { name: values?.localState?.name, isoCode: values?.localState?.isoCode },
              city: values?.localCity?.name,
              pincode: values.localPincode,
            },
            permanentAddress: {
              address1: values.permanentAddress,
              address2: values.permanentAddressLine2,
              address3: values.permanentAddressLine3,
              country: {
                name: values?.permanentCountry?.name,
                isoCode: values?.permanentCountry?.isoCode,
              },
              state: {
                name: values?.permanentState?.name,
                isoCode: values?.permanentState?.isoCode,
              },
              city: values?.permanentCity?.name,
              pincode: values.permanentPincode,
            },
            emergencyAddress: {
              address1: values.emergencyAddressLine1,
              address2: values.emergencyAddressLine2,
              address3: values.emergencyAddressLine3,
              country: {
                name: values?.emergencyCountry?.name,
                isoCode: values?.emergencyCountry?.isoCode,
              },
              state: {
                name: values?.emergencyState?.name,
                isoCode: values?.emergencyState?.isoCode,
              },
              city: values?.emergencyCity?.name,
              pincode: values.emergencyPincode,
            },
            isPermanentSameAsLocal: values.sameAsLocalForPermanent,
            isEmergencySameAsLocal: values.emergencySameAsLocal,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updateCommunicationDetails]
  );
  const handleMedicalFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateMedicalDetails({
          id: editData?.studentId || values?.id,
          body: {
            weightKg: +values.weight,
            heightCm: +values.height,
            bodyMassIndex: +values.bmi,
            pulseRate: +values.pulseRate,
            hemoglobin: +values.haemoglobin,
            bloodGroup: values.bloodGroup,
            haveDisability: values.personWithDisability,
            disabilityDetails: values.disabilityDetails,
            allergies: values.allergies,
            covidVaccinationDoses: values.covidVaccination,
            childImmunization: values.childImmunisation,
            immunizationRemarks: values.immunisationRemarks,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updateMedicalDetails]
  );
  const handlePreviousSchoolFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updatePreviousSchoolDetails({
          id: editData?.studentId || values?.id,
          body: {
            schoolName: values.schoolName,
            schoolAddress: values.schoolAddress,
            board: values.schoolBoard,
            medium: values.schoolMedium,
            tcNumber: values.tcNumber,
            lastClassAttended: String(values.previousClass),
            percentageObtained: +values.percentage,
            reasonForLeaving: values.reasonForLeaving || undefined,
            previousSchool: values.previousSchool || undefined,
            lastClassPassed: values.lastClassPassed || undefined,
            schoolIndexNumber: values.schoolIndexNumber || undefined,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updatePreviousSchoolDetails]
  );

  const handleBankDetailsFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateBankDetails({
          id: editData?.studentId || values?.id,
          body: {
            bankName: values.bankName,
            branchName: values.branchName,
            accountHolderName: values.accountHolderName,
            accountNo: values.accountNo,
            ifscCode: values.ifscCode,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updateBankDetails]
  );
  const handleAdditionalDetailsFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateAdditionDetails({
          id: editData?.studentId || values?.id,
          body: {
            // category: values.category,
            // rightToEducation: values.category === Category.Rte,
            // bplStudent: values.bplStudent,
            // bplCardNo: values.bplCardNo,
            // personWithDisability: values.personWithDisability,
            // secondLanguage: values.secondLanguage,
            // emergencyContactNo: values.emergencyContactNo,
            // singleParentChild: values.singleParentChild,
            // singleChild: values.singleChild,
            // sponsorName: values.sponsorStudent.id,

            category: values.category,
            isBPLStudent: values.bplStudent,
            bplCardNo: values.bplCardNo,
            secondLanguage: values.secondLanguage,
            emergencyRelativeName: values.relationName,
            emergencyRelation: values.relation,
            emergencyContactNo: values.emergencyContactNo,
            isSingleChild: values.singleChild,
            isSingleParentChild: values.singleParentChild,
            isLibraryMember: values.libraryMember,
            isTransportMember: values.transportMember,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updateAdditionDetails]
  );

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: any,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      setIsLoading(true);
      try {
        if (activeStep === 0) {
          const isNew = !editData && !values?.id;
          await handleGeneralFormSubmit(values, formik);
          if (!isComeFromIssueForm) {
            shikshaMitraToast.success({
              message: isNew
                ? `${values.firstName} ${values.lastName}'s details added successfully`
                : `${values.firstName} ${values.lastName}'s details updated successfully`,
            });
          }
        } else if (activeStep === 1) {
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s documents saved successfully`,
          });
        } else if (activeStep === 2) {
          await handleFamilyFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s family details updated successfully`,
          });
        } else if (activeStep === 3) {
          await handleCommunicationFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s communication details updated successfully`,
          });
        } else if (activeStep === 4) {
          await handleAdditionalDetailsFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s additional details updated successfully`,
          });
        } else if (activeStep === 5) {
          await handleMedicalFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s medical details updated successfully`,
          });
        } else if (activeStep === 6) {
          await handlePreviousSchoolFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s previous school details updated successfully`,
          });
        } else if (activeStep === 7) {
          await handleBankDetailsFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s  Moved to Registration Successfully`,
          });
        }
        formik.resetForm({ values: formik.values });
        resetCurrentStepRef.current?.();
        if (!isLastStep) {
          if (!isSaveButton) {
            setActiveStep(activeStep + 1);
          }
        } else {
          handleClose(null, true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeStep,
      handleAdditionalDetailsFormSubmit,
      handleBankDetailsFormSubmit,
      handleClose,
      handleCommunicationFormSubmit,
      handleFamilyFormSubmit,
      handleGeneralFormSubmit,
      handleMedicalFormSubmit,
      handlePreviousSchoolFormSubmit,
      isComeFromIssueForm,
      editData,
      resetCurrentStepRef,
    ]
  );

  return (
    <>
      <CustomStepperWithFormik
        showSaveButton={isChanges}
        disableSubmit={!isChanges && activeStep !== BASE_STEPS.length - 1}
        onStepClick={(index) => {
          if (editData) {
            if (isChanges) {
              setPendingStep(index);
            } else {
              setActiveStep(index);
            }
          }
        }}
        viewMode="vertical"
        validateOnChange
        initialValues={{
          ...generalFieldsInitialValues(),
          ...documentFieldsInitialValues(),
          ...familyFieldsInitialValues(),
          ...CommunicationFieldsInitialValues(),
          ...additionalDetailsInitialValues(),
          ...medicalFieldsInitialValues(),
          ...previousSchoolFieldsInitialValues(),
          ...bankDetailsInitialValues(),
        }}
        steps={stepsWithCounts}
        activeStep={activeStep}
        handleBack={() => {
          setActiveStep(activeStep - 1);
        }}
        validationSchema={validationSchemas[activeStep]}
        handleNext={(
          isLastStep: boolean,
          value: any,
          formik: any,
          setIsLoading: (val: boolean) => void
        ) => handleSave(isLastStep, value, formik, setIsLoading)}
        onSave={(
          isLastStep: boolean,
          value: any,
          formik: any,
          setIsLoading: (val: boolean) => void
        ) => handleSave(isLastStep, value, formik, setIsLoading, true)}
        renderItem={({ activeStep: step, formik, isBackClick }: any) => {
          formikRef.current = formik;
          return (
            <>
              <SyncReduxDirty formik={formik} />
              <StepCountSyncer formikValues={formik.values} onCountChange={handleCountChange} />
              <RegisterStepForm
                activeStep={step}
                formik={formik}
                isBackClick={isBackClick}
                editData={editData}
                resetCurrentStepRef={resetCurrentStepRef}
              />
            </>
          );
        }}
      />

      <ConfirmDialog
        open={pendingStep !== null}
        onClose={() => setPendingStep(null)}
        icon="warning"
        title="Alert"
        content={
          <Typography variant="body2">
            You have unsaved changes on this step. If you navigate away, your changes will be lost.
            Are you sure you want to continue?
          </Typography>
        }
        action={
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.tick} />}
            sx={{
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': { bgcolor: 'grey.800' },
            }}
            size="small"
            onClick={() => {
              if (pendingStep !== null) {
                resetCurrentStepRef.current?.();
                formikRef.current?.resetForm();
                dispatch(setIsChanges(false));
                setActiveStep(pendingStep);
                setPendingStep(null);
              }
            }}
          >
            Yes
          </Button>
        }
      />
    </>
  );
};

export default RegisterForm;

const RegisterStepForm = ({
  activeStep: step,
  formik,
  isBackClick,
  editData,
  resetCurrentStepRef,
}: any) => {
  // const [editData, setEditData] = useState<null | IInquiryResponse>(null);

  // // Custom boolean hook to manage form dialog visibility
  // const formDialog = useBoolean();

  const initializedStepsRef = useRef<Record<number, boolean>>({});
  const prevStepRef = useRef<number>(step);
  const formikRef = React.useRef(formik);
  formikRef.current = formik;

  useEffect(() => {
    if (resetCurrentStepRef) {
      resetCurrentStepRef.current = () => {
        initializedStepsRef.current[step] = false;
      };
    }
  }, [step, resetCurrentStepRef]);

  useEffect(() => {
    if (prevStepRef.current !== step) {
      initializedStepsRef.current[prevStepRef.current] = false;
      prevStepRef.current = step;
    }
  }, [step]);

  const { data: basicDetails, isLoading: basicDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBasicDetailsQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !(editData?.studentId && step === 0),
      refetchOnMountOrArgChange: true,
      refetchOnFocus: false,
    },
  });

  const { data: familyDetails, isLoading: familyDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFamilyDetailsQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !(editData?.studentId && step === 2),
      refetchOnMountOrArgChange: true,
      refetchOnFocus: false,
    },
  });
  const { data: studentCommunicationDetails, isLoading: studentCommunicationDetailsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetStudentCommunicationDetailsQuery,
      params: {
        studentId: editData?.studentId,
      },
      options: {
        skip: !(editData?.studentId && step === 3),
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
      },
    });

  const { data: studentAdditionalDetails, isLoading: studentAdditionalDetailsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetStudentAdditionalDetailsQuery,
      params: {
        studentId: editData?.studentId,
      },
      options: {
        skip: !(editData?.studentId && step === 4),
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
      },
    });

  const { data: studentMedicalDetails, isLoading: studentMedicalDetailsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetStudentMedicalDetailsQuery,
      params: {
        studentId: editData?.studentId,
      },
      options: {
        skip: !(editData?.studentId && step === 5),
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
      },
    });
  const { data: previousSchoolDetails, isLoading: previousSchoolDetailsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetPreviousSchoolDetailsQuery,
      params: {
        studentId: editData?.studentId,
      },
      options: {
        skip: !(editData?.studentId && step === 6),
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
      },
    });

  const { data: parentBankDetails, isLoading: parentBankDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetParentBankDetailsQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !(editData?.studentId && step === 7),
      refetchOnMountOrArgChange: true,
      refetchOnFocus: false,
    },
  });

  useEffect(() => {
    if (initializedStepsRef.current[step]) return;
    if (basicDetails?.data && step === 0) {
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...generalFieldsInitialValues(basicDetails?.data),
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (familyDetails?.data && step === 2) {
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...familyFieldsInitialValues(familyDetails?.data),
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (studentCommunicationDetails?.data && step === 3) {
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...CommunicationFieldsInitialValues(studentCommunicationDetails?.data),
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (studentAdditionalDetails?.data && step === 4) {
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...additionalDetailsInitialValues(studentAdditionalDetails?.data),
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (studentMedicalDetails?.data && step === 5) {
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...medicalFieldsInitialValues(studentMedicalDetails?.data),
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (previousSchoolDetails?.data && step === 6) {
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...previousSchoolFieldsInitialValues(previousSchoolDetails?.data),
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (parentBankDetails?.data && step === 7) {
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...bankDetailsInitialValues(parentBankDetails?.data),
        },
      });
      initializedStepsRef.current[step] = true;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    basicDetails?.data,
    familyDetails?.data,
    parentBankDetails?.data,
    previousSchoolDetails?.data,
    step,
    studentAdditionalDetails?.data,
    studentCommunicationDetails?.data,
    studentMedicalDetails?.data,
  ]);

  const stepLoadings = [
    basicDetailsLoading,
    false,
    familyDetailsLoading,
    studentCommunicationDetailsLoading,
    studentAdditionalDetailsLoading,
    studentMedicalDetailsLoading,
    previousSchoolDetailsLoading,
    parentBankDetailsLoading,
  ];
  const isLoading = stepLoadings[step] || false;

  return (
    <FormSlider step={step} steps={BASE_STEPS} isBackClick={isBackClick}>
      {isLoading ? (
        <Box sx={{ height: '100%' }}>
          <StepSkeleton step={step} />
        </Box>
      ) : (
        <Grid container spacing={2.5} sx={{ height: '100%' }}>
          {allFields[step].map((field: FieldsType) => (
            <Grid size={4} key={field.name} {...(field.gridProps || {})}>
              {field.renderComp ? (
                field.renderComp({
                  formik,
                  field,
                  isEdit: true,
                  isMainForm: true,
                  editData,
                  isLoading,
                })
              ) : field.type === 'date' ? (
                <DatePicker
                  label={field.label}
                  name={field.name}
                  value={formik.values[field.name]}
                  format="DD-MM-YYYY"
                  onChange={(newValue) => formik.setFieldValue(field.name, newValue)}
                  slotProps={{
                    textField: {
                      placeholder: field.placeholder,
                      fullWidth: true,
                      size: 'small',
                      helperText: formik.touched[field.name] && formik.errors[field.name],
                      error: formik.touched[field.name] && Boolean(formik.errors[field.name]),
                    },
                  }}
                />
              ) : (
                <ShakingTextField
                  error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                >
                  <TextField
                    key={field.name}
                    type={field.type}
                    size="small"
                    label={field.label}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formik.values[field.name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                    helperText={formik.touched[field.name] && formik.errors[field.name]}
                    fullWidth
                    // sx={{ maxWidth: '200px', width: '100%', ...(field?.sx || {}) }}
                    {...((typeof field?.otherProps === 'function'
                      ? field?.otherProps({ formik })
                      : field?.otherProps) || {})}
                  />
                </ShakingTextField>
              )}
            </Grid>
          ))}
        </Grid>
      )}
    </FormSlider>
  );
};

export const FormSlider = ({
  step,
  steps: allStep,
  children,
  isBackClick,
  containerProps = {},
}: {
  step: number;
  steps: any[];
  children?: any;
  isBackClick: boolean;
  containerProps?: BoxProps;
}) => {
  const { sx = {}, ...props } = containerProps;
  const containerRef = React.useRef<HTMLElement>(null);
  return (
    <Box ref={containerRef} sx={{ p: 2, height: '100%', ...sx }} {...props}>
      {allStep.map(
        (_, index) =>
          index === step && (
            <Slide
              in={index === step}
              container={containerRef.current}
              direction={isBackClick ? 'right' : 'left'}
              key={index}
            >
              {children}
            </Slide>
          )
      )}
    </Box>
  );
};
