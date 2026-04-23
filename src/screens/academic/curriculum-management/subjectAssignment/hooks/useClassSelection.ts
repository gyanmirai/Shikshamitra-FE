import type { Standards, Organization } from 'src/types/school';

import { useState, useEffect, useCallback } from 'react';

interface UseClassSelectionParams {
  medium: {
    educationMediumStages?: Organization[];
  } | null;
}

export function useClassSelection({ medium }: UseClassSelectionParams) {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState('');
  const [classId, setClassId] = useState('');

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClassId(allClasses[0]?.id || '');
    setClasses(allClasses[0]?.name || '');
  }, [medium]);

  /**
   * Memoization Justification:
   * Passed to SubjectActionBar (React.memo) as `onClassChange` prop.
   * Prevents re-renders from table data or dialog state changes.
   */
  const handleClassChange = useCallback(
    (value: string | number) => {
      setClassId(value as string);
      const standard = allClass.find((c) => c.id === value);
      setClasses(standard?.name || '');
    },
    [allClass]
  );

  return { allClass, classes, classId, handleClassChange };
}
