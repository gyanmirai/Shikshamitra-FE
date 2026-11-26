import type { IBuilding, IBuildingFloorValue, IBuildingFormValues } from '../types';

export const createBuildingFloor = (floorNo: number): IBuildingFloorValue => ({
  rowKey: crypto.randomUUID(),
  id: '',
  floorNo,
  floorName: '',
  totalRoom: '',
});

export function plainBuildingDescription(value: string) {
  if (!/^\s*<(?:p|div|h[1-6]|ul|ol|blockquote)(?:\s[^>]*|)>/i.test(value)) return value;
  const parsed = new DOMParser().parseFromString(value, 'text/html');
  parsed.querySelectorAll('script, style, template').forEach((node) => node.remove());
  parsed.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
  parsed.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6').forEach((node) => {
    node.append('\n');
  });
  return (parsed.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
}

export const getBuildingInitialValues = (editData?: IBuilding | null): IBuildingFormValues => ({
  buildingName: editData?.buildingName ?? '',
  description: plainBuildingDescription(editData?.description ?? ''),
  floors: editData
    ? [...(editData.floors ?? [])]
        .sort((first, second) => first.floorNo - second.floorNo || first.id.localeCompare(second.id))
        .map((floor) => ({ ...floor, rowKey: floor.id }))
    : [createBuildingFloor(1)],
});

export function buildingPayload(values: IBuildingFormValues, editData?: IBuilding | null) {
  const savedFloors = new Map(editData?.floors.map((floor) => [floor.id, floor]));
  // Keep gaps after deletion so removing an earlier floor doesn't renumber an occupied floor.
  const floorNumbers = values.floors
    .flatMap(({ id }) => {
      const saved = savedFloors.get(id);
      return saved ? [saved.floorNo] : [];
    })
    .sort((first, second) => first - second);
  const nextFloorNumber = (floorNumbers.at(-1) ?? 0) + 1;
  const floors = values.floors.map((floor, index) => ({
    id: floor.id,
    floorNo: floorNumbers[index] ?? nextFloorNumber + index - floorNumbers.length,
    floorName:
      floor.floorName === savedFloors.get(floor.id)?.floorName ? floor.floorName : floor.floorName.trim(),
    totalRoom: Number(floor.totalRoom),
  }));
  const details = {
    buildingName: values.buildingName.trim(),
    description: values.description.trim(),
    totalFloors: floors.length,
  };
  const withoutId = (floor: (typeof floors)[number]) => ({
    floorNo: floor.floorNo,
    floorName: floor.floorName,
    totalRoom: floor.totalRoom,
  });
  return editData
    ? {
        ...details,
        floorsToUpdate: floors.filter((floor) => floor.id),
        floorsToAdd: floors.filter((floor) => !floor.id).map(withoutId),
        floorIdsToDelete: editData.floors
          .filter((floor) => !floors.some((current) => current.id === floor.id))
          .map((floor) => floor.id),
      }
    : { ...details, floors: floors.map(withoutId) };
}
