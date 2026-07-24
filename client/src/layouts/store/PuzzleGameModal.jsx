import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Ticket, Copy, Check } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

/*
 * "The Joker's Riddle" — a 3-level word-unscramble game. Answers are validated
 * server-side (/game/puzzle/attempt); guests may play, but a reward coupon is
 * only minted for a logged-in account. Guest solves are stashed in localStorage
 * and auto-claimed on login by GameLauncher.
 */

export const GUEST_KEY = 'joker-puzzle-guest';

export const readGuestSolved = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY)) || []; }
  catch { return []; }
};
const writeGuestSolved = (arr) => {
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(arr)); } catch { /* ignore */ }
};

const solvedSet = (claimed, guest) =>
  new Set([...claimed.map((c) => c.level), ...guest.map((g) => g.level)]);

export default function PuzzleGameModal({ open, onClose }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState({ levels: [], claimed: [] });
  const [guest, setGuest] = useState([]);
  const [level, setLevel] = useState(1);
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // last solved result
  const [phase, setPhase] = useState('play'); // play | result | done

  useEffect(() => {
    if (!open) return;
    const g = readGuestSolved();
    setGuest(g);
    setGuess(''); setError(''); setResult(null);
    api.get('/game/puzzle/state')
      .then((res) => {
        const d = { levels: res.data.levels || [], claimed: res.data.claimed || [] };
        setData(d);
        const solved = solvedSet(d.claimed, g);
        const next = [1, 2, 3].find((l) => !solved.has(l));
        setLevel(next || 3);
        setPhase(next ? 'play' : 'done');
      })
      .catch(() => {});
  }, [open, user]);

  // Body scroll lock + Escape to close.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const current = data.levels.find((l) => l.level === level);
  const solved = solvedSet(data.claimed, guest);

  const submit = async () => {
    if (!guess.trim() || busy) return;
    setBusy(true); setError('');
    try {
      const { data: r } = await api.post('/game/puzzle/attempt', { level, guess });
      if (!r.correct) {
        setError(t('game.wrongGuess'));
        setBusy(false);
        return;
      }
      if (r.coupon) {
        setData((d) => ({ ...d, claimed: [...d.claimed.filter((c) => c.level !== level), { level, ...r.coupon }] }));
        setResult({ won: true, coupon: r.coupon, discount: current?.discount });
      } else {
        // Guest solve — remember it locally so it can be claimed after login.
        const nextGuest = [...guest.filter((x) => x.level !== level), { level, guess }];
        setGuest(nextGuest);
        writeGuestSolved(nextGuest);
        setResult({ won: true, needLogin: true, discount: current?.discount });
      }
      setPhase('result');
    } catch {
      setError(t('game.errorGeneric'));
    }
    setBusy(false);
  };

  const advance = () => {
    const nowSolved = solvedSet(data.claimed, guest);
    const next = [1, 2, 3].find((l) => !nowSolved.has(l));
    setGuess(''); setError(''); setResult(null);
    if (next) { setLevel(next); setPhase('play'); }
    else setPhase('done');
  };

  const goLogin = () => { onClose(); navigate('/login'); };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('game.puzzleAriaLabel')}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden p-7 text-white sm:p-10"
        style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--copper)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-[280px] rounded-full opacity-20"
          style={{ border: '1px solid var(--copper)' }}
        >
          <div className="absolute inset-8 rounded-full" style={{ border: '1px solid var(--copper)' }} />
        </div>

        <button
          type="button" onClick={onClose} aria-label={t('game.close')}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center text-white/50 transition-colors hover:text-[color:var(--gold)]"
        >
          <X className="size-5" />
        </button>

        {/* Progress dots */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map((l) => (
            <span key={l} className="h-1 flex-1 transition-colors"
              style={{ backgroundColor: solved.has(l) ? 'var(--gold)' : (l === level && phase !== 'done') ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>

        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--copper)' }}>
          {t('game.title')}{phase !== 'done' && current ? ` · ${t('game.riddleCounter', { level })}` : ''}
        </p>

        {phase === 'play' && current && (
          <div className="relative mt-3">
            <h2 className="font-serif text-2xl uppercase leading-tight tracking-wide sm:text-3xl">
              {t('game.unscrambleFor', { discount: current.discount })}
            </h2>
            <p className="font-fell mt-3 text-lg italic" style={{ color: 'var(--gold)' }}>{current.clue}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {current.scrambled.map((ch, i) => (
                <span key={i} className="flex size-10 items-center justify-center border font-serif text-xl"
                  style={{ borderColor: 'var(--copper)', color: 'var(--gold)' }}>{ch}</span>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-6">
              <input
                autoFocus
                value={guess}
                onChange={(e) => { setGuess(e.target.value); setError(''); }}
                placeholder={t('game.lettersPlaceholder', { count: current.length })}
                maxLength={current.length + 2}
                className="w-full border bg-transparent px-4 py-3 text-center font-serif text-xl uppercase tracking-[0.3em] text-white outline-none placeholder:tracking-normal placeholder:text-white/30"
                style={{ borderColor: error ? 'var(--danger)' : 'rgba(255,255,255,0.25)' }}
              />
              {error && <p className="mt-2 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
              <button
                type="submit" disabled={busy || !guess.trim()}
                className="mt-4 w-full bg-white px-8 py-3.5 font-serif text-sm uppercase tracking-[0.2em] text-black transition-colors hover:bg-[color:var(--gold)] disabled:opacity-40"
              >
                {busy ? t('game.readingCards') : t('game.submit')}
              </button>
            </form>
          </div>
        )}

        {phase === 'result' && result && (
          <div className="relative mt-3 text-center">
            <Sparkles className="mx-auto size-8" style={{ color: 'var(--gold)' }} />
            <h2 className="mt-3 font-serif text-3xl uppercase leading-none tracking-wide sm:text-4xl">
              {t('game.solvedDiscount', { discount: result.discount })}
            </h2>
            {result.coupon ? (
              <>
                <p className="font-fell mt-3 text-base text-white/70">{t('game.rewardSaved')}</p>
                <CouponCode code={result.coupon.code} />
                <p className="mt-2 text-xs text-white/40">{t('game.useAtCheckout')}</p>
              </>
            ) : (
              <>
                <p className="font-fell mt-3 text-base text-white/70">
                  {t('game.loginToClaimDiscount', { discount: result.discount })}
                </p>
                <button onClick={goLogin}
                  className="mt-5 inline-flex items-center gap-2 bg-white px-7 py-3 font-serif text-sm uppercase tracking-[0.2em] text-black transition-colors hover:bg-[color:var(--gold)]">
                  {t('game.loginToClaim')} →
                </button>
              </>
            )}
            <button onClick={advance}
              className="mt-6 block w-full text-xs uppercase tracking-widest text-white/50 transition-colors hover:text-white">
              {[1, 2, 3].some((l) => !solvedSet(data.claimed, guest).has(l)) ? `${t('game.nextRiddle')} →` : t('game.finish')}
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="relative mt-3 text-center">
            <h2 className="mt-1 font-serif text-3xl uppercase leading-none tracking-wide sm:text-4xl">
              {t('game.allSolved')}
            </h2>
            {user ? (
              <div className="mt-5 flex flex-col gap-2">
                <p className="font-fell text-base text-white/70">{t('game.rewardsApply')}</p>
                {data.claimed.sort((a, b) => a.level - b.level).map((c) => (
                  <CouponCode key={c.level} code={c.code} label={t('game.percentOff', { value: c.value })} />
                ))}
              </div>
            ) : (
              <>
                <p className="font-fell mt-3 text-base text-white/70">
                  {t('game.loginToClaimAll')}
                </p>
                <button onClick={goLogin}
                  className="mt-5 inline-flex items-center gap-2 bg-white px-7 py-3 font-serif text-sm uppercase tracking-[0.2em] text-black transition-colors hover:bg-[color:var(--gold)]">
                  {t('game.loginToClaim')} →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CouponCode({ code, label }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }).catch(() => {});
  };
  return (
    <div className="mx-auto mt-3 flex w-full max-w-xs items-center justify-between gap-2 border border-dashed px-4 py-2"
      style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
      <span className="flex items-center gap-2 font-mono text-lg tracking-widest">
        <Ticket className="size-4 shrink-0" /> {code}
      </span>
      <span className="flex items-center gap-2">
        {label ? <span className="text-xs text-white/50">{label}</span> : null}
        <button type="button" onClick={copy} aria-label={t('game.copyCode')}
          className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs uppercase tracking-wider transition-colors hover:bg-white/10">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? t('game.copied') : t('game.copy')}
        </button>
      </span>
    </div>
  );
}
