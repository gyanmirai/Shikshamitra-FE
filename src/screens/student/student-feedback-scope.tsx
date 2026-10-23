'use client';

import type { ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import { StudentFeedbackProvider } from 'src/components/student-feedback';

export function StudentFeedbackScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <StudentFeedbackProvider scopeKey={pathname ?? 'student'}>{children}</StudentFeedbackProvider>
  );
}
