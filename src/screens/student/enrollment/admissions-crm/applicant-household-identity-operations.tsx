'use client';

import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Add, Link, Badge, Gavel, Shield, CheckCircle } from '@mui/icons-material';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Divider,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmConsentStatus,
  AdmissionCrmUdiseSyncStatus,
  useGetAdmissionCrmLeadQuery,
  AdmissionCrmPersonProvenance,
  useSearchAdmissionCrmPersonsQuery,
  AdmissionCrmGuardianRelationshipType,
  AdmissionCrmIdentityResolutionStatus,
  useSearchAdmissionCrmHouseholdsQuery,
  AdmissionCrmIdentityVerificationStatus,
  useLinkAdmissionCrmPersonAccountMutation,
  useUpdateAdmissionCrmPersonIdentityMutation,
  useRecordAdmissionCrmIdentityConsentMutation,
  useSetAdmissionCrmGuardianRestrictionMutation,
  useAddAdmissionCrmGuardianRelationshipMutation,
  useVerifyAdmissionCrmGuardianAuthorityMutation,
  useGetAdmissionCrmHouseholdIdentityProfileQuery,
  useOverrideAdmissionCrmIdentityReadinessMutation,
  useCreateAdmissionCrmHouseholdIdentityProfileMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { ApplicantSwitchRow, ApplicantInlineNotice } from './applicant-workspace-primitives';

type Props = { leadId: string };

const relationshipLabels: Record<AdmissionCrmGuardianRelationshipType, string> = {
  [AdmissionCrmGuardianRelationshipType.Mother]: 'Mother',
  [AdmissionCrmGuardianRelationshipType.Father]: 'Father',
  [AdmissionCrmGuardianRelationshipType.LegalGuardian]: 'Legal guardian',
  [AdmissionCrmGuardianRelationshipType.FosterGuardian]: 'Foster guardian',
  [AdmissionCrmGuardianRelationshipType.Grandparent]: 'Grandparent',
  [AdmissionCrmGuardianRelationshipType.Sibling]: 'Sibling',
  [AdmissionCrmGuardianRelationshipType.Relative]: 'Relative',
  [AdmissionCrmGuardianRelationshipType.LocalGuardian]: 'Local guardian',
  [AdmissionCrmGuardianRelationshipType.InstitutionGuardian]: 'Institution guardian',
  [AdmissionCrmGuardianRelationshipType.SchoolDefined]: 'School defined',
};

const readinessLabels: Record<AdmissionCrmIdentityResolutionStatus, string> = {
  [AdmissionCrmIdentityResolutionStatus.Unresolved]: 'Unresolved',
  [AdmissionCrmIdentityResolutionStatus.PendingReview]: 'Pending review',
  [AdmissionCrmIdentityResolutionStatus.Ready]: 'Ready',
  [AdmissionCrmIdentityResolutionStatus.Conflict]: 'Conflict',
  [AdmissionCrmIdentityResolutionStatus.Overridden]: 'Overridden',
};

const readError = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { errorCode?: string; detail?: string } };
    return data?.errorCode || data?.detail || 'Unable to update household identity.';
  }
  return 'Unable to update household identity.';
};

export function ApplicantHouseholdIdentityOperations({ leadId }: Props) {
  const profileQuery = useGetAdmissionCrmHouseholdIdentityProfileQuery({ leadId });
  const leadQuery = useGetAdmissionCrmLeadQuery({ leadId });
  const profile = profileQuery.data;
  const lead = leadQuery.data;

  const [householdMode, setHouseholdMode] = useState<'new' | 'existing'>('new');
  const [householdName, setHouseholdName] = useState('');
  const [language, setLanguage] = useState('en');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Gujarat');
  const [postalCode, setPostalCode] = useState('');
  const [householdSearch, setHouseholdSearch] = useState('');
  const [existingHouseholdId, setExistingHouseholdId] = useState('');
  const householdsQuery = useSearchAdmissionCrmHouseholdsQuery(
    { searchText: householdSearch || undefined, maxResultCount: 25 },
    { skip: householdMode !== 'existing' }
  );
  const [createProfile, createProfileState] =
    useCreateAdmissionCrmHouseholdIdentityProfileMutation();

  const [personSearch, setPersonSearch] = useState('');
  const [existingGuardianId, setExistingGuardianId] = useState('');
  const peopleQuery = useSearchAdmissionCrmPersonsQuery(
    { name: personSearch || undefined, contact: personSearch || undefined, maxResultCount: 25 },
    { skip: !profile || !personSearch.trim() }
  );
  const [guardianFirstName, setGuardianFirstName] = useState('');
  const [guardianLastName, setGuardianLastName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [relationshipType, setRelationshipType] = useState(
    AdmissionCrmGuardianRelationshipType.Mother
  );
  const [isPrimary, setIsPrimary] = useState(true);
  const [isEmergency, setIsEmergency] = useState(true);
  const [isAccountable, setIsAccountable] = useState(true);
  const [hasFeeResponsibility, setHasFeeResponsibility] = useState(true);
  const [hasPickupAuthorization, setHasPickupAuthorization] = useState(true);
  const [hasPortalAccess, setHasPortalAccess] = useState(true);
  const [addGuardian, addGuardianState] = useAddAdmissionCrmGuardianRelationshipMutation();

  const [aadhaar, setAadhaar] = useState('');
  const [penNumber, setPenNumber] = useState('');
  const [apaarId, setApaarId] = useState('');
  const [udiseCode, setUdiseCode] = useState('');
  const [updateIdentity, identityState] = useUpdateAdmissionCrmPersonIdentityMutation();
  const [consentActor, setConsentActor] = useState('');
  const [recordConsent, consentState] = useRecordAdmissionCrmIdentityConsentMutation();
  const [evidenceReference, setEvidenceReference] = useState('');
  const [protectedRestriction, setProtectedRestriction] = useState('');
  const [accountUserId, setAccountUserId] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [verifyAuthority, verifyState] = useVerifyAdmissionCrmGuardianAuthorityMutation();
  const [setRestriction, restrictionState] = useSetAdmissionCrmGuardianRestrictionMutation();
  const [linkAccount, linkState] = useLinkAdmissionCrmPersonAccountMutation();
  const [overrideReadiness, overrideState] = useOverrideAdmissionCrmIdentityReadinessMutation();

  useEffect(() => {
    if (lead && !householdName) {
      const displayName = [lead.firstName, lead.lastName].filter(Boolean).join(' ');
      setHouseholdName(`${displayName || 'Applicant'} household`);
    }
  }, [householdName, lead]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message: success });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error) });
    }
  };

  if (profileQuery.isFetching || leadQuery.isFetching) return <LinearProgress />;

  if (!profile) {
    return (
      <Box component="section">
        <Stack spacing={1.25}>
          <Stack direction="row" gap={0.75} alignItems="center">
            <Badge fontSize="small" />
            <Typography variant="subtitle2">Household and identity</Typography>
          </Stack>
          <ApplicantInlineNotice>
            Resolve the applicant into a reusable household before final activation.
          </ApplicantInlineNotice>
          <TextField
            select
            size="small"
            label="Household"
            value={householdMode}
            onChange={(event) => setHouseholdMode(event.target.value as 'new' | 'existing')}
            sx={{ maxWidth: 240 }}
          >
            <MenuItem value="new">Create household</MenuItem>
            <MenuItem value="existing">Reuse household</MenuItem>
          </TextField>
          {householdMode === 'existing' ? (
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
              <TextField
                size="small"
                label="Search household"
                value={householdSearch}
                onChange={(event) => setHouseholdSearch(event.target.value)}
              />
              <TextField
                select
                size="small"
                label="Existing household"
                value={existingHouseholdId}
                onChange={(event) => setExistingHouseholdId(event.target.value)}
                sx={{ minWidth: 260 }}
              >
                {(householdsQuery.data?.items || []).map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.displayName} ({item.code}) - {item.activeMemberCount} member(s)
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          ) : (
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
              <TextField
                size="small"
                fullWidth
                label="Household name"
                value={householdName}
                onChange={(event) => setHouseholdName(event.target.value)}
              />
              <TextField
                size="small"
                label="Language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              />
              <TextField
                size="small"
                fullWidth
                label="Address line"
                value={addressLine}
                onChange={(event) => setAddressLine(event.target.value)}
              />
              <TextField
                size="small"
                label="City"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
              <TextField
                size="small"
                label="State"
                value={state}
                onChange={(event) => setState(event.target.value)}
              />
              <TextField
                size="small"
                label="PIN code"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
              />
            </Stack>
          )}
          <LoadingButton
            variant="contained"
            startIcon={<Add />}
            loading={createProfileState.isLoading}
            disabled={householdMode === 'existing' ? !existingHouseholdId : !householdName.trim()}
            onClick={() =>
              run(
                () =>
                  createProfile({
                    leadId,
                    body: {
                      existingHouseholdId:
                        householdMode === 'existing' ? existingHouseholdId : undefined,
                      householdDisplayName: householdName,
                      preferredLanguage: language,
                      addresses:
                        householdMode === 'new' && addressLine.trim()
                          ? [
                              {
                                type: 'Correspondence',
                                line1: addressLine,
                                city,
                                state,
                                postalCode,
                                country: 'India',
                                isVerified: false,
                              },
                            ]
                          : [],
                      communicationPreferences: {},
                      applicant: {
                        firstName: lead?.firstName || 'Applicant',
                        middleName: lead?.middleName,
                        lastName: lead?.lastName,
                        dateOfBirth: lead?.dateOfBirth,
                        phone: lead?.primaryContactNo,
                        email: lead?.email,
                        provenance: AdmissionCrmPersonProvenance.StaffSupplied,
                      },
                    },
                  }).unwrap(),
                'Household identity profile created.'
              )
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            Resolve household
          </LoadingButton>
        </Stack>
      </Box>
    );
  }

  return (
    <Box component="section">
      <Stack spacing={1.25}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2">Household and identity</Typography>
            <Typography variant="caption" color="text.secondary">
              {profile.householdDisplayName} - {profile.householdCode}
            </Typography>
          </Box>
          <Chip
            size="small"
            color={
              profile.status === AdmissionCrmIdentityResolutionStatus.Ready
                ? 'success'
                : profile.status === AdmissionCrmIdentityResolutionStatus.Conflict
                  ? 'error'
                  : 'warning'
            }
            label={readinessLabels[profile.status]}
          />
        </Stack>
        <Stack direction="row" gap={0.75} flexWrap="wrap">
          <Chip
            size="small"
            color={profile.accountableContactReady ? 'success' : 'warning'}
            label={`Accountable contact: ${profile.accountableContactReady ? 'Ready' : 'Pending'}`}
          />
          <Chip
            size="small"
            color={profile.identityConsentReady ? 'success' : 'warning'}
            label={`Identity consent: ${profile.identityConsentReady ? 'Ready' : 'Pending'}`}
          />
          <Chip
            size="small"
            color={profile.accountLinkReady ? 'success' : 'warning'}
            label={`Account link: ${profile.accountLinkReady ? 'Ready' : 'Pending'}`}
          />
        </Stack>
        <Divider />
        <Typography variant="subtitle2">Applicant identity readiness</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
          <TextField
            size="small"
            label="Aadhaar"
            placeholder={profile.applicant.aadhaarMasked || 'Optional'}
            value={aadhaar}
            onChange={(event) => setAadhaar(event.target.value)}
          />
          <TextField
            size="small"
            label="PEN"
            value={penNumber}
            onChange={(event) => setPenNumber(event.target.value)}
          />
          <TextField
            size="small"
            label="APAAR ID"
            value={apaarId}
            onChange={(event) => setApaarId(event.target.value)}
          />
          <TextField
            size="small"
            label="UDISE+ student code"
            value={udiseCode}
            onChange={(event) => setUdiseCode(event.target.value)}
          />
          <LoadingButton
            variant="outlined"
            loading={identityState.isLoading}
            onClick={() =>
              run(
                () =>
                  updateIdentity({
                    personId: profile.applicantPersonId,
                    body: {
                      aadhaarNo: aadhaar || undefined,
                      aadhaarStatus: aadhaar
                        ? AdmissionCrmIdentityVerificationStatus.Pending
                        : profile.applicant.aadhaarStatus,
                      penNumber: penNumber || undefined,
                      penStatus: penNumber
                        ? AdmissionCrmIdentityVerificationStatus.Pending
                        : AdmissionCrmIdentityVerificationStatus.NotProvided,
                      apaarId: apaarId || undefined,
                      apaarConsentStatus: apaarId
                        ? AdmissionCrmConsentStatus.Granted
                        : AdmissionCrmConsentStatus.NotAsked,
                      apaarStatus: apaarId
                        ? AdmissionCrmIdentityVerificationStatus.Pending
                        : AdmissionCrmIdentityVerificationStatus.NotProvided,
                      udiseStudentCode: udiseCode || undefined,
                      udiseStatus: udiseCode
                        ? AdmissionCrmUdiseSyncStatus.Ready
                        : AdmissionCrmUdiseSyncStatus.NotReady,
                    },
                  }).unwrap(),
                'Identity readiness updated.'
              )
            }
          >
            Save identity
          </LoadingButton>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
          <TextField
            size="small"
            fullWidth
            label="Consent actor"
            value={consentActor}
            onChange={(event) => setConsentActor(event.target.value)}
          />
          <LoadingButton
            startIcon={<Shield />}
            variant="outlined"
            loading={consentState.isLoading}
            disabled={!consentActor.trim()}
            onClick={() =>
              run(
                () =>
                  recordConsent({
                    leadId,
                    body: {
                      personId: profile.applicantPersonId,
                      purpose: 'Identity processing',
                      textVersion: 'identity-processing-v1',
                      language: profile.preferredLanguage,
                      actor: consentActor,
                      channel: 'Staff recorded',
                      isGranted: true,
                    },
                  }).unwrap(),
                'Identity-processing consent recorded.'
              )
            }
          >
            Record consent
          </LoadingButton>
        </Stack>
        <Divider />
        <Typography variant="subtitle2">Add or reuse guardian</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
          <TextField
            size="small"
            label="Search existing person"
            value={personSearch}
            onChange={(event) => setPersonSearch(event.target.value)}
          />
          <TextField
            select
            size="small"
            label="Existing person"
            value={existingGuardianId}
            onChange={(event) => setExistingGuardianId(event.target.value)}
            sx={{ minWidth: 230 }}
          >
            <MenuItem value="">Create new</MenuItem>
            {(peopleQuery.data?.items || []).map((person) => (
              <MenuItem key={person.id} value={person.id}>
                {[person.firstName, person.lastName].filter(Boolean).join(' ')} -{' '}
                {person.phone || person.email}
              </MenuItem>
            ))}
          </TextField>
          {!existingGuardianId ? (
            <>
              <TextField
                size="small"
                label="First name"
                value={guardianFirstName}
                onChange={(event) => setGuardianFirstName(event.target.value)}
              />
              <TextField
                size="small"
                label="Last name"
                value={guardianLastName}
                onChange={(event) => setGuardianLastName(event.target.value)}
              />
              <TextField
                size="small"
                label="Phone"
                value={guardianPhone}
                onChange={(event) => setGuardianPhone(event.target.value)}
              />
              <TextField
                size="small"
                label="Email"
                value={guardianEmail}
                onChange={(event) => setGuardianEmail(event.target.value)}
              />
            </>
          ) : null}
          <TextField
            select
            size="small"
            label="Relationship"
            value={relationshipType}
            onChange={(event) =>
              setRelationshipType(
                Number(event.target.value) as AdmissionCrmGuardianRelationshipType
              )
            }
            sx={{ minWidth: 160 }}
          >
            {Object.entries(relationshipLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            columnGap: 2,
          }}
        >
          <ApplicantSwitchRow label="Primary contact" checked={isPrimary} onChange={setIsPrimary} />
          <ApplicantSwitchRow
            label="Emergency contact"
            checked={isEmergency}
            onChange={setIsEmergency}
          />
          <ApplicantSwitchRow
            label="Accountable guardian"
            checked={isAccountable}
            onChange={setIsAccountable}
          />
          <ApplicantSwitchRow
            label="Fee responsibility"
            checked={hasFeeResponsibility}
            onChange={setHasFeeResponsibility}
          />
          <ApplicantSwitchRow
            label="Pickup authorization"
            checked={hasPickupAuthorization}
            onChange={setHasPickupAuthorization}
          />
          <ApplicantSwitchRow
            label="Portal access"
            checked={hasPortalAccess}
            onChange={setHasPortalAccess}
          />
          <LoadingButton
            variant="outlined"
            startIcon={<Add />}
            loading={addGuardianState.isLoading}
            disabled={!existingGuardianId && !guardianFirstName.trim()}
            onClick={() =>
              run(
                () =>
                  addGuardian({
                    leadId,
                    body: {
                      existingGuardianPersonId: existingGuardianId || undefined,
                      guardian: {
                        firstName: guardianFirstName || 'Existing',
                        lastName: guardianLastName || undefined,
                        phone: guardianPhone || undefined,
                        email: guardianEmail || undefined,
                        provenance: AdmissionCrmPersonProvenance.StaffSupplied,
                      },
                      relationshipType,
                      isPrimaryContact: isPrimary,
                      isEmergencyContact: isEmergency,
                      isAccountableContact: isAccountable,
                      hasFeeResponsibility,
                      hasPickupAuthorization,
                      hasPortalAccess,
                      communicationPriority: profile.guardians.length + 1,
                    },
                  }).unwrap(),
                'Guardian relationship added.'
              )
            }
          >
            Add guardian
          </LoadingButton>
        </Box>
        {profile.guardians.map((guardian) => (
          <Stack
            key={guardian.id}
            spacing={0.75}
            sx={{ py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}
          >
            <Stack direction="row" gap={0.75} alignItems="center" flexWrap="wrap">
              <Typography variant="body2">
                {[guardian.guardian.firstName, guardian.guardian.lastName]
                  .filter(Boolean)
                  .join(' ')}
              </Typography>
              <Chip size="small" label={relationshipLabels[guardian.relationshipType]} />
              <Chip
                size="small"
                color={guardian.authorityVerified ? 'success' : 'warning'}
                label={guardian.authorityVerified ? 'Authority verified' : 'Authority pending'}
              />
              {guardian.hasProtectedRestriction ? (
                <Chip size="small" color="error" label="Protected restriction" />
              ) : null}
              {guardian.guardian.userId ? (
                <Chip size="small" color="success" label="Account linked" />
              ) : null}
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
              {!guardian.authorityVerified ? (
                <>
                  <TextField
                    size="small"
                    fullWidth
                    label="Authority evidence reference"
                    value={evidenceReference}
                    onChange={(event) => setEvidenceReference(event.target.value)}
                  />
                  <LoadingButton
                    startIcon={<CheckCircle />}
                    loading={verifyState.isLoading}
                    disabled={!evidenceReference.trim()}
                    onClick={() =>
                      run(
                        () =>
                          verifyAuthority({
                            relationshipId: guardian.id,
                            evidenceReference,
                          }).unwrap(),
                        'Guardian authority verified.'
                      )
                    }
                  >
                    Verify
                  </LoadingButton>
                </>
              ) : null}
              <TextField
                size="small"
                fullWidth
                label="Protected custody, contact, or pickup restriction"
                value={protectedRestriction}
                onChange={(event) => setProtectedRestriction(event.target.value)}
              />
              <LoadingButton
                color="warning"
                loading={restrictionState.isLoading}
                onClick={() =>
                  run(
                    () =>
                      setRestriction({
                        relationshipId: guardian.id,
                        restriction: protectedRestriction || null,
                      }).unwrap(),
                    'Protected restriction updated.'
                  )
                }
              >
                Protect
              </LoadingButton>
              {!guardian.guardian.userId && guardian.hasPortalAccess ? (
                <>
                  <TextField
                    size="small"
                    fullWidth
                    label="Existing tenant user ID"
                    value={accountUserId}
                    onChange={(event) => setAccountUserId(event.target.value)}
                  />
                  <LoadingButton
                    startIcon={<Link />}
                    loading={linkState.isLoading}
                    disabled={!accountUserId.trim()}
                    onClick={() =>
                      run(
                        () =>
                          linkAccount({
                            leadId,
                            personId: guardian.guardianPersonId,
                            userId: accountUserId,
                          }).unwrap(),
                        'Guardian account linked.'
                      )
                    }
                  >
                    Link account
                  </LoadingButton>
                </>
              ) : null}
            </Stack>
            {guardian.protectedRestriction ? (
              <Alert severity="warning">{guardian.protectedRestriction}</Alert>
            ) : null}
          </Stack>
        ))}
        <Divider />
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
          <TextField
            size="small"
            fullWidth
            label="Identity readiness override reason"
            value={overrideReason}
            onChange={(event) => setOverrideReason(event.target.value)}
          />
          <LoadingButton
            color="warning"
            variant="outlined"
            startIcon={<Gavel />}
            loading={overrideState.isLoading}
            disabled={!overrideReason.trim()}
            onClick={() =>
              run(
                () => overrideReadiness({ leadId, reason: overrideReason }).unwrap(),
                'Identity readiness override recorded.'
              )
            }
          >
            Override readiness
          </LoadingButton>
        </Stack>
      </Stack>
    </Box>
  );
}
