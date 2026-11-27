import type { DragEndEvent } from '@dnd-kit/core';

import { CSS } from '@dnd-kit/utilities';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomAccordion from 'src/components/custom-accordian';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import {
  useSensor,
  DndContext,
  useSensors,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export interface SelectedCollectionRow {
  id: string;
  label: string;
  term: string;
  amount: number;
  onRemove?: () => void;
  remainingAmount: number;
}

interface Props {
  fees: SelectedCollectionRow[];
  charges: SelectedCollectionRow[];
  disabled: boolean;
  onMoveFee: (from: number, to: number) => void;
  onMoveCharge: (from: number, to: number) => void;
  fixedFeeOrder?: boolean;
  emptyText?: string;
  expandedGroups: Record<'fees' | 'charges', boolean>;
  onToggleGroup: (group: 'fees' | 'charges') => void;
}

const rowLayout = {
  display: 'grid',
  gridTemplateColumns: '24px minmax(76px, 2fr) minmax(48px, 1fr) repeat(2, 88px) 28px',
  minWidth: 380,
  gap: 0.5,
  alignItems: 'center',
  px: 0.5,
} as const;

function SortableRow({
  row,
  disabled,
  order,
}: {
  row: SelectedCollectionRow;
  disabled: boolean;
  order?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: disabled || order !== undefined,
  });
  const name = row.term === '—' ? row.label : `${row.label}, ${row.term}`;
  return (
    <Box
      ref={setNodeRef}
      role="row"
      aria-label={name}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        ...rowLayout,
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
        position: 'relative',
        zIndex: isDragging ? 1 : 'auto',
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <Box role="cell">
        {order !== undefined ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {order}
          </Typography>
        ) : (
          <CustomTooltip title={`Drag to reorder ${name}`}>
            <span>
              <IconButton
                {...attributes}
                {...listeners}
                aria-label={`Reorder ${name}`}
                disabled={disabled}
                size="small"
                sx={{ p: 0.5, touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <Iconify icon="mdi:drag" width={16} />
              </IconButton>
            </span>
          </CustomTooltip>
        )}
      </Box>
      <Typography role="cell" variant="body2" sx={{ overflowWrap: 'anywhere' }}>
        {row.label}
      </Typography>
      <Typography
        role="cell"
        variant="body2"
        color="text.secondary"
        sx={{ overflowWrap: 'anywhere' }}
      >
        {row.term}
      </Typography>
      <Typography
        role="cell"
        variant="body2"
        sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
      >
        {formatNumber(row.amount, 'INR')}
      </Typography>
      <Typography
        role="cell"
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
      >
        {formatNumber(row.remainingAmount, 'INR')}
      </Typography>
      <Box role="cell">
        {row.onRemove && (
          <CustomTooltip title={`Remove ${name} from collection`}>
            <span>
              <IconButton
                aria-label={`Remove ${name} from collection`}
                disabled={disabled}
                size="small"
                onClick={row.onRemove}
                color="error"
                sx={{ p: 0.5 }}
              >
                <Iconify icon={GlobalIcons.cancel} width={18} />
              </IconButton>
            </span>
          </CustomTooltip>
        )}
      </Box>
    </Box>
  );
}

export default function SelectedCollectionItems({
  fees,
  charges,
  disabled,
  onMoveFee,
  onMoveCharge,
  fixedFeeOrder = false,
  emptyText,
  expandedGroups,
  onToggleGroup,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const group = (rows: SelectedCollectionRow[], name: string, onMove: Props['onMoveFee']) => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }: DragEndEvent) => {
        if (
          disabled ||
          (fixedFeeOrder && name === 'Selected fees') ||
          !over ||
          active.id === over.id
        )
          return;
        const from = rows.findIndex((row) => row.id === active.id);
        const to = rows.findIndex((row) => row.id === over.id);
        if (from >= 0 && to >= 0) onMove(from, to);
      }}
    >
      <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
        <Box role="rowgroup" aria-label={name}>
          {rows.map((row, index) => (
            <SortableRow
              key={row.id}
              row={row}
              disabled={disabled}
              order={fixedFeeOrder && name === 'Selected fees' ? index + 1 : undefined}
            />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
  const tableHeader = (
    <Box role="rowgroup" sx={{ bgcolor: 'background.neutral', borderRadius: 1 }}>
      <Box role="row" sx={{ ...rowLayout, py: 0.75 }}>
        {[
          fixedFeeOrder ? 'Order' : 'Reorder',
          'Fee item',
          'Term',
          'Pay now',
          'Pending',
          'Remove',
        ].map((label, index) => (
          <Typography
            key={label}
            role="columnheader"
            aria-label={label}
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, textAlign: index === 3 || index === 4 ? 'right' : 'left' }}
          >
            {index === 0 || index === 5 ? '' : label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
  return (
    <Box role="table" aria-label="Selected collection items" sx={{ minWidth: 0 }}>
      {fees.length > 0 && (
        <Paper
          component="section"
          variant="outlined"
          aria-label="Fee payments"
          sx={{ borderRadius: 1.5, overflow: 'hidden', bgcolor: 'background.paper' }}
        >
          <CustomAccordion
            title={`Payments (${fees.length}) · ${formatNumber(
              fees.reduce((total, fee) => total + fee.amount, 0),
              'INR'
            )}`}
            expanded={expandedGroups.fees}
            onChange={() => onToggleGroup('fees')}
            content={
              <Box sx={{ overflowX: 'auto' }}>
                {tableHeader}
                {group(fees, 'Selected fees', onMoveFee)}
              </Box>
            }
          />
        </Paper>
      )}
      {charges.length > 0 && (
        <Paper
          component="section"
          variant="outlined"
          aria-label="Charges"
          sx={{
            mt: fees.length > 0 ? 1.5 : 0,
            borderRadius: 1.5,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <CustomAccordion
            title={`Charges (${charges.length}) · ${formatNumber(
              charges.reduce((total, charge) => total + charge.amount, 0),
              'INR'
            )}`}
            expanded={expandedGroups.charges}
            onChange={() => onToggleGroup('charges')}
            content={
              <Box sx={{ overflowX: 'auto' }}>
                {fees.length > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', pb: 1 }}
                  >
                    Allocated after fee payments
                  </Typography>
                )}
                {tableHeader}
                {group(charges, 'Selected charges', onMoveCharge)}
              </Box>
            }
          />
        </Paper>
      )}
      {fees.length === 0 && charges.length === 0 && emptyText && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {emptyText}
        </Typography>
      )}
    </Box>
  );
}
