// Referral attribution helpers — stores the last-click referral code in a
// 30-day cookie so it can be sent with the order at checkout.
import api from '../api/axios';

const COOKIE = 'joker_ref';
const CAMP_COOKIE = 'joker_ref_c';
const DAYS = 30;

function readCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : '';
}
function writeCookie(name, value) {
  const expires = new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getRef() { return readCookie(COOKIE); }
export function getCampaign() { return readCookie(CAMP_COOKIE); }

// Read ?ref= (and optional ?c=/utm_campaign) from the URL, store both
// (last-click wins), and log a click.
export function captureRef() {
  try {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get('ref') || '').trim();
    if (!code) return;
    const campaign = (params.get('c') || params.get('utm_campaign') || '').trim();
    writeCookie(COOKIE, code);
    writeCookie(CAMP_COOKIE, campaign);
    api.post('/referrals/click', { code, campaign, path: window.location.pathname }).catch(() => {});
  } catch {
    /* no-op */
  }
}
