import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScrollToTopButton({ threshold = 320 }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  if (!visible) return null;

  return (
    <Button
      type="button"
      size="icon"
      className="fixed bottom-5 right-5 z-40 size-11 rounded-full shadow-lg"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('chrome.scrollToTop')}
    >
      <ArrowUp className="size-5" />
    </Button>
  );
}
