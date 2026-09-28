import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import { useState, useEffect } from 'react';
import { useLazyGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';

export function useWorkflowRouteForms(open: boolean, ids: string[]) {
  const [load] = useLazyGetAdmissionFormQuery();
  const [state, setState] = useState<{ forms: AdmissionForm[]; loading: boolean; error: boolean }>({forms:[],loading:false,error:false});
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify(ids);
  useEffect(() => {
    let cancelled = false;
    if (!open) return undefined;
    setState({forms:[],loading:true,error:false});
    Promise.allSettled((JSON.parse(key) as string[]).map((id) => load(id, true).unwrap())).then((results) => {
      if (cancelled) return;
      setState({loading:false, error:results.some((result) => result.status === 'rejected'),
        forms:results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])});
    });
    return () => { cancelled = true; };
  }, [key, open, attempt, load]);
  return {...state,retry:() => setAttempt((value) => value + 1)};
}
