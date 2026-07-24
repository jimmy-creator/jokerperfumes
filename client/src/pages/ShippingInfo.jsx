import { Truck, Zap, Package, MapPin, Clock, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { CURRENCY } from '../utils/currency';
import { cn } from '@/lib/utils';

export default function ShippingInfo() {
  const { t } = useTranslation();

  const FAQS = [
    { q: t('shippingInfo.faq1Q'), a: t('shippingInfo.faq1A') },
    { q: t('shippingInfo.faq2Q'), a: t('shippingInfo.faq2A') },
    { q: t('shippingInfo.faq3Q'), a: t('shippingInfo.faq3A') },
    { q: t('shippingInfo.faq4Q'), a: t('shippingInfo.faq4A') },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <SEO title={t('shippingInfo.seoTitle')} description={t('shippingInfo.seoDescription', { amount: `${CURRENCY}500` })} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="border-b border-border pb-6 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{t('shippingInfo.heading')}</h1>
        <p className="mt-2 text-muted-foreground">{t('shippingInfo.subheading')}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { Icon: Truck, title: t('shippingInfo.standardTitle'), price: `${CURRENCY}49`, body: t('shippingInfo.standardBody') },
          { Icon: Zap, title: t('shippingInfo.expressTitle'), price: `${CURRENCY}99`, body: t('shippingInfo.expressBody') },
          { Icon: Package, title: t('shippingInfo.freeTitle'), price: `${CURRENCY}0`, body: t('shippingInfo.freeBody', { amount: `${CURRENCY}500` }), highlight: true },
        ].map(({ Icon, title, price, body, highlight }) => (
          <div key={title} className={cn('rounded-lg border p-5', highlight ? 'border-primary bg-primary/5' : 'border-border bg-card')}>
            <Icon className="size-6 text-primary" />
            <h3 className="mt-3 font-medium">{title}</h3>
            <p className="my-1 text-2xl font-semibold">{price}</p>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">{t('shippingInfo.coverageHeading')}</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="flex items-center gap-2 font-medium"><MapPin className="size-4 text-primary" /> {t('shippingInfo.domesticTitle')}</h4>
            <p className="mt-2 text-sm text-muted-foreground">{t('shippingInfo.domesticBody')}</p>
          </div>
          <div>
            <h4 className="flex items-center gap-2 font-medium"><Clock className="size-4 text-primary" /> {t('shippingInfo.processingTitle')}</h4>
            <p className="mt-2 text-sm text-muted-foreground">{t('shippingInfo.processingBody')}</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">{t('shippingInfo.trackingHeading')}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{t('shippingInfo.trackingIntro')}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>{t('shippingInfo.trackingItem1')}</li>
          <li>{t('shippingInfo.trackingItem2')}</li>
          <li>{t('shippingInfo.trackingItem3')}</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">{t('shippingInfo.faqHeading')}</h2>
        <div className="mt-4 flex flex-col gap-2">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="rounded-lg border border-border p-4">
              <summary className="flex cursor-pointer items-center gap-2 font-medium"><HelpCircle className="size-4 text-primary" /> {q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
