import { Link, Typography } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { libraryPaths } from 'src/constants/library-menus';

import { useReceivingAccess } from '../../receiving/useReceivingAccess';

import type { IBookCopy } from '../Components/type';

export function CopyReceivingProvenance({ copy }: { copy: IBookCopy }) {
  const { canRead } = useReceivingAccess();
  if (!copy.copyId && !copy.id) return <Typography variant="body2">Not saved</Typography>;
  if (!copy.receivingReceiptId)
    return (
      <Typography variant="body2" color="text.secondary">
        {copy.receivingReceiptId === null
          ? 'No receiving record'
          : 'Receiving provenance unavailable'}
      </Typography>
    );
  return canRead ? (
    <Link
      component={RouterLink}
      href={`${libraryPaths.receiving}/${encodeURIComponent(copy.receivingReceiptId)}`}
      aria-label={`View receiving receipt for copy ${copy.copyNo}`}
    >
      View receiving receipt
    </Link>
  ) : (
    <Typography variant="body2">Receiving record retained</Typography>
  );
}
