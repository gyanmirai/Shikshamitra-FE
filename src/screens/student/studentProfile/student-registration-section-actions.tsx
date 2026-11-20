import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, IconButton } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export function StudentRegistrationSectionActions({
  name,
  editing,
  disabled,
  busy,
  canSave,
  formId,
  onEdit,
  onCancel,
  pending = false,
}: {
  name: string;
  editing: boolean;
  disabled?: boolean;
  busy?: boolean;
  canSave?: boolean;
  formId?: string;
  onEdit: () => void;
  onCancel: () => void;
  pending?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ minHeight: 40 }}
      aria-busy={pending || busy}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={editing ? 'actions' : 'edit'}
          initial={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : editing ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reducedMotion ? 0 : editing ? 10 : -10 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          {editing ? (
            <>
              <CustomTooltip title="Save">
                <span>
                  <IconButton
                    size="small"
                    type="submit"
                    form={formId}
                    aria-label={`Save ${name}`}
                    color="primary"
                    disabled={busy || !canSave}
                  >
                    <Iconify
                      icon={busy ? GlobalIcons.sectionLoading : GlobalIcons.sectionSave}
                      width={24}
                    />
                  </IconButton>
                </span>
              </CustomTooltip>
              <CustomTooltip title="Cancel">
                <span>
                  <IconButton
                    size="small"
                    type="button"
                    aria-label={`Cancel changes to ${name}`}
                    color="error"
                    disabled={busy}
                    onClick={onCancel}
                  >
                    <Iconify icon={GlobalIcons.sectionCancel} width={24} />
                  </IconButton>
                </span>
              </CustomTooltip>
            </>
          ) : (
            <CustomTooltip
              title={
                pending
                  ? 'Loading editable section…'
                  : disabled
                    ? 'Finish the current section edit first.'
                    : 'Edit'
              }
            >
              <span>
                <IconButton
                  size="small"
                  type="button"
                  aria-label={`Edit ${name}`}
                  disabled={disabled || pending}
                  onClick={onEdit}
                >
                  <Iconify icon={pending ? GlobalIcons.sectionLoading : GlobalIcons.edit} />
                </IconButton>
              </span>
            </CustomTooltip>
          )}
        </motion.div>
      </AnimatePresence>
    </Stack>
  );
}
