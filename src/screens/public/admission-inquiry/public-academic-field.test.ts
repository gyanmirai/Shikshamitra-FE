import { it, expect } from 'vitest';

import { publicAcademicSource } from './public-academic-field';

const field = {code: 'HISTORICAL', label: 'Original question', fieldType: 6, required: false, readOnly: false};

it.each(['EducationMediums', 'StandardsByMedium'])('retains the legacy resolved renderer for standalone %s without an explicit parent', source => {
  expect(publicAcademicSource({...field, optionsSourceJson: JSON.stringify({source})})).toBeNull();
  expect(publicAcademicSource({...field, optionsSourceJson: JSON.stringify({source, parentField: ''})})).toBeNull();
});

it('uses the public selector only for Board or explicitly linked child questions', () => {
  expect(publicAcademicSource({...field, optionsSourceJson: '{"source":"EducationBoards"}'})).toEqual({source: 'EducationBoards', parentField: undefined});
  expect(publicAcademicSource({...field, optionsSourceJson: '{"source":"StandardsByMedium","parentField":"MEDIUM_2"}'})).toEqual({source: 'StandardsByMedium', parentField: 'MEDIUM_2'});
  expect(publicAcademicSource({...field, optionsSourceJson: '{"source":"Standards"}'})).toBeNull();
});
