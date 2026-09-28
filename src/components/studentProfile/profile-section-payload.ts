// The Information tab edits registration-shaped sections after enrollment.
// Start from the fetched section so fields that are not shown remain intact.
type SectionData = Record<string, any>;

const dateValue = (value: any) => value?.toISOString?.() ?? value ?? null;
const numberValue = (value: any) =>
  value === '' || value === null || value === undefined ? null : Number(value);
const address = (values: SectionData, prefix: string, original?: SectionData) => ({
  ...original,
  address1: values[`${prefix}AddressLine1`] ?? values[`${prefix}Address1`] ?? '',
  address2: values[`${prefix}AddressLine2`] ?? values[`${prefix}Address2`] ?? '',
  address3: values[`${prefix}AddressLine3`] ?? values[`${prefix}Address3`] ?? '',
  city: values[`${prefix}City`]?.name ?? '',
  state: values[`${prefix}State`],
  country: values[`${prefix}Country`],
  pincode: values[`${prefix}Pincode`] ?? '',
});

const parent = (values: SectionData, original: SectionData | undefined, prefix: string) => ({
  ...original,
  fullName: values[`${prefix}Name`],
  dateOfBirth: dateValue(values[`${prefix}Dob`]),
  occupation: values[`${prefix}Occupation`],
  qualification: values[`${prefix}Qualification`],
  contactNo: values[`${prefix}ContactNo`],
  email: values[`${prefix}Email`],
  yearOfPassing: values[`${prefix}PassOutYear`],
  officeNo: values[`${prefix}OfficeNo`],
  designation: values[`${prefix}Designation`],
  organization: values[`${prefix}Organization`],
  aadharNo: values[`${prefix}AadharNo`],
  localAddress: {
    ...address(values, `${prefix}Local`, original?.localAddress),
    address1: values[`${prefix}Address1`],
    address2: values[`${prefix}Address2`],
    address3: values[`${prefix}Address3`],
  },
  officeAddress: address(values, `${prefix}Office`, original?.officeAddress),
});

export const profileSectionPayload = (
  tabIndex: number,
  values: SectionData,
  source: SectionData = {}
): SectionData => {
  switch (tabIndex) {
    case 0:
      return {
        ...source,
        formNumber: values.formNo,
        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,
        dateOfBirth: dateValue(values.dob),
        gender: values.gender,
        primaryContactNo: values.primaryContactNumber,
        secondaryContactNo: values.secondaryContactNumber,
        email: values.email,
        panNo: values.panNo,
        religion: values.religion,
        familyCast: values.familyCast,
        castCategory: values.castCategory ?? source.castCategory ?? 0,
        nationality: values.nationality,
        birthPlace: values.birthPlace,
        motherTongue: values.motherTongue,
        inquiryPreferenceId: values.inquiryPreference,
        address1: values.addressLine1,
        address2: values.addressLine2,
        address3: values.addressLine3,
        city: values.city?.name ?? '',
        state: values.state,
        country: values.country,
        pincode: values.pinCode,
        previousSchool: source.previousSchool,
        lastClassPassed: source.lastClassPassed,
        // Placement and identity compliance have their own governed actions.
        academicMediumId: undefined,
        standardId: undefined,
        divisionId: undefined,
      };
    case 1:
      return {
        ...source,
        fatherDetails: parent(values, source.fatherDetails, 'father'),
        motherDetails: parent(values, source.motherDetails, 'mother'),
        guardianDetails: parent(values, source.guardianDetails, 'guardian'),
        siblingStudentIds: (values.siblingStudents ?? []).map((s: any) => s.id),
      };
    case 2:
      return {
        ...source,
        localAddress: address(values, 'local', source.localAddress),
        emergencyAddress: address(values, 'emergency', source.emergencyAddress),
        permanentAddress: {
          ...address(values, 'permanent', source.permanentAddress),
          address1: values.permanentAddress,
        },
        isPermanentSameAsLocal: values.sameAsLocalForPermanent,
        isEmergencySameAsLocal: values.emergencySameAsLocal,
      };
    case 3:
      return {
        ...source,
        category: values.category,
        isBPLStudent: values.bplStudent,
        bplCardNo: values.bplCardNo,
        secondLanguage: values.secondLanguage,
        haveDisability: source.haveDisability,
        disabilityDetails: source.disabilityDetails,
        emergencyContactNo: values.emergencyContactNo,
        emergencyRelativeName: values.relationName,
        emergencyRelation: values.relation,
        isSingleParentChild: values.singleParentChild,
        isSingleChild: values.singleChild,
        isLibraryMember: values.libraryMember,
        isTransportMember: values.transportMember,
      };
    case 4:
      return {
        ...source,
        weightKg: numberValue(values.weight),
        heightCm: numberValue(values.height),
        bodyMassIndex: numberValue(values.bmi),
        pulseRate: numberValue(values.pulseRate),
        hemoglobin: numberValue(values.haemoglobin),
        allergies: values.allergies,
        covidVaccinationDoses: numberValue(values.covidVaccination),
        haveDisability: values.personWithDisability,
        disabilityDetails: values.disabilityDetails,
        bloodGroup: values.bloodGroup,
        childImmunization: values.childImmunisation,
        immunizationRemarks: values.immunisationRemarks,
      };
    case 5:
      return {
        ...source,
        schoolName: values.schoolName,
        previousSchool: values.previousSchool,
        schoolAddress: values.schoolAddress,
        board: values.schoolBoard,
        medium: values.schoolMedium,
        lastClassAttended: values.previousClass,
        lastClassPassed: values.lastClassPassed,
        schoolIndexNumber: values.schoolIndexNumber,
        tcNumber: values.tcNumber,
        percentageObtained: numberValue(values.percentage),
        reasonForLeaving: values.reasonForLeaving,
      };
    case 6:
      return {
        ...source,
        bankName: values.bankName,
        accountNo: values.accountNo,
        ifscCode: values.ifscCode,
        branchName: values.branchName,
        accountHolderName: values.accountHolderName,
      };
    default:
      return source;
  }
};
