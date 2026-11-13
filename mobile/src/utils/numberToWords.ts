const a = [
  '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
  'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
];
const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const twoDigits = (n: number) => a[n] || `${b[Math.floor(n / 10)]} ${a[n % 10]}`;

const threeDigits = (n: number) => {
  let out = '';
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) out += `${a[h]}Hundred `;
  if (rest) out += (out ? 'and ' : '') + twoDigits(rest);
  return out;
};

export function amountToWords(num: number, currency = 'INR'): string {
  if (isNaN(num) || num === 0) return `${currency} Zero Only`;

  const absNum = Math.abs(num);
  const whole = Math.floor(absNum);
  const frac = Math.round((absNum - whole) * 100);

  let s = '';
  const billions = Math.floor(whole / 1000000000);
  const millions = Math.floor((whole % 1000000000) / 1000000);
  const thousands = Math.floor((whole % 1000000) / 1000);
  const remainder = whole % 1000;

  if (billions) s += `${threeDigits(billions)}Billion `;
  if (millions) s += `${threeDigits(millions)}Million `;
  if (thousands) s += `${threeDigits(thousands)}Thousand `;
  if (remainder) s += threeDigits(remainder);

  s = s.trim();
  let subUnit = 'Paise';
  let mainUnit = 'Rupees';

  if (currency === 'AED') {
    subUnit = 'Fils';
    mainUnit = 'Dirhams';
  } else if (currency === 'USD') {
    subUnit = 'Cents';
    mainUnit = 'Dollars';
  }

  let fracText = '';
  if (frac > 0) {
    fracText = ` and ${twoDigits(frac)}${subUnit}`;
  }

  return `${currency} ${s} ${mainUnit}${fracText} Only`.replace(/\s+/g, ' ');
}
