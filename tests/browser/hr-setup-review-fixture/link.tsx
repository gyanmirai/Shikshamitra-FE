import { forwardRef } from 'react';
// Preserve the link's native keyboard/accessibility behavior without a Next router in this fixture.
export default forwardRef<HTMLAnchorElement, any>((props, ref) => <a ref={ref} {...props} />);
