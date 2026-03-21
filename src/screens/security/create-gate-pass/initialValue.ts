import type { ICreateEmergencyGatePassFormValue } from './create-gate-pass-interface';

export function getEmergencyGatePassInitialValues(
  data: Partial<ICreateEmergencyGatePassFormValue> | null = null
): ICreateEmergencyGatePassFormValue {
  return {
    personName: data?.personName || '',
    time: data?.time || null,
    reason: data?.reason || '',
    emergencyFlag: data?.emergencyFlag || '',
  };
}
