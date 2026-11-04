import { it, expect, describe } from 'vitest';

import { addAcademicClassSelector } from './academic-class-selector';
import { getBlankAdmissionFormInitialValues } from './form-dialog-model';

const blank = () => getBlankAdmissionFormInitialValues(0);
const fields = (form: ReturnType<typeof blank>) => form.sections.flatMap(section => section.fields);
const source = (field: {optionsJson?: string | null}) => JSON.parse(field.optionsJson || '{}');

describe('Class selector group', () => {
  it('reuses a reserved CLASS_INTERESTED field with linked dependencies after label edits', () => {
    const {form} = addAcademicClassSelector(blank(), null);
    const standard = fields(form).find(field => source(field).source === 'StandardsByMedium')!;
    standard.code = 'CLASS_INTERESTED';
    standard.label = 'Choose a class';
    const result = addAcademicClassSelector(form, null);
    expect(fields(result.form)).toHaveLength(fields(form).length);
    expect(result.fieldId).toBe(standard.id);
  });
  it('adds Board, Medium and Class to the chosen section with stable linked codes and no visible academic year', () => {
    const form = blank();
    const result = addAcademicClassSelector(form, form.sections[0].id);
    const added = fields(result.form).filter(field => ['EducationBoards', 'EducationMediums', 'StandardsByMedium'].includes(source(field).source));
    expect(added.map(field => field.label)).toEqual(['Board', 'Medium', 'Class']);
    expect(source(added[1]).parentField).toBe(added[0].code);
    expect(source(added[2]).parentField).toBe(added[1].code);
    expect(added.every(field => field.sectionId === form.sections[0].id && field.fieldType === 6)).toBe(true);
    expect(fields(result.form).some(field => /academic.year/i.test(field.label))).toBe(false);
    expect(fields(addAcademicClassSelector(result.form, form.sections[0].id).form)).toHaveLength(fields(result.form).length);
  });
  it('preserves compatible source dependencies and never reuses a class-like text field', () => {
    const form = blank();
    const existing = fields(form)[0];
    form.sections[0].fields.push({...existing, id: 'unrelated', code: 'BOARD', label: 'Preferred class', bindingType: 1, bindingKey: 'BOARD'});
    const result = addAcademicClassSelector(form, form.sections[0].id);
    const added = fields(result.form).filter(field => source(field).source);
    expect(added[0].code).toBe('BOARD_2');
    expect(source(added[1]).parentField).toBe('BOARD_2');
    const reopened = JSON.parse(JSON.stringify(result.form));
    reopened.sections[0].fields.find((field: {id: string}) => field.id === added[0].id).label = 'Education board';
    expect(fields(addAcademicClassSelector(reopened, reopened.sections[0].id).form)).toEqual(fields(reopened));
  });
  it('reuses the complete inherited Inquiry group before local candidates without adding duplicates', () => {
    const inquiry = addAcademicClassSelector(blank(), null).form;
    const inherited = fields(inquiry).filter(field => source(field).source);
    const registration = blank();
    const result = addAcademicClassSelector(registration, null, inherited);
    expect(result.inheritedField?.id).toBe(inherited[2].id);
    expect(fields(result.form)).toEqual(fields(registration));
  });
  it('does not join an unrelated board-dependent source into the group', () => {
    const form = blank();
    const existing = fields(form)[0];
    form.sections[0].fields.push({...existing, id: 'medium-other', code: 'MEDIUM', fieldType: 6, bindingType: 1, optionsJson: JSON.stringify({source: 'EducationMediums', parentField: 'CUSTOM_BOARD'})});
    const added = fields(addAcademicClassSelector(form, null).form);
    const medium = added.find(field => field.code === 'MEDIUM_2')!;
    expect(source(medium).parentField).toBe('BOARD');
  });
});
