'use client';

import { AdmissionsPlaybookOperations } from './admissions-playbook-operations';

import { useAdmissionsPlaybookWorkspace } from './admissions-playbook-configuration-context';

export function AdmissionsPlaybookSection3() {
  const { state: controllerState, actions, meta } = useAdmissionsPlaybookWorkspace();
  const { operationsPlaybook, setOperationsPlaybook } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      {operationsPlaybook ? (
        <AdmissionsPlaybookOperations
          key={operationsPlaybook.id}
          playbook={operationsPlaybook}
          open
          onClose={() => setOperationsPlaybook(null)}
        />
      ) : null}
    </>
  );
}
