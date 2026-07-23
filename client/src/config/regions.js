// Two-region storefront config (Saudi Arabia + India).
//
// A single web app serves both markets. The active region drives:
//   - currency symbol / ISO code / decimals
//   - which product price field is shown (base = SAR, priceInr = INR)
//   - payment gateways offered at checkout
//   - tax label (VAT vs GST) + free-shipping threshold
//   - checkout address shape (Saudi cities vs Indian state+city+pincode)
//   - region-specific details injected into the policy pages
//
// The chosen region is persisted in localStorage and sent to the server on
// every request via the `X-Region` header (see api/axios.js), so the backend
// returns region-priced products and region-appropriate gateways.

export const REGIONS = {
  sa: {
    code: 'sa',
    name: 'Saudi Arabia',
    shortName: 'Saudi Arabia',
    flag: '🇸🇦',
    currencySymbol: 'SAR',
    currencyCode: 'SAR',
    decimals: 2,
    locale: 'en-SA',
    phoneCode: '+966',
    taxLabel: 'VAT',
    taxRate: 15,
    freeShippingAbove: 200,
    addressMode: 'sa', // city dropdown, no pincode
    cities: [
      'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran',
      'Taif', 'Tabuk', 'Buraidah', 'Khamis Mushait', 'Abha', 'Hail', 'Najran',
      'Jubail', 'Yanbu', 'Al Qatif', 'Al Hofuf', 'Jazan', 'Sakaka', 'Arar', 'Other',
    ],
  },
  in: {
    code: 'in',
    name: 'India',
    shortName: 'India',
    flag: '🇮🇳',
    currencySymbol: '₹',
    currencyCode: 'INR',
    decimals: 2,
    locale: 'en-IN',
    phoneCode: '+91',
    taxLabel: 'GST',
    taxRate: 18,
    freeShippingAbove: 3000,
    addressMode: 'in', // state + city + pincode
    states: [
      'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
      'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
      'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
      'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other',
    ],
  },
};

export const DEFAULT_REGION = 'sa';

export function isValidRegion(code) {
  return Object.prototype.hasOwnProperty.call(REGIONS, code);
}
