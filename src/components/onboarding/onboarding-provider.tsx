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
    });

    // Start driver with a slight delay to ensure layout is stable
    setTimeout(() => {
      driverObj.current.drive();
      // Dispatch resize event to force driver.js to recalculate positions
      window.dispatchEvent(new Event('resize'));
    }, 500);

    // eslint-disable-next-line consistent-return
    return () => {
      if (driverObj.current) {
        driverObj.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to manage 'Next' button state based on academic year selection

  return <>{children}</>;
}
