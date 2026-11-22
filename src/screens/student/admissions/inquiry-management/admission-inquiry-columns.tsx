import type { LabelColor } from 'src/components/label';
import type { PopoverActions } from '@mui/material/Popover';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, Typography, LinearProgress } from '@mui/material';
import { TableOverflowText } from 'src/components/customizabaleTable/components/TableOverflowText';
import { useRef, useState, useEffect } from 'react';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { inquiryHandoffBlocker } from './use-inquiry-handoff';
import { formatAdmissionReference } from '../admission-reference';
import {
  inquirySourceLabel,
  inquiryStatusLabel,
  INQUIRY_SOURCE_OPTIONS,
  INQUIRY_STATUS_OPTIONS,
  normalizeInquiryStatus,
} from './admission-inquiry-list-options';

type Options = {
  canManage: boolean;
  canMove: boolean;
  isMoving: boolean;
  movingInquiryId?: string | null;
  pipeline?: boolean;
  canOpenApplication?: boolean;
  counsellorNames: Record<string, string>;
  counsellorOptions: { label: string; value: string }[];
  offeringOptions: { label: string; value: string }[];
  onManage: (inquiry: AdmissionInquiry) => void;
  onFollowUp?: (inquiry: AdmissionInquiry) => void;
  onHistory?: (inquiry: AdmissionInquiry) => void;
  onMove: (inquiry: AdmissionInquiry) => Promise<boolean>;
};

const statusColors: Record<number, LabelColor> = {
  0: 'warning',
  1: 'primary',
  2: 'success',
  3: 'warning',
  4: 'info',
  5: 'success',
  6: 'default',
  7: 'error',
  8: 'warning',
};

export function getAdmissionInquiryActions(
  inquiry: AdmissionInquiry,
  options: Options
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];
  const reference = formatAdmissionReference(inquiry.inquiryNumber);
  if (options.pipeline)
    return [
      {
        id: 'application',
        label: `Open Application For ${inquiry.applicantName}`,
        icon: 'mdi:file-document-edit-outline',
        disabled: !inquiry.applicationId || options.canOpenApplication === false,
        tooltip:
          options.canOpenApplication === false
            ? 'You Do Not Have Permission to View Applications.'
            : !inquiry.applicationId
              ? 'The Historical Application Link Could Not Be Resolved.'
              : undefined,
        onClick: () => options.onManage(inquiry),
      },
    ];
  if (options.canManage)
    actions.push({
      id: 'edit',
      label: `Edit ${reference}`,
      icon: GlobalIcons.edit,
      disabled: options.isMoving,
      tooltip: options.isMoving ? 'Wait for the Inquiry to Move to the Next Stage.' : undefined,
      onClick: () => options.onManage(inquiry),
    });
  if (options.canManage && options.onFollowUp)
    actions.push({
      id: 'follow-up',
      label: `Follow-Up ${reference}`,
      icon: GlobalIcons.notebook,
      disabled:
        options.isMoving ||
        Boolean(inquiry.isTransferred || inquiry.applicationId || inquiry.isDuplicate),
      tooltip:
        inquiry.isTransferred || inquiry.applicationId
          ? 'Continue This Application From Pipeline.'
          : inquiry.isDuplicate
            ? 'Continue the Original Inquiry.'
            : undefined,
      onClick: () => options.onFollowUp?.(inquiry),
    });
  if (options.canMove)
    actions.push({
      id: 'move',
      label: 'Start Application',
      icon: 'mdi:arrow-right-circle-outline',
      disabled: options.isMoving || Boolean(inquiryHandoffBlocker(inquiry)),
      loading: options.isMoving && options.movingInquiryId === inquiry.id,
      closeOnSuccess: true,
      tooltip: options.isMoving
        ? options.movingInquiryId === inquiry.id
          ? 'Starting Application…'
          : 'Wait for the current application to finish starting.'
        : inquiryHandoffBlocker(inquiry),
      onClick: () => options.onMove(inquiry),
    });
  if (options.onHistory)
    actions.push({
      id: 'history',
      label: 'Handling History',
      icon: 'mdi:history',
      disabled: options.isMoving,
      onClick: () => options.onHistory?.(inquiry),
    });
  return actions;
}

function InquiryRowActions({ inquiry, options }: { inquiry: AdmissionInquiry; options: Options }) {
  const anchor = useRef<HTMLButtonElement | null>(null);
  const popoverAction = useRef<PopoverActions>(null);
  const [paper, setPaper] = useState<HTMLDivElement | null>(null);
  const [opensAbove, setOpensAbove] = useState(false);
  const moving = options.isMoving && options.movingInquiryId === inquiry.id;

  useEffect(() => {
    if (!paper) return undefined;
    // Icons and fonts can settle after the opening transition. Keep the arrow
    // attached to the trigger when that changes the menu's measured width.
    const observer = new ResizeObserver(() => popoverAction.current?.updatePosition());
    observer.observe(paper);
    return () => observer.disconnect();
  }, [paper]);

  return (
    <Stack sx={{ position: 'relative' }}>
      <AdaptiveThreeDotsActions
        directActionLimit={2}
        collapseOnOverflow={false}
        disablePopoverClose={moving}
        moreLabel={`Actions For ${inquiry.applicantName}`}
        placement={opensAbove ? 'bottom-right' : 'top-right'}
        popoverAction={popoverAction}
        onClickThreeDots={(event) => {
          anchor.current = event.currentTarget;
          setOpensAbove(false);
        }}
        popoverSlotProps={{
          paper: { ref: setPaper, sx: { mt: opensAbove ? -1 : 1 } },
          transition: {
            onEntering: (node: HTMLElement) => {
              const trigger = anchor.current;
              const viewport = trigger?.ownerDocument.defaultView;
              if (!trigger || !viewport) return;
              const bounds = trigger.getBoundingClientRect();
              const below = viewport.innerHeight - bounds.bottom;
              const gap =
                Math.abs(Number.parseFloat(viewport.getComputedStyle(node).marginTop)) || 0;
              // Include MUI Popover's standard 16px viewport gutter. Measure the real menu,
              // so disabled entries and theme sizing do not leave the last row covered.
              setOpensAbove(below < node.offsetHeight + gap + 16 && bounds.top > below);
            },
          },
        }}
        sx={{
          gap: 0.5,
          justifyContent: 'flex-start',
          '& .MuiIconButton-root': {
            width: { xs: 44, sm: 30 },
            height: { xs: 44, sm: 30 },
          },
        }}
        actions={getAdmissionInquiryActions(inquiry, options)}
      />
      {moving && (
        <LinearProgress
          aria-label={`Starting Application for ${inquiry.applicantName}`}
          sx={{ position: 'absolute', inset: 'auto 0 0', height: 2, pointerEvents: 'none' }}
        />
      )}
    </Stack>
  );
}

export function buildAdmissionInquiryColumns(options: Options): IColumn[] {
  return [
    {
      id: 'inquiryNumber',
      label: 'Inquiry',
      minWidth: 150,
      filterType: 'string',
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      render: (value) => formatAdmissionReference(String(value)),
    },
    {
      id: 'applicantName',
      label: 'Student Name',
      minWidth: 220,
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      render: (value, row) => String(value),
    },
    {
      id: 'standardName',
      label: 'Class',
      minWidth: 190,
      filterType: 'string',
      filterOperators: ['contains', 'equals', 'startsWith', 'endsWith'],
      render: (_value, row) => (row as AdmissionInquiry).standardName || '—',
    },
    {
      id: 'normalizedPhone',
      label: 'Phone',
      minWidth: 140,
      filterType: 'string',
      render: (value) => (value ? String(value) : '—'),
    },
    {
      id: 'source',
      label: 'Source',
      minWidth: 130,
      filterType: 'enum',
      enumOptions: INQUIRY_SOURCE_OPTIONS,
      render: (value, row) => {
        const inquiry = row as AdmissionInquiry;
        return (
          <Stack spacing={0.25}>
            <Typography variant="body2">{inquirySourceLabel(value)}</Typography>
            {inquiry.sourceDetail && (
              <TableOverflowText variant="caption" color="text.secondary">
                {inquiry.sourceDetail}
              </TableOverflowText>
            )}
          </Stack>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      stickyOnMobile: false,
      minWidth: 140,
      filterType: 'enum',
      enumOptions: INQUIRY_STATUS_OPTIONS,
      sticky: true,
      stickyPosition: 'right',
      render: (value) => (
        <Label color={statusColors[normalizeInquiryStatus(value)]}>
          {inquiryStatusLabel(value)}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 172,
      minWidth: 172,
      maxWidth: 172,
      align: 'left',
      headerAlign: 'left',
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => {
        const inquiry = row as AdmissionInquiry;
        return <InquiryRowActions inquiry={inquiry} options={options} />;
      },
    },
  ];
}
