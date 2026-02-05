import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from 'src/redux/communication/announcement/schoolWiseAnnouncement';

import { schoolWiseValidationSchema } from '../validationSchema';
import { getSchoolWiseAnnouncementInitialValues } from '../components/getSchoolInitialValues';

import type { ISchoolWiseAnnouncement, ISchoolWiseAnnouncementFormProps } from '../type';

export const useAnnouncementForm = ({
  initialValues,
  onClose,
}: ISchoolWiseAnnouncementFormProps) => {
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);

  const [addAnnouncement, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAnnouncementMutation,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const [updateAnnouncement, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAnnouncementMutation,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const formik = useFormik({
    initialValues: getSchoolWiseAnnouncementInitialValues(initialValues),
    validationSchema: schoolWiseValidationSchema(currentYear),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payloadData = {
          title: values.title,
          description: values.description,
          audience: values.audience.map((a) => a.value),
          type: values.type?.[0]?.announcementType || '',
          importanceLevel:
            values.importance_level?.levelName === 'urgent'
              ? 2
              : values.importance_level?.levelName === 'critical'
                ? 3
                : 1,
          startDate: values.startDate ? dayjs(values.startDate).toISOString() : null,
          endDate: values.endDate ? dayjs(values.endDate).toISOString() : null,
          duration: Number(values.duration),
          durationUnit: values.durationUnit === 'days' ? 'DAY' : 'HOUR',
          documents: values.attachment ? ['string'] : [], // Mocking file upload for now as per original
          notificationPreferences: values.notification_preferences.map((pref) => {
            if (pref === 'In-App') return 'IN_APP';
            return pref.toUpperCase();
          }),
        };

        if (initialValues) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            id: (initialValues as ISchoolWiseAnnouncement).id,
            data: payloadData,
          };
          await updateAnnouncement(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.title}" Announcement updated successfully`,
          });
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            data: payloadData,
          };
          await addAnnouncement(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.title}" Announcement added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Failed to save announcement', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return {
    formik,
    isSubmitting: isAddLoading || isUpdateLoading,
    currentYear,
  };
};
