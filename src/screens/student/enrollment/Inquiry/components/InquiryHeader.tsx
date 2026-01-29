import React from 'react';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface InquiryHeaderProps {
  isAdding: boolean;
  onAddClick: () => void;
  onBackClick: () => void;
}

/**
 * Purpose:
 * Renders the header section of the Inquiry screen, including breadcrumbs and the main action button.
 *
 * Performance Notes:
 * - Memoized component to prevent unnecessary re-renders when parent state changes but props don't.
 *
 * Architectural Notes:
 * - Pure UI component.
 */
export const InquiryHeader = React.memo(
  ({ isAdding, onAddClick, onBackClick }: InquiryHeaderProps) => (
    <CustomBreadcrumbs
      heading="Inquiry"
      description="Streamlined management of admission related inquiries from the students and parents."
      links={[
        { name: 'Student', href: '/student/dashboard/' },
        { name: 'Student Enrollment', href: '/student/dashboard/' },
        { name: 'Inquiry' },
      ]}
      isBack={isAdding}
      onBack={onBackClick}
      action={
        !isAdding && (
          <Button
            size="small"
            startIcon={<Add />}
            variant="contained"
            onClick={onAddClick}
            sx={{ px: '32px' }}
          >
            Add Inquiry
          </Button>
        )
      }
    />
  )
);

InquiryHeader.displayName = 'InquiryHeader';
