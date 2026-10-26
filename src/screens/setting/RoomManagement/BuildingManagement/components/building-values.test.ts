import { it, expect } from 'vitest';

import { buildingValidationSchema } from './validationSchema';
import {
  buildingPayload,
  getBuildingInitialValues,
  plainBuildingDescription,
} from './initialValues';

it('loads floors in sequence and converts legacy descriptions to plain text', () => {
  const result = getBuildingInitialValues({
    id: 7,
    buildingName: 'North',
    totalFloors: 2,
    description: '<p>Main &amp; annex</p><p>Classrooms</p>',
    floors: [
      { id: 'b', floorNo: 2, floorName: 'First', totalRoom: 3 },
      { id: 'a', floorNo: 1, floorName: 'Ground', totalRoom: 2 },
    ],
  });
  expect(result.floors.map((floor) => floor.id)).toEqual(['a', 'b']);
  expect(result.description).toBe('Main & annex\nClassrooms');
});

it('preserves literal angle brackets in plain descriptions', () => {
  expect(plainBuildingDescription('Use <north> entrance.')).toBe('Use <north> entrance.');
});

it('requires an individual floor and rejects fractional room capacity', async () => {
  const values = { buildingName: 'North', description: '', totalFloors: 1, floors: [] };
  expect(await buildingValidationSchema.isValid(values)).toBe(false);
  expect(
    await buildingValidationSchema.isValid({
      ...values,
      floors: [{ floorName: 'Ground', totalRoom: 1.5 }],
    })
  ).toBe(false);
});

it('separates new, updated, and removed floors while preserving zero-based numbering', () => {
  const building = {
    id: 7,
    buildingName: 'North',
    description: '',
    totalFloors: 2,
    floors: [
      { id: 'ground', floorNo: 0, floorName: 'Ground', totalRoom: 5 },
      { id: 'first', floorNo: 1, floorName: 'First', totalRoom: 8 },
    ],
  };
  const values = getBuildingInitialValues(building);
  values.floors = [
    values.floors[1],
    { rowKey: 'new-row', id: '', floorNo: 9, floorName: 'Second', totalRoom: '4' },
  ];
  expect(buildingPayload(values, building)).toEqual({
    buildingName: 'North',
    description: '',
    totalFloors: 2,
    floorsToUpdate: [{ id: 'first', floorNo: 0, floorName: 'First', totalRoom: 8 }],
    floorsToAdd: [{ floorNo: 1, floorName: 'Second', totalRoom: 4 }],
    floorIdsToDelete: ['ground'],
  });
  expect(buildingPayload(values)).toEqual({
    buildingName: 'North',
    description: '',
    totalFloors: 2,
    floors: [
      { floorNo: 1, floorName: 'First', totalRoom: 8 },
      { floorNo: 2, floorName: 'Second', totalRoom: 4 },
    ],
  });
});
