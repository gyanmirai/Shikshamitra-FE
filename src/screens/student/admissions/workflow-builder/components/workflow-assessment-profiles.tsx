import type {
  AdmissionAssessmentPolicy,
  AdmissionAssessmentClassProfile,
} from 'src/redux/student/admissions/admission-assessment-policy';

import { uuidv4 } from 'src/utils/uuidv4';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Button, Skeleton, Typography } from '@mui/material';
import { useGetAdmissionAssessmentCatalogQuery } from 'src/redux/student/admissions/admission-assessment-catalog-api';

import { WorkflowAssessmentClassProfile } from './workflow-assessment-class-profile';

export function WorkflowAssessmentProfiles({
  policy,
  disabled,
  showErrors,
  onChange,
}: {
  policy: AdmissionAssessmentPolicy;
  disabled: boolean;
  showErrors: boolean;
  onChange: (changes: Partial<AdmissionAssessmentPolicy>) => void;
}) {
  const query = useGetAdmissionAssessmentCatalogQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const catalog = query.currentData ?? { classes: [], subjects: [] };
  const [catalogSettled, setCatalogSettled] = useState(Boolean(query.currentData) || query.isError);
  useEffect(() => {
    if (query.currentData || query.isError) setCatalogSettled(true);
  }, [query.currentData, query.isError]);
  const initialLoading = !catalogSettled && !query.currentData && !query.isError;
  const profiles = policy.classProfiles ?? [];
  const [newProfileId, setNewProfileId] = useState<string>();
  const add = () => {
    const id = uuidv4();
    const profile: AdmissionAssessmentClassProfile = {
      id,
      name: 'Class profile',
      boardId: '',
      mediumId: '',
      standardIds: [],
      passRule: 'overall',
      passingMarks: policy.passingMarks,
      subjects: [],
    };
    setNewProfileId(id);
    onChange({ classProfiles: [...profiles, profile] });
  };
  return (
    <FormSectionCard
      icon="mdi:account-group-outline"
      title="Class Assessment Profiles"
      descriptionTooltip="Configure One Combined Exam for Each Group of Classes. A Class Can Belong to One Profile. Every Configured Subject Needs Marks Before a Result Is Submitted. Exam Dates, Rooms, Attendance and Bookings Remain in Assessments."
      action={
        <Button
          aria-label="Add Class Profile"
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          disabled={disabled || query.isFetching || query.isError || catalog.classes.length === 0}
          onClick={add}
        >
          Class Profile
        </Button>
      }
    >
      <Stack spacing={1.5} aria-busy={query.isFetching}>
        {initialLoading && (
          <Skeleton
            aria-label="Loading Assessment Classes and Subjects"
            variant="rounded"
            height={100}
          />
        )}
        {query.isError && (
          <StudentFeedback
            notificationKey="STU-0534"
            presentation="toast"
            severity="error"
            toastAction={
              <Button size="small" disabled={query.isFetching} onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Assessment classes and subjects could not load. Your configuration is retained.
          </StudentFeedback>
        )}
        {query.currentData && !query.isError && catalog.classes.length === 0 && (
          <StudentFeedback notificationKey="STU-0535" presentation="inline" severity="info">
            No classes are available in your permitted scope. Configure classes in Institute Setup
            first.
          </StudentFeedback>
        )}
        {!initialLoading && profiles.length === 0 && (
          <Typography variant="body2" color={showErrors ? 'error.main' : 'text.secondary'}>
            Add a class profile to configure subjects and pass rules.
          </Typography>
        )}
        {!initialLoading &&
          profiles.map((profile, index) => (
            <WorkflowAssessmentClassProfile
              key={profile.id}
              profile={profile}
              profiles={profiles}
              catalog={catalog}
              catalogLoaded={Boolean(query.currentData)}
              catalogUnavailable={query.isFetching || query.isError}
              disabled={disabled}
              showErrors={showErrors}
              initiallyExpanded={profile.id === newProfileId || index === 0}
              onChange={(next) =>
                onChange({
                  classProfiles: profiles.map((item) => (item.id === profile.id ? next : item)),
                })
              }
              onRemove={() =>
                onChange({ classProfiles: profiles.filter((item) => item.id !== profile.id) })
              }
            />
          ))}
      </Stack>
    </FormSectionCard>
  );
}
