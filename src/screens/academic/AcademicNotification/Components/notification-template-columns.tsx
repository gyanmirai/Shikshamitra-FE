import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

export function notificationTemplateColumns(
  openTemplate: (template: AcademicNotificationTemplate) => void,
  refreshing: boolean
): IColumn[] {
  return [
    { id: 'templateName', label: 'Template', minWidth: 180, rowHeader: true, isSort: false,
      isFilter: true, filterType: 'string', filterOperators: ['contains'],
    },
    { id: 'recipient', label: 'Recipient', minWidth: 128, isSort: false, isFilter: false },
    { id: 'channelLabel', label: 'Channel', minWidth: 115, isSort: false, isFilter: false },
    { id: 'languageCode', label: 'Language', minWidth: 95, isSort: false, isFilter: false },
    { id: 'scope', label: 'Scope', minWidth: 110, isSort: false, isFilter: false },
    { id: 'revisionState', label: 'Latest version', minWidth: 135, sticky: true, stickyPosition: 'right', stickyOnMobile: false,
      isSort: false, isFilter: false, render: (state) => <Label>{String(state)}</Label>,
    },
    { id: 'actions', label: 'Actions', width: 92, sticky: true, stickyPosition: 'right',
      isSort: false, isFilter: false, excludeFromExport: true,
      render: (_, row) => (
        <AdaptiveThreeDotsActions
          directActionLimit={2}
          sx={{ justifyContent: 'flex-end' }}
          actions={[{ id: 'open', label: `Open ${row.templateName}`, icon: GlobalIcons.eye,
            disabled: refreshing, onClick: () => openTemplate(row.template) }]}
        />
      ),
    },
  ];
}
