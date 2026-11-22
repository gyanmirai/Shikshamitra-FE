import type { ICardAssignmentClass } from 'src/redux/student/records/student-icard-assignment-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetRecordIdTemplatesQuery } from 'src/redux/student/records/student-record-documents-api';
import {
  isICardAssignmentConflict,
  usePutICardAssignmentMutation,
  useDeleteICardAssignmentMutation,
} from 'src/redux/student/records/student-icard-assignment-api';

const validationSchema = Yup.object({
  templateId: Yup.string().required('Select an I-Card template.'),
});

type Props = {
  academicYearId: string;
  assignment: ICardAssignmentClass;
  remove: boolean;
  onReload: () => void;
  onClose: () => void;
};

export default function StudentICardAssignmentRule({
  academicYearId,
  assignment,
  remove,
  onReload,
  onClose,
}: Props) {
  const router = useRouter();
  const [original] = useState(assignment);
  const requestContext = { academicYearId, standardId: original.standardId };
  const changed = original.concurrencyStamp !== assignment.concurrencyStamp;
  const templates = useGetRecordIdTemplatesQuery(undefined, {
    skip: remove,
    refetchOnMountOrArgChange: true,
  });
  const templateOptions = (templates.currentData ?? []).flatMap((template) =>
    template.id ? [{ id: template.id, name: template.name }] : []
  );
  const [saveAssignment, { isLoading: saving }] = usePutICardAssignmentMutation();
  const [deleteAssignment, { isLoading: deleting }] = useDeleteICardAssignmentMutation();
  const requestLock = useRef(false);

  const showFailure = (error: unknown, fallback: string) => {
    if (isICardAssignmentConflict(error)) {
      onReload();
      shikshaMitraToast.error({
        message: 'The class assignment changed. Reopen it to review the latest template.',
      });
    } else {
      shikshaMitraToast.error({ message: fallback });
    }
  };

  const form = useFormik({
    initialValues: { templateId: original.templateId ?? '' },
    validationSchema,
    onSubmit: async ({ templateId }) => {
      if (
        requestLock.current ||
        changed ||
        templates.isError ||
        templates.isFetching ||
        !templateOptions.some((option) => option.id === templateId)
      )
        return;
      requestLock.current = true;
      try {
        await saveAssignment({
          ...requestContext,
          templateId,
          concurrencyStamp: original.concurrencyStamp ?? undefined,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Class template assigned.' });
        onClose();
      } catch (error) {
        showFailure(error, 'The class template could not be assigned. Please try again.');
      } finally {
        requestLock.current = false;
      }
    },
  });
  const submitting = saving || form.isSubmitting;
  const { requestNavigation, confirmation } = useUnsavedNavigation(!remove && form.dirty, {
    push: router.push,
    blockNavigation: submitting || deleting,
    guardContextChanges: true,
    title: 'Discard Assignment Changes?',
    description: 'Your template selection will be lost.',
    onNavigationApproved: onClose,
  });
  const requestClose = () => requestNavigation(onClose);

  if (remove) {
    return (
      <ConfirmDialog
        open
        title="Remove I-Card Assignment?"
        onClose={onClose}
        bodyBusy={deleting}
        content={
          changed
            ? 'This assignment changed. Close and reopen it to review the latest template.'
            : `${original.standardName} will need a new template before staff can generate cards here. Existing issued cards will remain available.`
        }
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            loading={deleting}
            disabled={changed || !original.concurrencyStamp}
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={async () => {
              if (requestLock.current || changed || !original.concurrencyStamp) return;
              requestLock.current = true;
              try {
                await deleteAssignment({
                  ...requestContext,
                  concurrencyStamp: original.concurrencyStamp,
                }).unwrap();
                shikshaMitraToast.success({ message: 'Class assignment removed.' });
                onClose();
              } catch (error) {
                showFailure(error, 'The class assignment could not be removed. Please try again.');
              } finally {
                requestLock.current = false;
              }
            }}
          >
            Remove assignment
          </Button>
        }
      />
    );
  }

  return (
    <>
      <CustomDialog
        open
        title={original.templateId ? 'Change Class Template' : 'Assign Class Template'}
        handleClose={requestClose}
        guardUnsavedChanges={false}
        disableClose={submitting}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            form.handleSubmit();
          },
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <Typography variant="body2">
              Choose the template for all divisions of {original.standardName}.
            </Typography>
            <CustomSelect
              label="Template"
              required
              isSearch
              options={templateOptions}
              labelKey="name"
              valueKey="id"
              value={form.values.templateId}
              onChange={(value) => form.setFieldValue('templateId', String(value))}
              onBlur={() => form.setFieldTouched('templateId')}
              isLoading={templates.isFetching && !templates.currentData}
              disabled={submitting || changed || templates.isError}
              error={Boolean(form.touched.templateId && form.errors.templateId)}
              helperText={form.touched.templateId && form.errors.templateId}
            />
            {changed && (
              <Typography variant="body2" role="status" color="text.secondary">
                This assignment changed. Close and reopen it to review the latest template.
              </Typography>
            )}
            {templates.currentData && !templates.isError && !templateOptions.length && (
              <Stack spacing={1} alignItems="flex-start">
                <Typography variant="body2" color="text.secondary">
                  Create a template in Student Records Settings to assign it to this class.
                </Typography>
                <Button
                  size="small"
                  component={RouterLink}
                  href={studentPaths.records.settingsSections.iCardTemplates}
                >
                  Open I-Card Templates
                </Button>
              </Stack>
            )}
            {templates.isError && (
              <StudentFeedback
                notificationKey="i-card-assignment-template-options"
                severity="error"
                toastAction={
                  <Button size="small" onClick={() => templates.refetch()}>
                    Retry
                  </Button>
                }
              >
                I-Card templates could not be loaded.
              </StudentFeedback>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            disabled={submitting}
            onClick={requestClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            loading={submitting}
            loadingPosition="start"
            disabled={
              changed ||
              templates.isFetching ||
              templates.isError ||
              !templateOptions.length ||
              !form.dirty
            }
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </>
  );
}
