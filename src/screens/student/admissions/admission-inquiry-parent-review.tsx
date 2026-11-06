import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Stack, Avatar, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { canLinkAdmissionInquiryFamily } from './admission-inquiry-model';
import { inquiryContactMatchText } from './admission-inquiry-parent-review-model';

import type {
  InquiryFamilyReview,
  InquiryParentOption,
} from './admission-inquiry-parent-review-model';

type Props = {
  families: InquiryFamilyReview[];
  selected?: InquiryParentOption;
  onSelect: (option: InquiryParentOption) => void;
  relationship: string;
  onRelationshipChange: (value: string) => void;
  relationshipError?: string;
  disabled: boolean;
  enteredMobile?: string;
};

/** Shared create/edit review: select the adult; children are always informational. */
export function AdmissionInquiryParentReview({
  families,
  selected,
  onSelect,
  relationship,
  onRelationshipChange,
  relationshipError,
  disabled,
  enteredMobile,
}: Props) {
  const options = families.flatMap((family) => family.parents);
  const family = families.find((item) => item.familyId === selected?.match.familyId);
  const parent = selected?.parent;
  const role =
    parent?.relationship === 'father'
      ? 'Father'
      : parent?.relationship === 'mother'
        ? 'Mother'
        : 'Parent';
  const normalize = (value: string) => value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {options.length > 1 && (
        <ShakingTextField>
          <CustomSelect
            name="inquirySavedParent"
            label="Parent"
            required
            fullWidth
            size="small"
            value={selected?.key ?? ''}
            disabled={disabled}
            options={options.map((option) => ({
              value: option.key,
              label: `${option.parent.relationship === 'father' ? 'Father' : option.parent.relationship === 'mother' ? 'Mother' : 'Parent'} · ${option.parent.name}${families.length > 1 ? ` · ${option.match.applicantName}` : ''}`,
            }))}
            onChange={(value) => {
              const option = options.find((item) => item.key === String(value));
              if (option) onSelect(option);
            }}
          />
        </ShakingTextField>
      )}
      {parent && (
        <Stack
          direction="row"
          spacing={2}
          alignItems="flex-start"
          sx={{
            p: 2,
            bgcolor: 'background.neutral',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            minWidth: 0,
          }}
        >
          <Avatar
            variant="rounded"
            aria-hidden="true"
            sx={(theme) => ({
              width: 48,
              height: 48,
              flexShrink: 0,
              bgcolor: alpha(theme.palette.primary.main, 0.16),
              color: 'primary.dark',
              ...theme.applyStyles('dark', { color: 'primary.light' }),
            })}
          >
            {parent.name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => Array.from(part)[0])
              .join('')
              .toUpperCase()}
          </Avatar>
          <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                {parent.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {role}
              </Typography>
            </Stack>
            {[
              { value: parent.mobile, icon: 'mdi:phone-outline' },
              { value: parent.email, icon: GlobalIcons.email },
            ]
              .filter((contact) => contact.value)
              .map((contact) => (
                <Stack key={contact.icon} direction="row" spacing={1} alignItems="flex-start">
                  <Iconify
                    icon={contact.icon}
                    width={18}
                    aria-hidden="true"
                    sx={{ color: 'text.secondary', flexShrink: 0, mt: 0.25 }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                    {contact.value}
                  </Typography>
                </Stack>
              ))}
          </Stack>
        </Stack>
      )}
      {parent && !parent.relationship && (
        <ShakingTextField error={Boolean(relationshipError)}>
          <CustomSelect
            name="savedParentRelationship"
            label="Relationship to Student"
            required
            fullWidth
            size="small"
            value={relationship}
            disabled={disabled}
            options={[
              { value: 'father', label: 'Father' },
              { value: 'mother', label: 'Mother' },
            ]}
            onChange={(value) => onRelationshipChange(String(value))}
            error={Boolean(relationshipError)}
            helperText={relationshipError}
          />
        </ShakingTextField>
      )}
      {family && (
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2">Children in this family</Typography>
            <Label aria-label={`${family.children.length} children`}>
              {family.children.length}
            </Label>
          </Stack>
          <Box
            component="ul"
            role="list"
            aria-label="Children in this family"
            sx={{ m: 0, p: 0, listStyle: 'none' }}
          >
            {family.children.map((child) => (
              <Box
                component="li"
                role="listitem"
                key={child.applicantId}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  py: 1.25,
                  '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
                }}
              >
                <Iconify
                  icon={GlobalIcons.studentProfile}
                  width={20}
                  aria-hidden="true"
                  sx={{ color: 'text.secondary', flexShrink: 0 }}
                />
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
                >
                  {child.applicantName}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      )}
      {parent?.mobile && enteredMobile && normalize(parent.mobile) !== normalize(enteredMobile) && (
        <Typography variant="body2" color="warning.main">
          The saved mobile is different. Check this is the correct parent before adding a sibling.
        </Typography>
      )}
      {!options.length && (
        <Typography variant="body2" color="text.secondary">
          No saved Father or Mother is available to link. Check and edit the parent contact details.
        </Typography>
      )}
    </Stack>
  );
}

/** Presentation only: preserve the existing contact-match rules and explanatory copy. */
export function AdmissionInquiryContactMatch({
  matches,
  phone,
  email,
}: {
  matches: DuplicateMatch[];
  phone: string;
  email?: string;
}) {
  const matched = matches.some((match) => canLinkAdmissionInquiryFamily(match, phone, email));
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Iconify
        icon={matched ? GlobalIcons.tick : GlobalIcons.info}
        width={20}
        aria-hidden="true"
        sx={{ color: matched ? 'success.main' : 'text.secondary', flexShrink: 0 }}
      />
      <Typography variant="body2" color="text.secondary">
        {inquiryContactMatchText(matches, phone, email)}
      </Typography>
    </Stack>
  );
}
