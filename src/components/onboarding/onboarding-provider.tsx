'use client';

import './onboarding-custom.css';
import 'driver.js/dist/driver.css';

import { driver } from 'driver.js';
import { useRef, useEffect } from 'react';
import { onboardingSteps } from 'src/config/onboarding-config';

export default function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const driverObj = useRef<any>(null);

  useEffect(() => {
    // Check if onboarding is already completed
    const isCompleted = localStorage.getItem('onboarding_completed');
    if (isCompleted) return;

    // Initialize driver
    driverObj.current = driver({
      showProgress: true,
      steps: onboardingSteps,
      allowClose: true,
      onDestroyed: () => {
        localStorage.setItem('onboarding_completed', 'true');
      },
      onHighlightStarted: (element: any) => {
        if (element?.node?.getAttribute('data-onboarding') === 'academic-year') {
          // Add a small delay to ensure the popover is rendered before opening the dropdown
          setTimeout(() => {
            window.dispatchEvent(new Event('onboarding-open-academic-dropdown'));
          }, 300);
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
  }, []);

  // Effect to manage 'Next' button state based on academic year selection

  return <>{children}</>;
}
