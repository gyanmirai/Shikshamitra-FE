/**
 * Sentinel value for "show all" dropdown options.
 * MUI Select treats value="" as "no selection" and won't display the label
 * or fire onChange reliably, so we use a non-empty sentinel instead.
 */
export const AUDIT_ALL_SENTINEL = '_all';

export const ACADEMIC_AUDIT_SUBMODULE_OPTIONS = [
  { label: 'All Modules', value: AUDIT_ALL_SENTINEL },
  { label: 'Academic Calendar', value: 'academic_calendar' },
  { label: 'Subject Creation', value: 'subject_creation' },
  { label: 'Elective Group Creation', value: 'elective_group_creation' },
  { label: 'Room Availability', value: 'room_availability' },
  { label: 'Substitution Management', value: 'substitution_management' },
  { label: 'Seating Plan', value: 'seating_plan' },
  { label: 'Result Creation', value: 'result_creation' },
];

export const ACADEMIC_AUDIT_ACTION_OPTIONS = [
  { label: 'All Actions', value: AUDIT_ALL_SENTINEL },
  { label: 'Created', value: 'created' },
  { label: 'Updated', value: 'updated' },
  { label: 'Deleted', value: 'deleted' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
  { label: 'Declared', value: 'declared' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Generated', value: 'generated' },
  { label: 'Finalized', value: 'finalized' },
  { label: 'Frozen', value: 'frozen' },
];

export const ACADEMIC_AUDIT_SOURCE_LABELS: Record<string, string> = {
  academic_calendar_audit: 'Academic Calendar Audit',
  subject_audit: 'Subject Audit',
  subject_entity: 'Subject metadata',
  elective_group_entity: 'Elective metadata',
  room_audit: 'Room audit',
  substitution_audit: 'Substitution audit',
  seating_plan_audit: 'Seating plan audit',
  exam_result_audit: 'Result audit',
};
