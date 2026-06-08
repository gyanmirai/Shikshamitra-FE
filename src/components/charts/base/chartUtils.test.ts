import { it, expect, describe } from 'vitest';

import { donutCenterTitle, premiumTooltipFormatter } from './chartUtils';

describe('chartUtils double quotes escaping', () => {
  const mockTheme = {
    typography: {
      fontFamily: '"Public Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    },
    palette: {
      text: {
        primary: '#000000',
        secondary: '#666666',
        disabled: '#999999',
      },
      divider: '#eeeeee',
      background: {
        paper: '#ffffff',
      },
      primary: {
        main: '#00bcd4',
        dark: '#0097a7',
        light: '#b2ebf2',
      },
      success: {
        main: '#4caf50',
        dark: '#388e3c',
      },
      warning: {
        main: '#ff9800',
        dark: '#f57c00',
      },
      info: {
        main: '#2196f3',
        dark: '#1976d2',
      },
      error: {
        main: '#f44336',
      },
      action: {
        hover: 'rgba(0,0,0,0.04)',
      },
      grey: {
        '500Channel': '128 128 128',
      },
    },
  } as any;

  it('donutCenterTitle replaces double quotes in fontFamily with single quotes', () => {
    const html = donutCenterTitle('Total', 100, mockTheme);
    // Verify that the output does not contain font-family:"Public Sans"
    expect(html).not.toContain('font-family:"Public Sans"');
    // Verify that it contains font-family:'Public Sans'
    expect(html).toContain("font-family:'Public Sans'");
  });

  it('premiumTooltipFormatter replaces double quotes in fontFamily with single quotes', () => {
    const formatter = premiumTooltipFormatter(mockTheme);
    const mockContext = {
      points: [
        {
          color: '#ff0000',
          y: 42,
          series: {
            name: 'Series 1',
            type: 'line',
          },
        },
      ],
    };
    const html = formatter.call(mockContext);
    expect(html).not.toContain('font-family:"Public Sans"');
    expect(html).toContain("font-family:'Public Sans'");
  });
});
