import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';

/*
 * The Oracle's Tent scent quiz. Five mood-based questions each award a point to
 * one of four fixed "archetypes". The winning archetype is resolved to a real
 * store category via the admin-managed `/settings/scent-quiz-map`, then the
 * visitor is sent to the filtered products page. The archetypes never change,
 * so the quiz keeps working when the store's categories are renamed.
 */

// The four fixed archetypes (display text lives in i18n under `quiz.personas`).
// Tie-break priority when two archetypes score equally.
const PRIORITY = ['mysterious', 'bold', 'warm', 'fresh'];

// Only the archetype (`a`) per option is logic; prompt/label text lives in i18n
// under `quiz.questions.<index>` and is looked up by position at render time.
const QUESTIONS = [
  { options: [{ a: 'bold' }, { a: 'fresh' }, { a: 'warm' }, { a: 'mysterious' }] },
  { options: [{ a: 'bold' }, { a: 'fresh' }, { a: 'warm' }, { a: 'mysterious' }] },
  { options: [{ a: 'bold' }, { a: 'fresh' }, { a: 'warm' }, { a: 'mysterious' }] },
  { options: [{ a: 'bold' }, { a: 'fresh' }, { a: 'warm' }, { a: 'mysterious' }] },
  { options: [{ a: 'bold' }, { a: 'fresh' }, { a: 'warm' }, { a: 'mysterious' }] },
];

function scoreAnswers(answers) {
  const counts = { bold: 0, fresh: 0, warm: 0, mysterious: 0 };
  answers.forEach((a) => { if (counts[a] != null) counts[a] += 1; });
  const max = Math.max(...Object.values(counts));
  const tied = Object.keys(counts).filter((k) => counts[k] === max);
  if (tied.length === 1) return tied[0];
  // Break ties by the final (most telling) answer, else fixed priority.
  const last = answers[answers.length - 1];
  if (tied.includes(last)) return last;
  return PRIORITY.find((k) => tied.includes(k)) || tied[0];
}

export default function ScentQuizModal({ open, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [map, setMap] = useState({});
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null); // archetype key once finished

  // Reset each time the tent opens, and pull the current category mapping.
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setAnswers([]);
    setResult(null);
    api.get('/settings/scent-quiz-map')
      .then((res) => setMap(res.data && typeof res.data === 'object' ? res.data : {}))
      .catch(() => setMap({}));
  }, [open]);

  // Lock body scroll + close on Escape while the tent is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const goToProducts = (archetype) => {
    const category = map[archetype];
    navigate(category ? `/products?category=${encodeURIComponent(category)}` : '/products');
    onClose();
  };

  const pick = (archetype) => {
    const nextAnswers = [...answers.slice(0, step), archetype];
    setAnswers(nextAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setResult(scoreAnswers(nextAnswers));
    }
  };

  // Auto-reveal a beat after the reading lands (button also available).
  useEffect(() => {
    if (!result) return;
    const id = setTimeout(() => goToProducts(result), 2600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (!open) return null;

  const q = QUESTIONS[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('quiz.tentAriaLabel')}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden p-7 text-white sm:p-10"
        style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--copper)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Faint concentric "crystal ball" line art */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-[280px] rounded-full opacity-20"
          style={{ border: '1px solid var(--copper)' }}
        >
          <div className="absolute inset-8 rounded-full" style={{ border: '1px solid var(--copper)' }} />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t('quiz.close')}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center text-white/50 transition-colors hover:text-[color:var(--gold)]"
        >
          <X className="size-5" />
        </button>

        {!result ? (
          <div className="relative">
            {/* Progress dots */}
            <div className="mb-6 flex items-center gap-2">
              {QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className="h-1 flex-1 transition-colors"
                  style={{ backgroundColor: i <= step ? 'var(--gold)' : 'rgba(255,255,255,0.15)' }}
                />
              ))}
            </div>

            <p
              className="text-[0.7rem] font-semibold uppercase tracking-[0.25em]"
              style={{ color: 'var(--copper)' }}
            >
              {t('quiz.progressLabel', { step: step + 1, total: QUESTIONS.length })}
            </p>
            <h2 className="mt-3 font-serif text-2xl uppercase leading-tight tracking-wide sm:text-3xl">
              {t(`quiz.questions.${step}.prompt`)}
            </h2>

            <div className="mt-6 flex flex-col gap-3">
              {q.options.map((opt, i) => (
                <button
                  key={opt.a}
                  type="button"
                  onClick={() => pick(opt.a)}
                  className="group flex items-center justify-between gap-3 border border-white/15 px-4 py-3.5 text-left transition-colors hover:border-[color:var(--gold)] hover:bg-white/5"
                >
                  <span className="font-fell text-base">{t(`quiz.questions.${step}.options.${i}`)}</span>
                  <span
                    className="text-lg opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: 'var(--gold)' }}
                    aria-hidden="true"
                  >→</span>
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/50 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-3.5" /> {t('quiz.back')}
              </button>
            )}
          </div>
        ) : (
          <div className="relative py-4 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--copper)' }}>
              {t('quiz.cardsSpoken')}
            </p>
            <h2 className="mt-4 font-serif text-4xl uppercase leading-none tracking-wide sm:text-5xl">
              {t(`quiz.personas.${result}.name`)}
            </h2>
            <p className="font-fell mx-auto mt-4 max-w-xs text-lg italic" style={{ color: 'var(--gold)' }}>
              {t(`quiz.personas.${result}.blurb`)}
            </p>
            <button
              type="button"
              onClick={() => goToProducts(result)}
              className="mt-8 inline-flex items-center gap-2 bg-white px-8 py-3.5 font-serif text-sm uppercase tracking-[0.2em] text-black transition-colors hover:bg-[color:var(--gold)]"
              style={{ color: '#000' }}
            >
              {t('quiz.revealMyScents')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
