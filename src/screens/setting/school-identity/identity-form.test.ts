import { it, expect, describe } from 'vitest';

import { identitySchema, changedSelection, inheritedChoices, templateIdentitySchema } from './identity-form';

describe('School Identity form boundaries', () => {
  it('preserves omitted legacy template choices when only one asset changes', async () => {
    const value = await templateIdentitySchema.validate({ banner: { mode: 2 } });
    expect(value).toEqual({ banner: { mode: 2 } });
    expect(value).not.toHaveProperty('logo');
    expect(value).not.toHaveProperty('signature');
  });
  it('validates custom assets in partial template choices', async () => {
    await expect(templateIdentitySchema.validate({ logo: { mode: 1 } })).rejects.toThrow('Upload an image');
  });
  it('accepts an optional empty school identity and a redacted signature', async () => {
    await expect(identitySchema.validate(inheritedChoices(false))).resolves.toMatchObject({
      logo: { mode: 0 }, banner: { mode: 0 }, signature: null,
    });
  });

  it('requires an uploaded asset for custom selections', async () => {
    await expect(identitySchema.validate({ ...inheritedChoices(false), logo: { mode: 1 } })).rejects.toThrow('Upload an image');
  });

  it('requires the principal name and designation together with a custom signature', async () => {
    const choices = { ...inheritedChoices(true), signature: { mode: 1, assetId: 'signature-id', designation: 'Principal' } };
    await expect(identitySchema.validate(choices)).rejects.toThrow('principal’s name');
    await expect(identitySchema.validate({ ...choices, signature: { ...choices.signature, principalName: 'Principal A' } })).resolves.toBeDefined();
  });

  it('rejects unsupported modes and overlong principal details', async () => {
    await expect(identitySchema.validate({ ...inheritedChoices(false), logo: { mode: 3 } })).rejects.toThrow();
    await expect(identitySchema.validate({ ...inheritedChoices(true), signature: {
      mode: 1, assetId: 'signature-id', principalName: 'A'.repeat(129), designation: 'Principal',
    } })).rejects.toThrow();
  });

  it.each([0, 2] as const)('mode %s clears the custom asset and principal metadata', (mode) => {
    expect(changedSelection(mode, 'signature')).toEqual({ mode });
  });

  it('reset preserves signature redaction rather than attempting an unauthorized mutation', () => {
    expect(inheritedChoices(false).signature).toBeNull();
    expect(inheritedChoices(true).signature).toEqual({ mode: 0 });
  });
});
