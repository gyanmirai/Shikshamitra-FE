'use client';

import React from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';

export interface IDownstreamUsageActionsProps {
  isUsedInDownstream?: boolean;
  showViewIcon?: boolean;
  showEditIcon?: boolean;
  showDeleteIcon?: boolean;
  showThreeDots?: boolean;
  placement?: 'right-top' | 'right-bottom' | 'left-top' | 'left-bottom';
  handleViewClick?: () => void;
  handleEditClick?: () => void;
  handleDeleteClick?: () => void;
}

/**
 * Wrapper component for ThreeDotsActions that adds downstream usage warning
 * Disables delete button if item is used in downstream entities
 * Shows tooltip explaining why delete is disabled
 */
export const DownstreamUsageActions: React.FC<IDownstreamUsageActionsProps> = ({
  isUsedInDownstream = false,
  showViewIcon = false,
  showEditIcon = true,
  showDeleteIcon = true,
  showThreeDots = false,
  placement = 'right-top',
  handleViewClick,
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
          <ThreeDotsActions
            showViewIcon={showViewIcon}
            showEditIcon={showEditIcon}
            showDeleteIcon={showDeleteIcon}
            disableDeleteIcon
            showThreeDots={showThreeDots}
            placement={placement}
            handleViewClick={handleViewClick}
            handleEditClick={handleEditClick}
            handleDeleteClick={handleDeleteClick}
          />
        </span>
      </CustomTooltip>
    );
  }

  return (
    <ThreeDotsActions
      showViewIcon={showViewIcon}
      showEditIcon={showEditIcon}
      showDeleteIcon={showDeleteIcon}
      showThreeDots={showThreeDots}
      placement={placement}
      handleViewClick={handleViewClick}
      handleEditClick={handleEditClick}
      handleDeleteClick={handleDeleteClick}
    />
  );
};

export default DownstreamUsageActions;
