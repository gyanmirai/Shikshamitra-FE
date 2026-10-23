'use client';

import React from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

export interface IDownstreamUsageActionsProps {
  isUsedInDownstream?: boolean;
  showEditIcon?: boolean;
  showDeleteIcon?: boolean;
  showThreeDots?: boolean;
  placement?: 'right-top' | 'right-bottom' | 'left-top' | 'left-bottom';
  handleEditClick?: () => void;
  handleDeleteClick?: () => void;
}

/**
 * Wrapper component for AdaptiveThreeDotsActions that adds downstream usage warning
 * Disables delete button if item is used in downstream entities
 * Shows tooltip explaining why delete is disabled
 */
export const DownstreamUsageActions: React.FC<IDownstreamUsageActionsProps> = ({
  isUsedInDownstream = false,
  showEditIcon = true,
  showDeleteIcon = true,
  showThreeDots = false,
  placement = 'right-top',
  handleEditClick,
  handleDeleteClick,
}) => {
  if (isUsedInDownstream && showDeleteIcon) {
    return (
      <CustomTooltip
        title="This item cannot be deleted because it is already used in other parts of the system. Please remove all references first."
        placement="top"
      >
        <span>
          <AdaptiveThreeDotsActions directActionLimit={3}
            actions={[
              ...(showEditIcon
                ? [
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: 'solar:pen-bold',
                      onClick: () => handleEditClick?.(),
                    },
                  ]
                : []),
              ...(showDeleteIcon
                ? [
                    {
                      id: 'delete',
                      label: 'Delete',
                      icon: 'solar:trash-bin-trash-bold',
                      onClick: () => handleDeleteClick?.(),
                      disabled: true,
                      color: 'error.main',
                    },
                  ]
                : []),
            ]}
            placement={placement}
          />
        </span>
      </CustomTooltip>
    );
  }

  return (
    <AdaptiveThreeDotsActions directActionLimit={3}
      actions={[
        ...(showEditIcon
          ? [
              {
                id: 'edit',
                label: 'Edit',
                icon: 'solar:pen-bold',
                onClick: () => handleEditClick?.(),
              },
            ]
          : []),
        ...(showDeleteIcon
          ? [
              {
                id: 'delete',
                label: 'Delete',
                icon: 'solar:trash-bin-trash-bold',
                onClick: () => handleDeleteClick?.(),
                color: 'error.main',
              },
            ]
          : []),
      ]}
      placement={placement}
    />
  );
};

export default DownstreamUsageActions;
