// utils/numberToWords.ts

export const numberToWords = (num: number): string => {
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ` ${a[num % 10]}` : '');
  if (num < 1000) {
    return `${
      a[Math.floor(num / 100)]
    } Hundred${num % 100 !== 0 ? ` and ${numberToWords(num % 100)}` : ''}`;
  }
  if (num < 100000) {
    return `${numberToWords(
      Math.floor(num / 1000)
    )} Thousand${num % 1000 !== 0 ? ` ${numberToWords(num % 1000)}` : ''}`;
  }
  return num.toString();
};
