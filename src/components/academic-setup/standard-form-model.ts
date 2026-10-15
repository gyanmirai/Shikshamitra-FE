import * as Yup from 'yup';

export type ExistingStandard = { id: string; name: string };
export type StandardEditData = ExistingStandard & {
  ageLowerLimit?: number;
  shiftId?: string | null;
};
export type StandardFormProps = {
  handleClose: () => void;
  organizationId: string | number;
  editData: StandardEditData | null;
  existingStandards?: ExistingStandard[];
};

export const duplicateStandardMessage = (name: string) =>
  `A standard named '${name.trim()}' already exists in this academic stage.`;

export const standardNameSchema = (standards: ExistingStandard[] = [], currentId?: string) =>
  Yup.string()
    .trim()
    .max(64)
    .required('Class is required')
    .test(
      'unique-standard-name',
      'A standard with this name already exists in this academic stage.',
      function validateUniqueName(value) {
        const duplicate = standards.find(
          (standard) =>
            standard.id !== currentId &&
            standard.name.trim().toLowerCase() === value?.trim().toLowerCase()
        );
        return !duplicate || this.createError({ message: duplicateStandardMessage(value || '') });
      }
    );
