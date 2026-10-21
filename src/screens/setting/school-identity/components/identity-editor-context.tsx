import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type IdentityEditorScope = {
  year?: string;
  board?: string;
  medium?: string;
  organization?: string;
};

export function IdentityEditorContext({ scope }: { scope?: IdentityEditorScope }) {
  return (
    <Stack spacing={0.5} sx={{ overflowWrap: 'anywhere' }}>
      <Typography variant="subtitle2">
        {scope?.organization
          ? 'Editing organization override'
          : scope
            ? 'Editing board / medium override'
            : 'Editing school defaults'}
      </Typography>
      {scope ? (
        <>
          <Typography variant="body2">
            Academic year: {scope.year || 'Unavailable'} · Board: {scope.board || 'Unavailable'} ·
            Medium: {scope.medium || 'All mediums'}
            {scope.organization && ` · Organization: ${scope.organization}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {scope.organization
              ? 'These choices apply to this organization only.'
              : scope.medium
                ? 'These choices apply to this board and medium only.'
                : 'These choices apply to this board and are inherited by its mediums unless they have their own override.'}
          </Typography>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          These choices apply across all boards and mediums unless an override is configured.
        </Typography>
      )}
    </Stack>
  );
}
