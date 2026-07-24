import { useTranslation } from 'react-i18next';
import { FaWhatsapp } from 'react-icons/fa6';

const WHATSAPP_NUMBER = '966500000000';

export default function FloatingWhatsApp() {
  const { t } = useTranslation();
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('chrome.whatsappChat')}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <FaWhatsapp className="h-7 w-7" />
    </a>
  );
}
