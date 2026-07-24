import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Ticket } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import PuzzleGameModal, { GUEST_KEY, readGuestSolved } from './PuzzleGameModal';

// Floating launcher for "The Joker's Riddle" plus the post-login auto-claim:
// when a guest who solved levels logs in, their stored solves are re-submitted
// (now authenticated) so the coupons are minted to their account.
export default function GameLauncher() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const claimedFor = useRef(null);

  // Only show the launcher when the admin has the game turned on.
  useEffect(() => {
    api.get('/game/puzzle/state')
      .then((res) => setEnabled(res.data?.enabled !== false))
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    if (claimedFor.current === user.id) return; // don't re-run for the same session
    const pending = readGuestSolved();
    if (!pending.length) { claimedFor.current = user.id; return; }
    claimedFor.current = user.id;

    (async () => {
      const won = [];
      for (const { level, guess } of [...pending].sort((a, b) => a.level - b.level)) {
        try {
          const { data } = await api.post('/game/puzzle/attempt', { level, guess });
          if (data.correct && data.coupon) won.push(data.coupon);
        } catch { /* skip a solve that no longer validates */ }
      }
      try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
      if (won.length) {
        toast.success(
          t('game.rewardsClaimedToast', { count: won.length }),
          { duration: 6000 },
        );
      }
    })();
  }, [user]);

  if (!enabled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('game.launcherAriaLabel')}
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold uppercase tracking-wider shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--copper)', color: 'var(--gold)' }}
      >
        <Ticket className="size-5" />
        <span className="hidden sm:inline">{t('game.win15Off')}</span>
      </button>

      <PuzzleGameModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
