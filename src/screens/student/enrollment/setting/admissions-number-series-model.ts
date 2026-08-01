export type IdentifierSeriesDraftValues = {
  code: string;
  name: string;
  padding: string;
  startingSequence: string;
  maximumSequence: string;
  effectiveFrom: string;
  effectiveUntil: string;
};

const isIsoDateInput = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export const validateIdentifierSeriesStep = (
  values: IdentifierSeriesDraftValues,
  step: number
): string | null => {
  if (step === 0 && (!values.code.trim() || !values.name.trim())) {
    return 'Enter a series code and name before continuing.';
  }

  if (step === 1) {
    const padding = Number(values.padding);
    const startingSequence = Number(values.startingSequence);
    const maximumSequence = values.maximumSequence ? Number(values.maximumSequence) : null;

    if (
      !Number.isInteger(padding) ||
      padding < 1 ||
      padding > 12 ||
      !Number.isInteger(startingSequence) ||
      startingSequence < 1 ||
      (maximumSequence !== null &&
        (!Number.isInteger(maximumSequence) || maximumSequence < startingSequence))
    ) {
      return 'Use padding from 1 to 12 and keep the maximum at or above the starting number.';
    }
  }

  if (
    step === 2 &&
    (!isIsoDateInput(values.effectiveFrom) ||
      (values.effectiveUntil &&
        (!isIsoDateInput(values.effectiveUntil) || values.effectiveUntil < values.effectiveFrom)))
  ) {
    return 'Choose a valid effective date range with the end date on or after the start date.';
  }

  return null;
};
