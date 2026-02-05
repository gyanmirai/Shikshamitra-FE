import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  notificationTemplateApi,
  useGetNotificationTemplatesQuery,
  useDeleteNotificationTemplateMutation,
} from 'src/redux/communication/notification/notificationTemplateApi';

import type { INotificationTemplate } from '../types';

export const useNotificationTemplateActions = () => {
  // Fetch Templates
  const {
    data: templateData,
    isLoading: isTemplateLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetNotificationTemplatesQuery,
  });

  // Delete Mutation
  const [deleteTemplateMutation, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteNotificationTemplateMutation,
  });

  const { confirmWithUndo } = useConfirmWithUndo();

  const handleDelete = (
    deleteTemplate: INotificationTemplate | null,
    setDeleteTemplate: (val: INotificationTemplate | null) => void,
    confirmDialog: any
  ) => {
    confirmWithUndo({
      item: deleteTemplate,
      onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
        dispatchFn(
          notificationTemplateApi.util.updateQueryData(
            // @ts-ignore - The API definition might expect arguments we aren't passing or the types are loose in the original file.
            // Keeping consistent with original usage: 'getNotificationTemplates' with undefined args.
            'getNotificationTemplates',
            undefined,
            (draft: any) => {
              const index = draft.items?.findIndex((b: any) => b.id === deleteTemplate?.id);
              setDeleteIndex(index);
              if (index !== -1) {
                draft.items.splice(index, 1);
              }
            }
          )
        ),
      onUndoRestore: (dispatchFn, index) => refetch(),
      onCommit: () => deleteTemplateMutation(deleteTemplate?.id || ''),
    });
    confirmDialog.onFalse();
    setDeleteTemplate(null);
  };

  return {
    templateData,
    isTemplateLoading,
    isDeleteLoading,
    handleDelete,
  };
};
