import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

// A later original/waiver record must not hide the last uploaded copy.
export function getDocumentTableFile(requirement: AdmissionDocumentRequirement) {
  return [...requirement.evidence].reverse().find((item) => item.fileName);
}

export function getDocumentTableFormat(
  requirement: AdmissionDocumentRequirement,
  policy: ApplicationDocumentVerification['policy']
) {
  const file = getDocumentTableFile(requirement);
  const extension = file?.fileName?.match(/\.([^./\\]+)$/)?.[1];
  const accepted =
    requirement.allowedExtensions ??
    policy?.requirements.find((item) => item.code === requirement.code)?.allowedExtensions;
  return {
    actual: extension?.toUpperCase(),
    accepted: accepted?.map((item) => item.replace(/^\./, '').toUpperCase()).join(', '),
    fallback: requirement.collectionMode === 'original' ? 'Physical original' : 'Not specified',
  };
}
