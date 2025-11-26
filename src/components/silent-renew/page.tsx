'use client';

// pages/silent-renew.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { oidcService } from 'src/utils/oidcClient';
import { SplashScreen } from 'src/components/loading-screen';

const SilentRenew = () => {
  const router = useRouter();
  useEffect(() => {
    const handleSilentRenew = async () => {
      try {
        await oidcService.signinSilentCallback(); // Complete silent token renewal
      } catch (error) {
        console.error('Silent renew failed:', error);
        // Redirect to login page on error
      }
    };

    handleSilentRenew();
  }, [router]);

  return <SplashScreen />; // Minimal page content (can be blank)
};

export default SilentRenew;
