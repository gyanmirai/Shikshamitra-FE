// const localeCurrencyMap = {
//   'af-ZA': 'ZAR', // South Africa
//   'am-ET': 'ETB', // Ethiopia
//   'ar-AE': 'AED', // United Arab Emirates
//   'ar-SA': 'SAR', // Saudi Arabia
//   'ar-EG': 'EGP', // Egypt
//   'az-AZ': 'AZN', // Azerbaijan
//   'be-BY': 'BYN', // Belarus
//   'bg-BG': 'BGN', // Bulgaria
//   'bn-BD': 'BDT', // Bangladesh
//   'ca-ES': 'EUR', // Spain (Catalonia)
//   'cs-CZ': 'CZK', // Czech Republic
//   'da-DK': 'DKK', // Denmark
//   'de-DE': 'EUR', // Germany
//   'de-AT': 'EUR', // Austria
//   'de-CH': 'CHF', // Switzerland
//   'el-GR': 'EUR', // Greece
//   'en-AU': 'AUD', // Australia
//   'en-CA': 'CAD', // Canada
//   'en-GB': 'GBP', // United Kingdom
//   'en-IN': 'INR', // India
//   'en-NZ': 'NZD', // New Zealand
//   'en-US': 'USD', // United States
//   'es-AR': 'ARS', // Argentina
//   'es-CL': 'CLP', // Chile
//   'es-CO': 'COP', // Colombia
//   'es-ES': 'EUR', // Spain
//   'es-MX': 'MXN', // Mexico
//   'es-PE': 'PEN', // Peru
//   'et-EE': 'EUR', // Estonia
//   'fa-IR': 'IRR', // Iran
//   'fi-FI': 'EUR', // Finland
//   'fil-PH': 'PHP', // Philippines
//   'fr-BE': 'EUR', // Belgium
//   'fr-CA': 'CAD', // Canada (French-speaking)
//   'fr-CH': 'CHF', // Switzerland (French-speaking)
//   'fr-FR': 'EUR', // France
//   'he-IL': 'ILS', // Israel
//   'hi-IN': 'INR', // India
//   'hr-HR': 'EUR', // Croatia (from 2023 onward)
//   'hu-HU': 'HUF', // Hungary
//   'id-ID': 'IDR', // Indonesia
//   'it-CH': 'CHF', // Switzerland (Italian-speaking)
//   'it-IT': 'EUR', // Italy
//   'ja-JP': 'JPY', // Japan
//   'kk-KZ': 'KZT', // Kazakhstan
//   'ko-KR': 'KRW', // South Korea
//   'lt-LT': 'EUR', // Lithuania
//   'lv-LV': 'EUR', // Latvia
//   'mn-MN': 'MNT', // Mongolia
//   'ms-MY': 'MYR', // Malaysia
//   'nb-NO': 'NOK', // Norway
//   'nl-BE': 'EUR', // Belgium (Dutch-speaking)
//   'nl-NL': 'EUR', // Netherlands
//   'pl-PL': 'PLN', // Poland
//   'pt-BR': 'BRL', // Brazil
//   'pt-PT': 'EUR', // Portugal
//   'ro-RO': 'RON', // Romania
//   'ru-RU': 'RUB', // Russia
//   'sk-SK': 'EUR', // Slovakia
//   'sl-SI': 'EUR', // Slovenia
//   'sr-RS': 'RSD', // Serbia
//   'sv-SE': 'SEK', // Sweden
//   'th-TH': 'THB', // Thailand
//   'tr-TR': 'TRY', // Turkey
//   'uk-UA': 'UAH', // Ukraine
//   'vi-VN': 'VND', // Vietnam
//   'zh-CN': 'CNY', // China
//   'zh-HK': 'HKD', // Hong Kong
//   'zh-TW': 'TWD', // Taiwan
// };

import { roundUpAmount } from './whole-rupee-amount';

export const formatCurrency = (amount: number): string => {
  //   const locale: string = navigator.language || 'en-US';
  //   const currency: string = (localeCurrencyMap as Record<string, string>)[locale] || 'USD';

  const locale: string = 'en-IN';
  const currency: string = 'INR';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundUpAmount(amount));
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount}`;
  }
};
export const parseCurrencyToNumber = (currencyString: string): number => {
  try {
    const cleanString = currencyString.replace(/[^\d.-]/g, '');
    return parseFloat(cleanString);
  } catch (error) {
    console.error('Error parsing currency:', error);
    return 0;
  }
};
