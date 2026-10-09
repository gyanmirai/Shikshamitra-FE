import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'framer-motion';

import PermissionNode from './permission-node';

import type { PermissionNodeProps, PermissionNavigationNode } from './permission-node-types';

export default function PermissionNodeChildren({ props, expanded, children }: {
  props: PermissionNodeProps;
  expanded: boolean;
  children: PermissionNavigationNode[];
}) {
  const { depth = 0 } = props;
  return (
    <AnimatePresence>
      {children.length > 0 && expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
          <Box sx={{ mt: 1, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 0, bottom: 20, left: depth * 3 + 12, width: 2, bgcolor: 'divider', zIndex: 0 }} />
            {children.map((child) => <PermissionNode {...props} key={child.title} node={child} depth={depth + 1} />)}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
