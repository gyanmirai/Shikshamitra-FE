import React from 'react';
export default React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  (props, ref) => <a {...props} ref={ref} />
);
