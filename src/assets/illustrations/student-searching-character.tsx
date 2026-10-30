import { STUDENT_CHARACTER_SRC } from './student-character-asset';

export function StudentSearchingCharacter({ loading = false }: { loading?: boolean }) {
  return (
    <image
      href={STUDENT_CHARACTER_SRC}
      x="10"
      y="8"
      width="168"
      height="252"
      preserveAspectRatio="xMidYMid meet"
      data-state={loading ? 'loading' : 'idle'}
    />
  );
}
