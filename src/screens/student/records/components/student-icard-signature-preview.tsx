import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { Board, Medium, AcademicYear } from 'src/types/school';
import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useIdentityPermissions } from 'src/screens/setting/school-identity/hooks/use-identity-permissions';
import {
  useGetSchoolIdentityQuery,
  useGetSchoolIdentityAssetQuery,
} from 'src/redux/InstituteSetup/schoolIdentityApi';

export function StudentICardSignaturePreview({
  template,
  snapshot,
  enabled = true,
  children,
}: {
  template: IdCardTemplate;
  snapshot?: IdCardTemplate['schoolIdentity'];
  enabled?: boolean;
  children: (url?: string) => ReactNode;
}) {
  const { canView, canAccessSignature } = useIdentityPermissions();
  const board: Partial<Board> = useSelector((state: RootState) => state.globalState?.currentBoard) ?? {};
  const medium: Partial<Medium> = useSelector((state: RootState) => state.globalState?.currentMedium) ?? {};
  const year: Partial<AcademicYear> = useSelector((state: RootState) => state.globalState?.currentYear) ?? {};
  const boardId = board.academicYearId === year.id ? board.id : undefined;
  const activeContext = {
    boardId,
    mediumId: boardId && medium.educationBoardId === boardId ? medium.id : undefined,
  };
  const canRead = enabled && canView && canAccessSignature && template.signature?.mode !== 2;
  const custom = template.signature?.mode === 1;
  const context = snapshot
    ? {
        boardId: snapshot.boardId ?? undefined,
        mediumId: snapshot.mediumId ?? undefined,
        organizationId: snapshot.organizationId ?? undefined,
      }
    : custom ? {} : activeContext;
  const identity = useGetSchoolIdentityQuery(context, { skip: !canRead || custom || Boolean(snapshot) });
  const assetId = snapshot
    ? snapshot.signatureAssetId
    : custom ? template.signature?.assetId : identity.currentData?.effective.signature?.asset?.id;
  const { currentData } = useGetSchoolIdentityAssetQuery(
    { ...context, id: assetId ?? '' },
    { skip: !canRead || !assetId }
  );
  const [image, setImage] = useState<{ blob: Blob; url: string }>();
  useEffect(() => {
    if (!currentData) return undefined;
    const url = URL.createObjectURL(currentData);
    setImage({ blob: currentData, url });
    return () => URL.revokeObjectURL(url);
  }, [currentData]);
  return children(canRead && assetId && image?.blob === currentData ? image?.url : undefined);
}
