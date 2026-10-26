import type { ReactNode } from 'react';

import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';

const sectionIcons: Record<string, string> = {
  'Question Context': GlobalIcons.assigned,
  Question: GlobalIcons.question,
  Answer: GlobalIcons.approvedIcon,
  'Bulk Upload': GlobalIcons.upload,
  'Advanced Details': GlobalIcons.edit,
};

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function QuestionFormSection({ title, description, children, action }: Props) {
  return (
    <FormSectionCard
      title={title}
      icon={sectionIcons[title] || GlobalIcons.question}
      descriptionTooltip={description}
      action={action}
    >
      {children}
    </FormSectionCard>
  );
}
