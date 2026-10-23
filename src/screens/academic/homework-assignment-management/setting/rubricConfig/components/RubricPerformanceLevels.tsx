import type { FormikProps } from 'formik';
import type { DragEndEvent } from '@dnd-kit/core';

import { getIn } from 'formik';
import { useRef, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';
import {
  Box,
  Stack,
  Button,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  FormHelperText,
} from '@mui/material';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  DragOverlay,
  TouchSensor,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';

import { RubricFormSection } from './RubricFormSection';
import { rubricRowNumberAt, reorderPerformanceLevels } from '../performance-level-order';

import type { RubricConfigFormValues, RubricPerformanceLevelFormValue } from '../types';

type Formik = FormikProps<RubricConfigFormValues>;
let nextLevelRowId = 0;

const fieldError = (formik: Formik, path: string) =>
  getIn(formik.touched, path) ? String(getIn(formik.errors, path) || '') : '';

function PerformanceLevelRow({
  formik,
  level,
  index,
  isRatingScale,
  onDelete,
  labelInputRef,
}: {
  formik: Formik;
  level: RubricPerformanceLevelFormValue;
  index: number;
  isRatingScale: boolean;
  onDelete: () => void;
  labelInputRef: (node: HTMLInputElement | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: level.id });
  const field = (name: keyof RubricPerformanceLevelFormValue) =>
    `performanceLevels[${index}].${name}`;
  const rowNumber = rubricRowNumberAt(index);

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '44px 36px minmax(0, 1fr) 44px',
          sm: '44px 36px repeat(2, minmax(0, 1fr)) 44px',
          lg: '44px 36px minmax(130px, 1fr) minmax(100px, 0.6fr) minmax(130px, 1fr) minmax(160px, 1.3fr) 44px',
        },
        gridTemplateAreas: {
          xs: '"handle number label delete" ". . score ." ". . student ." ". . description ."',
          sm: '"handle number label score delete" ". . student description ."',
          lg: '"handle number label score student description delete"',
        },
        alignItems: 'center',
        columnGap: 1,
        rowGap: 1,
        py: 0.75,
        opacity: isDragging ? 0.35 : 1,
        outline: isOver && !isDragging ? '2px dashed' : 'none',
        outlineColor: 'primary.main',
        outlineOffset: -2,
        borderRadius: 1,
      }}
    >
      <CustomTooltip
        title="Drag to reorder. With a keyboard, press Space, then use arrow keys."
        placement="right"
      >
        <IconButton
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${level.label || `row ${rowNumber}`}`}
          sx={{
            gridArea: 'handle',
            width: 44,
            height: 44,
            cursor: 'grab',
            touchAction: 'none',
            color: 'text.secondary',
          }}
        >
          <Iconify icon="mdi:drag-vertical" width={20} />
        </IconButton>
      </CustomTooltip>
      <Box
        component="span"
        sx={{
          gridArea: 'number',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          justifySelf: 'center',
          borderRadius: '50%',
          border: 1,
          borderColor: 'divider',
          bgcolor: 'action.selected',
          color: 'text.primary',
          typography: 'subtitle2',
        }}
      >
        {rowNumber}
      </Box>
      <ShakingTextField
        error={Boolean(fieldError(formik, field('label')))}
        sx={{ gridArea: 'label', minWidth: 0 }}
      >
        <TextField
          fullWidth
          size="small"
          required
          label="Label"
          name={field('label')}
          value={level.label}
          inputRef={labelInputRef}
          onBlur={formik.handleBlur}
          onChange={(event) => formik.setFieldValue(field('label'), event.target.value)}
          error={Boolean(fieldError(formik, field('label')))}
          helperText={fieldError(formik, field('label'))}
          sx={{ gridArea: 'label', minWidth: 0 }}
        />
      </ShakingTextField>
      <ShakingTextField
        error={Boolean(fieldError(formik, field('score')))}
        sx={{ gridArea: 'score', minWidth: 0 }}
      >
        <TextField
          fullWidth
          size="small"
          required
          label={isRatingScale ? 'Rating' : 'Score'}
          type="number"
          inputProps={{
            min: isRatingScale ? 1 : 0,
            max: isRatingScale ? 10 : 1000,
            step: isRatingScale ? 1 : 0.5,
          }}
          name={field('score')}
          value={level.score}
          onBlur={formik.handleBlur}
          onChange={(event) => formik.setFieldValue(field('score'), event.target.value)}
          error={Boolean(fieldError(formik, field('score')))}
          helperText={fieldError(formik, field('score'))}
          sx={{ gridArea: 'score', minWidth: 0 }}
        />
      </ShakingTextField>
      <ShakingTextField
        error={Boolean(fieldError(formik, field('studentLabel')))}
        sx={{ gridArea: 'student', minWidth: 0 }}
      >
        <TextField
          fullWidth
          size="small"
          required
          label="Student label"
          name={field('studentLabel')}
          value={level.studentLabel}
          onBlur={formik.handleBlur}
          onChange={(event) => formik.setFieldValue(field('studentLabel'), event.target.value)}
          error={Boolean(fieldError(formik, field('studentLabel')))}
          helperText={fieldError(formik, field('studentLabel'))}
          sx={{ gridArea: 'student', minWidth: 0 }}
        />
      </ShakingTextField>
      <TextField
        fullWidth
        size="small"
        label="Description"
        value={level.description}
        onChange={(event) => formik.setFieldValue(field('description'), event.target.value)}
        sx={{ gridArea: 'description', minWidth: 0 }}
      />
      <Tooltip title={`Delete performance level row ${rowNumber}`} arrow>
        <span style={{ gridArea: 'delete' }}>
          <IconButton
            size="small"
            color="error"
            aria-label={`Delete performance level row ${rowNumber}`}
            disabled={formik.values.performanceLevels.length <= 1}
            onClick={onDelete}
            sx={{ width: 44, height: 44, '&:hover': { bgcolor: 'transparent' } }}
          >
            <Iconify icon={GlobalIcons.delete} width={18} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

export function RubricPerformanceLevels({ formik }: { formik: Formik }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const pendingFocusId = useRef<string | null>(null);
  const levels = formik.values.performanceLevels;
  const isRatingScale = formik.values.scoringModel === RubricScoringModel.RatingScale;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const clearTouchedLevels = () =>
    formik.setTouched({ ...formik.touched, performanceLevels: [] }, false);

  const addLevel = () => {
    const id = `new-level-${nextLevelRowId}`;
    nextLevelRowId += 1;
    pendingFocusId.current = id;
    formik.setFieldValue('performanceLevels', [
      ...levels,
      { id, label: '', score: '', studentLabel: '', description: '' },
    ]);
    clearTouchedLevels();
  };

  const deleteLevel = (id: string) => {
    if (levels.length <= 1) return;
    formik.setFieldValue(
      'performanceLevels',
      levels.filter((level) => level.id !== id)
    );
    clearTouchedLevels();
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    formik.setFieldValue(
      'performanceLevels',
      reorderPerformanceLevels(levels, String(active.id), String(over.id))
    );
    clearTouchedLevels();
  };

  const activeLevel = levels.find((level) => level.id === activeId);
  const listError =
    getIn(formik.touched, 'performanceLevels') && getIn(formik.errors, 'performanceLevels');

  return (
    <RubricFormSection
      icon="solar:medal-ribbon-star-bold-duotone"
      title={isRatingScale ? 'Rating Scale' : 'Performance Levels'}
      caption={
        isRatingScale
          ? 'Give each rating a distinct whole-number value from 1 to 10 and a clear label.'
          : 'Define descriptive levels and scores (0–1000) teachers can select while evaluating.'
      }
      action={
        <Button
          size="small"
          variant="contained"
          startIcon={<Iconify icon="mdi:plus" />}
          aria-label={isRatingScale ? 'Add Rating' : 'Add Level'}
          onClick={addLevel}
        >
          {isRatingScale ? 'Rating' : 'Level'}
        </Button>
      }
    >
      {typeof listError === 'string' && <FormHelperText error>{listError}</FormHelperText>}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(String(active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              'Press Space to pick up a level. Use the arrow keys to move it. Press Space or Enter to drop, or Escape to cancel.',
          },
        }}
      >
        <SortableContext
          items={levels.map((level) => level.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={0.5}>
            {levels.map((level, index) => (
              <PerformanceLevelRow
                key={level.id}
                formik={formik}
                level={level}
                index={index}
                isRatingScale={isRatingScale}
                onDelete={() => deleteLevel(level.id)}
                labelInputRef={(node) => {
                  if (node && pendingFocusId.current === level.id) {
                    node.focus();
                    pendingFocusId.current = null;
                  }
                }}
              />
            ))}
          </Stack>
        </SortableContext>
        <DragOverlay>
          {activeLevel ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                p: 1,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                boxShadow: 'var(--shadows-8)',
              }}
            >
              <Iconify icon="mdi:drag-vertical" width={20} />
              <Typography variant="body2" fontWeight={600} noWrap>
                {activeLevel.label || 'New level'}
              </Typography>
            </Stack>
          ) : null}
        </DragOverlay>
      </DndContext>
    </RubricFormSection>
  );
}
