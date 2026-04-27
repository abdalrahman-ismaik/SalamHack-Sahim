'use client';

import { useTranslations } from 'next-intl';
import { SERVICES } from '@/lib/services';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';

export function FeaturesSection() {
  const t   = useTranslations('services');
  const tH  = useTranslations('landing.features');

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="px-4 py-16 bg-gray-50"
    >
      <SectionHeading
        level={2}
        size="lg"
        align="center"
        label={tH('title')}
        description={tH('subtitle')}
      />

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto list-none p-0">
        {SERVICES.map(service => (
          <li key={service.id}>
            <Card as="article" className="h-full flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                  {t(`${service.id}.title`)}
                </h3>
                {!service.available && (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {t(`${service.id}.comingSoon` as Parameters<typeof t>[0])}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 flex-1">
                {t(`${service.id}.description`)}
              </p>
              {service.requiredTier === 'pro' && (
                <Badge variant="default" className="self-start text-xs">Pro</Badge>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
