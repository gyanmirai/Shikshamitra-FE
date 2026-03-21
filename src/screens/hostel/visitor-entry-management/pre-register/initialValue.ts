import type { IPreVisitorLog } from './pre-register-interface';

export function getVisitorInitialValues(
  data: Partial<IPreVisitorLog> | null = null
): IPreVisitorLog {
  return {
    id: data?.id || '',
    visitorName: data?.visitorName || '',
    idProof: data?.idProof || '',
    proofNumber: data?.proofNumber || '',
    contactNo: data?.contactNo || '',
    visitStartDateTime: data?.visitStartDateTime || null,
    visitEndDateTime: data?.visitEndDateTime || null,
    reasonForVisit: data?.reasonForVisit || '',
    status: data?.status || '',
    relationship: data?.relationship || '',
  };
}
