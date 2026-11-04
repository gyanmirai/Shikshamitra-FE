import { useId } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Tab, Alert, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';

import SubjectOverview from './subjectOverview';
import SubjectSyllabus from './subjectSyllabus';
import SubjectDocument from './subjectDocument';

import type { ISubjectDetail } from '../type';

const TABS = [
  { value: 'overview', label: 'Overview', icon: GlobalIcons.eye },
  { value: 'syllabus', label: 'Syllabus', icon: GlobalIcons.notebook },
  { value: 'documents', label: 'Documents', icon: GlobalIcons.documentIcon },
];

export function SubjectWorkspaceTabs({
  subject,
  status,
  subjectType,
  isLoading,
  hasError,
  onRetry,
}: {
  subject: ISubjectDetail | null;
  status?: number | string;
  subjectType?: number;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
}) {
  const tabs = useTabs('overview');
  const prefix = useId();

  return (
    <>
      <CustomTabs
        aria-label="Subject detail views"
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {TABS.map(({ value, label, icon }) => (
          <Tab
            key={value}
            value={value}
            label={label}
            icon={<Iconify icon={icon} width={20} />}
            iconPosition="start"
            id={`${prefix}-${value}-tab`}
            aria-controls={`${prefix}-${value}-panel`}
          />
        ))}
      </CustomTabs>
      {TABS.map(({ value }) => (
        <Box
          key={value}
          role="tabpanel"
          id={`${prefix}-${value}-panel`}
          aria-labelledby={`${prefix}-${value}-tab`}
          aria-busy={isLoading}
          hidden={tabs.value !== value}
          sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}
        >
          {tabs.value === value &&
            (hasError ? (
              <Alert
                severity="error"
                sx={{ m: 2 }}
                action={
                  <Button size="small" color="inherit" onClick={onRetry}>
                    Retry
                  </Button>
                }
              >
                Unable to load subject details. Try again.
              </Alert>
            ) : (
              <>
                {value === 'overview' && (
                  <SubjectOverview
                    subject={subject}
                    status={status}
                    subjectType={subjectType}
                    isLoading={isLoading}
                  />
                )}
                {value === 'syllabus' && <SubjectSyllabus subject={subject} />}
                {value === 'documents' && (
                  <SubjectDocument subject={subject} isLoading={isLoading} />
                )}
              </>
            ))}
        </Box>
      ))}
    </>
  );
}
