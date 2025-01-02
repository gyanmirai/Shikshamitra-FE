'use client';

import { Stack } from '@mui/material';

import { MainLayout } from 'src/layouts/main';
import HomeHero from 'src/screens/landing/home-hero';
import { HomeMinimal } from 'src/screens/landing/home-landing';

import { BackToTop, ScrollProgress, useScrollProgress } from 'src/components/animate';

function Landing() {
  const pageProgress = useScrollProgress();

  return (
    <MainLayout>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={{ position: 'fixed' }}
      />

      <BackToTop />

      <HomeHero />

      <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
        <HomeMinimal />

        {/* <HomeHugePackElements />

        <HomeForDesigner />

        <HomeHighlightFeatures />

        <HomeIntegrations />

        <HomePricing />

        <HomeTestimonials />

        <HomeFAQs />

        <HomeZoneUI />

        <HomeAdvertisement /> */}
      </Stack>
    </MainLayout>
  );
}
export default Landing;
