'use client';

import type { BoxProps } from '@mui/material/Box';

import { Box } from '@mui/material';
import { useForkRef } from '@mui/material/utils';
import { useRef, useEffect, useContext, forwardRef, createContext } from 'react';

const FieldSpacingContext = createContext(false);
const controlSelector =
  '.MuiFormControl-root:has(> .MuiInputBase-root, > .MuiPickersInputBase-root)';

/** Reserve the same feedback space for every input, including inputs without a message. */
export const FormFieldSpacing = forwardRef<HTMLElement, BoxProps>(
  ({ children, sx, ...props }, forwardedRef) => {
    const inherited = useContext(FieldSpacingContext);
    const rootRef = useRef<HTMLElement>(null);
    const ref = useForkRef(rootRef, forwardedRef);

    useEffect(() => {
      const root = rootRef.current;
      if (inherited || !root) return undefined;

      const measure = () => {
        const heights = Array.from(root.querySelectorAll<HTMLElement>('.MuiFormHelperText-root'))
          .filter(
            (helper) =>
              helper.parentElement?.hasAttribute('data-form-field-control') ||
              Array.from(helper.parentElement?.children ?? []).some((child) =>
                child.matches('.MuiInputBase-root, .MuiPickersInputBase-root')
              )
          )
          .map((helper) => helper.getBoundingClientRect().height);
        // Helpers keep their natural height. Only the shared reservation changes, avoiding
        // measurement feedback loops and keeping long/localized errors visible at narrow widths.
        const height = `${Math.ceil(Math.max(0, ...heights))}px`;
        if (root.style.getPropertyValue('--form-feedback-content-height') !== height) {
          root.style.setProperty('--form-feedback-content-height', height);
        }
      };
      const resize =
        typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
      const observeHelpers = () => {
        resize?.disconnect();
        resize?.observe(root);
        root
          .querySelectorAll('.MuiFormHelperText-root')
          .forEach((helper) => resize?.observe(helper));
        measure();
      };
      const mutations = new MutationObserver(observeHelpers);
      mutations.observe(root, { childList: true, subtree: true, characterData: true });
      observeHelpers();
      return () => {
        mutations.disconnect();
        resize?.disconnect();
      };
    }, [inherited]);

    return (
      <FieldSpacingContext.Provider value>
        <Box
          ref={ref}
          {...props}
          sx={[
            !inherited &&
              ((theme) => ({
                minWidth: 0,
                [`& ${controlSelector}, & [data-form-field-control]`]: {
                  position: 'relative',
                  minWidth: 0,
                  // The owning field grid already supplies a 16px gap. Include
                  // feedback in one compact 28px gap instead of stacking both.
                  mb: `max(${theme.spacing(1.5)}, calc(var(--form-feedback-content-height, 0px) - ${theme.spacing(0.75)}))`,
                  '& > .MuiInputBase-sizeSmall:not(.MuiInputBase-multiline), & > .MuiPickersInputBase-inputSizeSmall':
                    {
                      minHeight: theme.spacing(5),
                    },
                  '& > .MuiFormHelperText-root': {
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    m: 0,
                    pt: 0,
                    overflowWrap: 'anywhere',
                  },
                },
              })),
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {children}
        </Box>
      </FieldSpacingContext.Provider>
    );
    // Preserve Box's polymorphic component/ref API (including component="form").
  }
) as typeof Box;
