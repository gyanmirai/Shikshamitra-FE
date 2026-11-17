'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { useRecordStudentSetupVisitMutation } from 'src/redux/student/setup/api';

export function useStudentSetupVisit(tenantId: string, query: string, returnTo: string) {
  const router = useRouter();
  const [recordVisit] = useRecordStudentSetupVisitMutation();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const started = useRef('');
  const mounted = useRef(false);
  const identity = useRef(tenantId);
  identity.current = tenantId;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    const key = `${tenantId}:${attempt}`;
    if (started.current === key) return;
    started.current = key;
    setFailed(false);
    recordVisit({ settingKey: 'welcome' })
      .unwrap()
      .then((result) => {
        if (!mounted.current || identity.current !== tenantId) return;
        const params = new URLSearchParams(query);
        if (params.get('source') === 'automatic') {
          if (!result.firstVisit) {
            router.replace(returnTo);
            return;
          }
          params.delete('source');
          router.replace(`/student/setup${params.size ? `?${params}` : ''}`, { scroll: false });
        }
        setReady(true);
      })
      .catch(() => {
        if (mounted.current && identity.current === tenantId) setFailed(true);
      });
  }, [tenantId, attempt, query, returnTo, recordVisit, router]);
  return {
    ready: ready && new URLSearchParams(query).get('source') !== 'automatic',
    failed,
    retry: () => setAttempt((value) => value + 1),
  };
}

