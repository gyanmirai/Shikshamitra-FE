import { it, expect } from 'vitest';

import { capitalizeFirstLetter } from './input-format';

it.each([
  ['division approval document', 'Division approval document'],
  ['cbse Approval', 'Cbse Approval'],
  ['CBSE Approval', 'CBSE Approval'],
  ['eLearning Room', 'ELearning Room'],
  ['  north Wing', '  North Wing'],
  ['\nprincipal Dr. Shah', '\nPrincipal Dr. Shah'],
  ['école française', 'École française'],
  ['ગુજરાતી', 'ગુજરાતી'],
  ['101 lab', '101 lab'],
  ['', ''],
  ['   ', '   '],
])('capitalizes only the initial character in %j', (input, expected) => {
  expect(capitalizeFirstLetter(input)).toBe(expected);
});
