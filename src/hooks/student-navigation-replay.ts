export type BrowserNavigation = EventTarget & {
  traverseTo: (key: string) => { finished: Promise<unknown> };
};

let permit: { key: string } | null = null;
const replayEvents = new WeakSet<Event>();

export function isStudentTraversalReplay(event: Event, key: string) {
  if (replayEvents.has(event)) return true;
  if (permit?.key !== key) return false;
  permit = null;
  replayEvents.add(event);
  return true;
}

export function replayStudentTraversal(navigation: BrowserNavigation | undefined, key: string) {
  if (!navigation) return;
  const approved = { key };
  permit = approved;
  const clear = () => {
    if (permit === approved) permit = null;
  };
  try {
    navigation.traverseTo(key).finished.then(clear, clear);
  } catch {
    clear();
  }
}
