'use client';

import './onboarding-custom.css';
import 'driver.js/dist/driver.css';

import type { RootState } from 'src/redux/store';

import { driver } from 'driver.js';
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { onboardingSteps } from 'src/config/onboarding-config';
import { setDriverNextEnabled } from 'src/utils/driverBtnConfig';

export default function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const driverObj = useRef<any>(null);
  // Redux state selectors for current academic selections
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    // Check if onboarding is already completed
    const isCompleted = localStorage.getItem('onboarding_completed');
    if (isCompleted) return;

    // Initialize driver
    driverObj.current = driver({
      showProgress: true,
      steps: onboardingSteps,
      allowClose: false,
      disableActiveInteraction: false,
      onDestroyed: () => {
        localStorage.setItem('onboarding_completed', 'true');
        driverObj.current = null;
      },
      onHighlightStarted: (element: any) => {
        if (element?.getAttribute?.('data-onboarding') === 'academic-year') {
          // disable next button initially
          setTimeout(() => !currentYear?.name && setDriverNextEnabled(false), 50);
        }
      },
      nextBtnText: 'Next &rarr;',
      prevBtnText: '&larr; Previous',
      doneBtnText: 'Finish',
      onPopoverRender: (popover: any, opts: any) => {
        // Find the footer
        const footer = popover.wrapper.querySelector('.driver-popover-footer');
        if (footer) {
          const existingSkipBtn = footer.querySelector('.onboarding-skip-btn');
          if (!existingSkipBtn) {
            const skipBtn = document.createElement('button');
            skipBtn.innerText = 'Skip';
            skipBtn.className = 'onboarding-skip-btn';

            skipBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              // Use opts.driver for a direct reference (avoids stale ref issues)
              opts.driver.destroy();
            });

            // Insert at the beginning of the footer (left side)
            footer.insertBefore(skipBtn, footer.firstChild);
          }
        }

        // Handle Next button state for specific step
        if (popover.node?.getAttribute?.('data-onboarding') === 'academic-year') {
          setTimeout(() => !currentYear?.name && setDriverNextEnabled(false), 50);
        }
      },
    });

    // Start driver with a slight delay to ensure layout is stable
    const startTimer = setTimeout(() => {
      driverObj.current?.drive();
      // Dispatch resize event to force driver.js to recalculate positions
      window.dispatchEvent(new Event('resize'));
    }, 500);

    // eslint-disable-next-line consistent-return
    return () => {
      clearTimeout(startTimer);
      if (driverObj.current) {
        driverObj.current.destroy();
        driverObj.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to manage 'Next' button state based on academic year selection

  return <>{children}</>;
}
