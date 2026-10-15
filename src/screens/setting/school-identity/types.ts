export type IdentityKind = 'logo' | 'banner' | 'signature';
export type IdentityMode = 0 | 1 | 2;
export type IdentityContext = { boardId?: string; mediumId?: string };
export type IdentitySelection = {
  mode: IdentityMode;
  assetId?: string | null;
  principalName?: string | null;
  designation?: string | null;
};
export type IdentityChoices = {
  logo: IdentitySelection;
  banner: IdentitySelection;
  signature?: IdentitySelection | null;
};
export type IdentityAsset = {
  id: string;
  kind: number;
  fileName: string;
  contentType: string;
  size: number;
  width: number;
  height: number;
};
export type EffectiveIdentityAsset = {
  selection: IdentitySelection;
  source: string;
  asset?: IdentityAsset | null;
};
export type IdentityProfile = IdentityContext & {
  id?: string;
  academicYearId?: string;
  concurrencyStamp: string;
  choices: IdentityChoices;
  effective: Partial<Record<IdentityKind, EffectiveIdentityAsset>>;
  canAccessSignature: boolean;
  canManage: boolean;
};
export type IdentityRevision = {
  id: string;
  creationTime: string;
  creatorId?: string;
  creatorName?: string;
  reason: string;
  choices: IdentityChoices;
};
export type IdentityCopy = {
  sourceBoardId: string;
  sourceMediumId?: string;
  targetBoardId: string;
  targetMediumId?: string;
  targetConcurrencyStamp: string;
};
export const IDENTITY_KINDS: IdentityKind[] = ['logo', 'banner', 'signature'];
export const IDENTITY_LABELS: Record<IdentityKind, string> = {
  logo: 'School logo',
  banner: 'School banner / letterhead',
  signature: 'Principal’s signature',
};
export const IDENTITY_LIMITS: Record<IdentityKind, number> = {
  logo: 2 * 1024 * 1024,
  banner: 5 * 1024 * 1024,
  signature: 1024 * 1024,
};
export const schoolIdentityActions = {
  view: 'InstituteSetup.SchoolIdentity.View',
  manageDefaults: 'InstituteSetup.SchoolIdentity.ManageDefaults',
  manageOverrides: 'InstituteSetup.SchoolIdentity.ManageOverrides',
  accessSignature: 'InstituteSetup.SchoolIdentity.AccessSignature',
};
