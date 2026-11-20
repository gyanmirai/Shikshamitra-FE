import type { IdentityCardElement } from '../types';

export type StudioOrder = 'front' | 'back' | 'forward' | 'backward';
export type ElementTransform = (element: IdentityCardElement) => IdentityCardElement;

export const studioId = () => crypto.randomUUID();

export function updateSelected(
  elements: IdentityCardElement[],
  ids: string[],
  transform: ElementTransform
) {
  return elements.map((element) =>
    ids.includes(element.id) && !element.locked ? transform(element) : element
  );
}

export function duplicateElements(
  elements: IdentityCardElement[],
  source: IdentityCardElement[],
  width: number,
  height: number
) {
  if (!source.length) return elements;
  const groups = new Map<string, string>();
  const dx = Math.max(
    0,
    Math.min(12, width - Math.max(...source.map((element) => element.x + element.w)))
  );
  const dy = Math.max(
    0,
    Math.min(12, height - Math.max(...source.map((element) => element.y + element.h)))
  );
  const z = Math.max(0, ...elements.map((element) => element.z));
  const copies = [...source]
    .sort((a, b) => a.z - b.z)
    .map((element, index) => {
      if (element.groupId && !groups.has(element.groupId)) groups.set(element.groupId, studioId());
      return {
        ...structuredClone(element),
        id: studioId(),
        x: element.x + dx,
        y: element.y + dy,
        z: z + index + 1,
        locked: false,
        ...(element.groupId ? { groupId: groups.get(element.groupId) } : {}),
      };
    });
  return [...elements, ...copies];
}

export function orderElements(elements: IdentityCardElement[], ids: string[], mode: StudioOrder) {
  const slots = [...elements].filter((element) => !element.locked).sort((a, b) => a.z - b.z);
  const chosen = (element: IdentityCardElement) => ids.includes(element.id);
  let ordered = [...slots];
  if (mode === 'front') ordered = [...slots.filter((e) => !chosen(e)), ...slots.filter(chosen)];
  if (mode === 'back') ordered = [...slots.filter(chosen), ...slots.filter((e) => !chosen(e))];
  if (mode === 'forward') {
    for (let index = ordered.length - 2; index >= 0; index -= 1) {
      if (chosen(ordered[index]) && !chosen(ordered[index + 1])) {
        [ordered[index], ordered[index + 1]] = [ordered[index + 1], ordered[index]];
      }
    }
  }
  if (mode === 'backward') {
    for (let index = 1; index < ordered.length; index += 1) {
      if (chosen(ordered[index]) && !chosen(ordered[index - 1])) {
        [ordered[index], ordered[index - 1]] = [ordered[index - 1], ordered[index]];
      }
    }
  }
  if (ordered.every((element, index) => element.id === slots[index].id)) return elements;
  let cursor = 0;
  return [...elements].sort((a, b) => a.z - b.z).map((element) => {
    if (element.locked) return element;
    const replacement = ordered[cursor];
    cursor += 1;
    return { ...replacement, z: element.z };
  });
}
