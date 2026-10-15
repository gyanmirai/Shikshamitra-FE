import { it, expect, describe } from 'vitest';

import { standardNameSchema } from './standard-form-model';

const standards = [
  { id: 'class-3', name: 'Class 3' },
  { id: 'class-4', name: 'Class 4' },
];

describe('standard name validation within the active stage', () => {
  it.each(['Class 3', 'class 3', ' Class 3 '])('rejects an existing name: %s', async (name) => {
    await expect(standardNameSchema(standards).validate(name)).rejects.toThrow(
      `A standard named '${name.trim()}' already exists in this academic stage.`
    );
  });
  it('allows the same record to retain its own name, including case changes', async () => {
    await expect(standardNameSchema(standards, 'class-3').validate('CLASS 3')).resolves.toBe(
      'CLASS 3'
    );
  });
  it('rejects renaming a different standard to an existing name', async () => {
    await expect(standardNameSchema(standards, 'class-4').validate('Class 3')).rejects.toThrow(
      'already exists'
    );
  });
  it('uses only the supplied stage and trims valid input', async () => {
    await expect(standardNameSchema([]).validate(' Class 3 ')).resolves.toBe('Class 3');
  });
  it('requires a nonblank name', async () => {
    await expect(standardNameSchema(standards).validate('  ')).rejects.toThrow('Class is required');
  });
});
