import * as Yup from 'yup';

export const payrollProfilePatchSchema = Yup.object({
  bankDetails: Yup.object({
    bankName: Yup.string().trim().required('Bank name is required').max(100),
    branchName: Yup.string().max(100),
    accountHolderName: Yup.string().trim().required('Account holder name is required').max(150),
    accountNumber: Yup.string()
      .required('Account number is required')
      .matches(/^\d{8,20}$/, 'Enter 8 to 20 digits'),
    ifscCode: Yup.string()
      .required('IFSC code is required')
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code'),
  }).default(undefined),
  statutoryIdentifiers: Yup.object({
    epfNumber: Yup.string().matches(/^[A-Z]{2}\/\d{5}\/\d{7}$/, {
      message: 'Use XX/XXXXX/XXXXXXX',
      excludeEmptyString: true,
    }),
    uanNumber: Yup.string().matches(/^\d{12}$/, {
      message: 'Enter 12 digits',
      excludeEmptyString: true,
    }),
  }).default(undefined),
  attendanceIntegration: Yup.object({
    punchId: Yup.string()
      .max(20)
      .matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Use letters, digits, hyphens or underscores',
        excludeEmptyString: true,
      }),
    totalWorkingHourPerMonth: Yup.number().nullable().min(0).max(744),
  }).default(undefined),
});
