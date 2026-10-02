'use client';

import type { RootState } from 'src/redux/store';
import type { GuardianLink, GuardianReview } from 'src/redux/student/records/student-record-documents-api';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Paper, Alert, Button, MenuItem, Checkbox, TextField, Typography, DialogActions, LinearProgress, FormControlLabel } from '@mui/material';
import { useGetRecordGuardianLinksQuery, useGetRecordGuardianReviewsQuery, useGetRecordGuardianCandidateQuery, useResolveRecordGuardianReviewMutation } from 'src/redux/student/records/student-record-documents-api';

export default function StudentRecordGuardianAccess({ studentId }: { studentId: string }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Records.GuardianAccess.View');
  const canManage = hasGrantedPermission(permissions, 'Students.Records.GuardianAccess.Manage');
  const links = useGetRecordGuardianLinksQuery(studentId, { skip: !studentId || !canView });
  const reviews = useGetRecordGuardianReviewsQuery(studentId, { skip: !studentId || !canView });
  const [selected, setSelected] = useState<GuardianReview | null>(null);
  if (!canView) return <Alert severity="info">Guardian portal access is available to staff with access review permission.</Alert>;
  return <Stack spacing={1.5}>
    <Typography variant="h6">Guardian portal access</Typography>
    {(links.isFetching || reviews.isFetching) && <LinearProgress aria-label="Loading guardian access" />}
    {(links.isError || reviews.isError) && <Alert severity="error" action={<Button onClick={() => { links.refetch(); reviews.refetch(); }}>Retry</Button>}>Guardian access could not be loaded.</Alert>}
    {links.currentData?.length === 0 && <Alert severity="info">No guardian currently has portal access to this student.</Alert>}
    {(links.currentData ?? []).map(link => <Paper key={link.linkId} variant="outlined" sx={{ p: 1.5 }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between"><Typography>{link.relationship} · {link.email}</Typography><Label color={link.isActive && link.emailConfirmed ? 'success' : 'warning'}>{link.emailConfirmed ? 'Verified account' : 'Awaiting owner verification'}</Label></Stack></Paper>)}
    {(reviews.currentData ?? []).map(review => <Paper key={review.id} variant="outlined" sx={{ p: 1.5 }}><Stack spacing={1}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle2">Guardian change · {fDate(review.creationTime)}</Typography><Label color={review.status === 'Completed' ? 'success' : 'warning'}>{review.status}</Label></Stack>{review.status === 'Pending' && <Typography variant="body2">{review.onApprovedChangeMode === 'SuspendUntilReview' ? 'Previous access was suspended under the school rule. Verify the guardian before restoring or replacing access.' : 'Previous access remains under the school rule. Review and revoke or confirm it.'}</Typography>}{canManage && review.status === 'Pending' && <Button variant="outlined" sx={{ alignSelf: 'flex-start' }} onClick={() => setSelected(review)}>Review guardian access</Button>}</Stack></Paper>)}
    {reviews.currentData?.length === 0 && <Typography variant="body2" color="text.secondary">No guardian access reviews have been created.</Typography>}
    {selected && <GuardianReviewForm review={selected} currentLinks={links.currentData ?? []} onClose={() => setSelected(null)} />}
  </Stack>;
}

function GuardianReviewForm({ review, currentLinks, onClose }: { review: GuardianReview; currentLinks: GuardianLink[]; onClose: () => void }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreateUser = hasGrantedPermission(permissions, 'AbpIdentity.Users.Create');
  const canLinkUser = hasGrantedPermission(permissions, 'AbpIdentity.Users.Update');
  const previous = Array.from(new Map([...review.previousLinks, ...currentLinks].map(link => [link.linkId, link])).values());
  const [failure, setFailure] = useState<string | null>(null); const [resolve, resolveState] = useResolveRecordGuardianReviewMutation();
  const form = useFormik({ initialValues: { reason: '', keepIds: [] as string[], verifyRetained: false, newMode: 'none', relationship: 'guardian' as 'father' | 'mother' | 'guardian', email: '', verifyNew: false }, validationSchema: Yup.object({ reason: Yup.string().trim().min(5).max(2000).required('Enter a review reason.'), email: Yup.string().when('newMode', { is: (mode: string) => mode !== 'none', then: schema => schema.email('Enter a valid email.').required('Enter the guardian email.') }) }), onSubmit: async values => {
    setFailure(null);
    if ((values.keepIds.length && !values.verifyRetained) || (values.newMode !== 'none' && !values.verifyNew)) { setFailure('Confirm that you verified the guardian identity.'); return; }
    if (values.newMode === 'existing' && !candidate.currentData) { setFailure('No verified parent account matches the saved family details for this relationship.'); return; }
    try {
      await resolve({ reviewId: review.id, concurrencyStamp: review.concurrencyStamp, reason: values.reason.trim(), keepLinkIds: values.keepIds,
        revokeLinkIds: previous.filter(link => !values.keepIds.includes(link.linkId)).map(link => link.linkId), confirmRetainedGuardiansVerified: values.verifyRetained,
        newGuardian: values.newMode === 'none' ? undefined : { relationship: values.relationship, email: values.email.trim(), confirmIdentityVerified: values.verifyNew, existingUserId: values.newMode === 'existing' ? candidate.currentData?.userId : undefined } }).unwrap();
      shikshaMitraToast.success({ message: 'Guardian access reviewed. Other students in the household keep their existing access.' }); onClose();
    } catch { setFailure('Access could not be updated. Verify that the email and relationship match the approved family profile, and reload if the review changed.'); }
  } });
  const candidate = useGetRecordGuardianCandidateQuery({ studentId: review.studentId, relationship: form.values.relationship }, { skip: form.values.newMode !== 'existing' || !canLinkUser });
  return <CustomDialog open handleClose={onClose} title="Review guardian portal access" maxWidth="md" onSubmit={event => { event.preventDefault(); form.submitForm(); }} hasUnsavedChanges={form.dirty} disableClose={resolveState.isLoading}><DialogScrollContent><Stack spacing={2}>
    <Alert severity="info">Verify the person against the approved family details. Changes apply only to this student&apos;s portal links.</Alert>
    {previous.map(link => <Paper key={link.linkId} variant="outlined" sx={{ p: 1.5 }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}><Box sx={{ flex: 1 }}><Typography>{link.relationship} · {link.email}</Typography><Typography variant="caption">{currentLinks.some(current => current.linkId === link.linkId) ? 'Current access' : 'Suspended previous access'}</Typography></Box><TextField select label="Decision" size="small" value={form.values.keepIds.includes(link.linkId) ? 'keep' : 'revoke'} disabled={resolveState.isLoading || form.values.newMode !== 'none'} onChange={event => form.setFieldValue('keepIds', event.target.value === 'keep' ? [...form.values.keepIds, link.linkId] : form.values.keepIds.filter(id => id !== link.linkId))}><MenuItem value="revoke">Revoke access</MenuItem><MenuItem value="keep">Keep / restore verified guardian</MenuItem></TextField></Stack></Paper>)}
    {form.values.keepIds.length > 0 && <FormControlLabel label="I verified retained guardians against the approved family details." control={<Checkbox checked={form.values.verifyRetained} onChange={(_event, checked) => form.setFieldValue('verifyRetained', checked)} />} />}
    <TextField select label="Replacement guardian access" value={form.values.newMode} disabled={resolveState.isLoading || form.values.keepIds.length > 0} onChange={event => { form.setFieldValue('newMode', event.target.value); form.setFieldValue('email', ''); }}><MenuItem value="none">No replacement account</MenuItem><MenuItem value="new" disabled={!canCreateUser}>Create new guardian account</MenuItem><MenuItem value="existing" disabled={!canLinkUser}>Link verified existing parent account</MenuItem></TextField>
    {form.values.newMode !== 'none' && <><TextField select label="Relationship" value={form.values.relationship} onChange={form.handleChange} name="relationship">{(['father', 'mother', 'guardian'] as const).map(relationship => <MenuItem key={relationship} value={relationship}>{relationship}</MenuItem>)}</TextField><TextField label="Email in approved family profile" name="email" value={form.values.email} onChange={form.handleChange} onBlur={form.handleBlur} error={!!form.touched.email && !!form.errors.email} helperText={form.touched.email && form.errors.email} />{form.values.newMode === 'existing' && (candidate.isFetching ? <LinearProgress aria-label="Finding verified guardian account" /> : candidate.currentData ? <Alert severity="info">Verified parent account: {candidate.currentData.email}. Confirm this account belongs to the selected guardian.</Alert> : <Alert severity="warning">No verified parent account matches this relationship&apos;s saved email.</Alert>)}<FormControlLabel label="I verified this person's identity, relationship, and account ownership." control={<Checkbox checked={form.values.verifyNew} onChange={(_event, checked) => form.setFieldValue('verifyNew', checked)} />} />{form.values.newMode === 'new' && <Typography variant="body2">The guardian completes their own email verification and password setup through the existing account flow.</Typography>}</>}
    <TextField label="Review reason" name="reason" required multiline minRows={2} value={form.values.reason} onChange={form.handleChange} onBlur={form.handleBlur} error={!!form.touched.reason && !!form.errors.reason} helperText={form.touched.reason && form.errors.reason} />{failure && <Alert severity="error">{failure}</Alert>}
  </Stack></DialogScrollContent><DialogActions><Button disabled={resolveState.isLoading} onClick={onClose}>Cancel</Button><Button variant="contained" type="submit" disabled={resolveState.isLoading}>Save access review</Button></DialogActions></CustomDialog>;
}
