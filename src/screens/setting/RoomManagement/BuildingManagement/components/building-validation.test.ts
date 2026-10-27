import { it, expect } from 'vitest';

import { buildingValidationSchema } from './validationSchema';

const building = {
  buildingName: 'Main Block',
  totalFloors: 1,
  floors: [{ id: 'floor-a', floorNo: 1, floorName: 'First Floor', totalRoom: 1, roomCount: 2 }],
};

it('rejects a floor capacity below its created room count with recovery guidance', async () => {
  await expect(buildingValidationSchema.validate(building)).rejects.toMatchObject({
    path: 'floors[0].totalRoom',
    message:
      'Cannot set total rooms to 1. First Floor already has 2 rooms. Delete or reassign existing rooms before reducing the total room capacity.',
  });
});

it.each([2, 3])('accepts a capacity of %s when two rooms exist', async (totalRoom) => {
  await expect(
    buildingValidationSchema.validate({
      ...building,
      floors: [{ ...building.floors[0], totalRoom }],
    })
  ).resolves.toBeDefined();
});

it('permits unused capacity to decrease and new floors to use the normal minimum', async () => {
  await expect(
    buildingValidationSchema.validate({
      ...building,
      floors: [{ ...building.floors[0], roomCount: 0 }],
    })
  ).resolves.toBeDefined();
  await expect(
    buildingValidationSchema.validate({
      ...building,
      floors: [{ floorNo: 1, floorName: 'New Floor', totalRoom: 1 }],
    })
  ).resolves.toBeDefined();
});
