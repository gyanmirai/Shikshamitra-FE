import type { LibraryPolicyOptions, LibraryPolicyVersion } from 'src/redux/library/policy-types';

import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';

const labelTypographyProps = {
  sx: { fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'text.secondary' },
};
export function PolicyDetails({
  item,
  options,
}: {
  item: LibraryPolicyVersion;
  options: LibraryPolicyOptions;
}) {
  const name = (items: { id: string; name: string }[], id?: string | null) =>
    id ? items.find((option) => option.id === id)?.name || id : 'All';
  const sections = [
    {
      title: 'General Information',
      icon: GlobalIcons.documentIcon,
      help: 'Saved version identity and effective dates. Drafts do not affect circulation.',
      fields: [
        ['Policy name', item.name],
        ['Member role', item.role === 0 ? 'Student' : 'Staff'],
        ['Priority', formatNumber(item.priority)],
        ['Version', formatNumber(item.version)],
        ['Effective from', fDate(item.effectiveFrom)],
        ['Effective through', item.effectiveTo ? fDate(item.effectiveTo) : 'No end date'],
        ...(item.archivedFrom
          ? [
              ['Archived from', fDate(item.archivedFrom)],
              ['Archive reason', item.archiveReason],
            ]
          : []),
      ],
    },
    {
      title: 'Application Scope',
      icon: GlobalIcons.assigned,
      help: 'More specific matching scopes take precedence, then higher priority. The server rejects ambiguous matching policies.',
      fields: [
        ['Book category', name(options.bookCategories, item.bookCategoryId)],
        ['Library section', name(options.sections, item.sectionId)],
        ...(item.role === 0
          ? [
              ['Education stage', name(options.stages, item.educationMediumStageId)],
              ['Class', name(options.standards, item.standardId)],
            ]
          : []),
      ],
    },
    {
      title: 'Borrowing and Renewal Terms',
      icon: GlobalIcons.issueBook,
      help: 'These saved terms apply to matching new transactions after publishing. Existing loan snapshots remain unchanged.',
      fields: [
        [
          'Due date mode',
          item.terms.dueDateMode === 0 ? 'Manual school dates' : 'Automatic school dates',
        ],
        ['Concurrent loan limit', item.terms.maxBooksAtTime],
        ['Reservation limit', item.terms.reservationLimit],
        ['Renewal limit', item.terms.maxRenewals],
        ...(item.terms.dueDateMode === 0
          ? []
          : [
              ['Loan duration (days)', item.terms.loanDays],
              ['Renewal duration (days)', item.terms.renewalDays],
              ['Hold pickup window (days)', item.terms.pickupWindowDays],
              [
                'Day counting',
                item.terms.dayCountingMode === 0 ? 'Calendar days' : 'Library open days',
              ],
              ['Move closed-day due dates', item.terms.moveDueDateToNextOpenDay ? 'Yes' : 'No'],
            ]),
      ],
    },
  ];
  return (
    <>
      {sections.map((section) => (
        <FormSectionCard
          key={section.title}
          title={section.title}
          icon={section.icon}
          descriptionTooltip={section.help}
        >
          <DetailGrid>
            {section.fields.map(([label, value]) => (
              <DetailField
                key={String(label)}
                label={String(label)}
                value={value}
                labelTypographyProps={labelTypographyProps}
              />
            ))}
          </DetailGrid>
        </FormSectionCard>
      ))}
    </>
  );
}
