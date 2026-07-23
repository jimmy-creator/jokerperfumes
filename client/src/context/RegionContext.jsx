import { createContext, useContext, useState, useCallback } from 'react';
import { REGIONS } from '../config/regions';
import { getRegionCode, persistRegion } from '../utils/region';

const RegionContext = createContext();

export const useRegion = () => useContext(RegionContext);

export function RegionProvider({ children }) {
  const [regionCode, setRegionCode] = useState(() => getRegionCode());
  const region = REGIONS[regionCode] || REGIONS.sa;

  // Switching region is a global change (currency, prices, gateways, address,
  // policies). Persist the choice and hard-reload so every price/currency in
  // the app re-renders from freshly region-priced API responses. The caller
  // (RegionSwitcher) clears the cart first to avoid mixed-currency carts.
  const changeRegion = useCallback((code) => {
    if (!REGIONS[code] || code === getRegionCode()) return;
    persistRegion(code);
    window.location.reload();
  }, []);

  return (
    <RegionContext.Provider value={{ regionCode, region, regions: REGIONS, changeRegion, setRegionCode }}>
      {children}
    </RegionContext.Provider>
  );
}
