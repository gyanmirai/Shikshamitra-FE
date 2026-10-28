const MESSAGES: Record<string, string> = {
  '010001': 'The proration policy is no longer available in this school. Refresh the policy list.',
  '010002': 'Enter a proration policy name before saving.',
  '010003': 'Enter a proration policy code before saving.',
  '010004': 'Select an academic year before saving the proration policy.',
  '010006': 'A proration policy with this code already exists in this academic year. Use a different code.',
  '010007': 'Use Draft or Active when saving a proration policy. Use the archive action to archive it.',
  '010008': 'Restore the archived proration policy to Draft before editing it.',
  '010009': 'The academic year cannot be changed after creation. Clone the proration policy instead.',
  '010013': 'Review the source policy fee heads: select at least one, and ensure every selected fee head is active in the target academic year before retrying.',
  '010014': 'Review the source policy admission and withdrawal rules, including minimum days and monthly cutoff settings, before retrying.',
  '010020': 'Another Active proration policy is already the default for this academic year. Refresh and review the default policy before retrying.',
  '010025': 'Only an Active proration policy can be the default. Activate the policy before making it the default.',
  '010026': 'Set another Active proration policy as default before clearing this default or archiving it.',
  '010027': 'Some source policy fee heads are inactive or unavailable in the target academic year. Review the source policy: reactivate inactive heads or replace unavailable heads before retrying. For another academic year, create a new policy using that year’s active fee heads.',
};

/** Recovery text for older APIs that return only a generic proration business error. */
export function prorationPolicyErrorMessage(code: unknown, data?: Record<string, unknown>) {
  if (typeof code !== 'string' || !code.startsWith('Finance:ProrationPolicy:')) return undefined;
  const rule = code.slice('Finance:ProrationPolicy:'.length);
  if (rule === '010005') {
    const name = typeof data?.Name === 'string' && data.Name.trim() ? ` '${data.Name.trim()}'` : '';
    const location = data?.Location === 'Archived' ? 'Archived' : 'Current';
    return `Proration policy name${name} already exists in ${location} policies for this academic year. Use a different name${location === 'Archived' ? ' or restore the archived policy' : ''}.`;
  }
  return MESSAGES[rule];
}
