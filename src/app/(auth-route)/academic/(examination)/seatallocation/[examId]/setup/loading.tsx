import { GuidedSeatingPageShell } from 'src/screens/examination/seatingPlan/guided/guided-seating-page-shell';
import { GuidedSeatingWorkspaceSkeleton } from 'src/screens/examination/seatingPlan/guided/guided-seating-workspace-skeleton';

export default function Loading() {
  return (
    <GuidedSeatingPageShell>
      <GuidedSeatingWorkspaceSkeleton />
    </GuidedSeatingPageShell>
  );
}
