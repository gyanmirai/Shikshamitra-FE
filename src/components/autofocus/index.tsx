// AutoFocus.tsx
import React, { useRef, useEffect } from 'react';

const AutoFocus = ({ children }: { children: React.ReactElement }) => {
  // Create a ref to store the DOM element
  const ref = useRef(null);

  // Effect to focus the element on mount
  useEffect(() => {
    // Check if the ref has a current value and if it has a focus method
    if (ref.current && 'focus' in ref.current) {
      (ref.current as HTMLElement).focus();
    }
  }, []); // Empty dependency array means this effect runs once on mount

  // Clone the child element and inject the ref
  return React.cloneElement(children, { inputRef: ref });
};

export default AutoFocus;
