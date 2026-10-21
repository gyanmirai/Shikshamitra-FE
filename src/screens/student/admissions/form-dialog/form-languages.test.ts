import { it, expect, describe } from 'vitest';

import { localizeAdmissionField, localizeAdmissionSection } from './form-languages';

describe('admission form localization', () => {
  const field = {
    label: 'Relationship',
    placeholder: 'Select relationship',
    helpText: 'Choose one option',
    optionsJson: JSON.stringify([
      { value: 'FATHER', label: 'Father' },
      { value: 'MOTHER', label: 'Mother' },
    ]),
    translations: {
      gu: {
        label: 'સંબંધ',
        placeholder: 'સંબંધ પસંદ કરો',
        helpText: 'એક વિકલ્પ પસંદ કરો',
        choices: { FATHER: 'પિતા', MOTHER: 'માતા' },
      },
    },
  };

  it('localizes field copy and static choice labels', () => {
    const localized = localizeAdmissionField(field, 'gu');

    expect(localized.label).toBe('સંબંધ');
    expect(localized.placeholder).toBe('સંબંધ પસંદ કરો');
    expect(localized.helpText).toBe('એક વિકલ્પ પસંદ કરો');
    expect(JSON.parse(localized.optionsJson ?? '[]')).toEqual([
      { value: 'FATHER', label: 'પિતા' },
      { value: 'MOTHER', label: 'માતા' },
    ]);
  });

  it('localizes a section and falls back to the original language when missing', () => {
    const section = {
      name: 'Guardian details',
      entryLabel: 'Guardian',
      translations: { gu: { label: 'વાલીની વિગતો', helpText: 'વાલી' } },
      fields: [field],
    };

    const localized = localizeAdmissionSection(section, 'gu');
    expect(localized.name).toBe('વાલીની વિગતો');
    expect(localized.entryLabel).toBe('વાલી');
    expect(localized.fields[0].label).toBe('સંબંધ');
    expect(localizeAdmissionSection(section, 'hi')).toEqual(section);
  });

  it.each([undefined, {}])(
    'localizes fields without requiring section translations (%s)',
    (translations) => {
      const section = {
        name: 'Guardian details',
        entryLabel: 'Guardian',
        translations,
        fields: [field],
      };
      const before = structuredClone(section);
      const localized = localizeAdmissionSection(section, 'gu');

      expect(localized.name).toBe('Guardian details');
      expect(localized.entryLabel).toBe('Guardian');
      expect(localized.fields[0].label).toBe('સંબંધ');
      expect(localized.fields[0].placeholder).toBe('સંબંધ પસંદ કરો');
      expect(localized.fields[0].helpText).toBe('એક વિકલ્પ પસંદ કરો');
      expect(JSON.parse(localized.fields[0].optionsJson!)[0]).toEqual({
        value: 'FATHER',
        label: 'પિતા',
      });
      expect(section).toEqual(before);
    }
  );
});
