'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { HydrationSafeButton } from '@/components/ui/HydrationSafeButton';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return;
    setSubmitted(true);
    setEmail('');
    // Hook up to Resend / Buttondown later. For now, just optimistic UI.
  };

  return (
    <section className="bg-brand-navy text-white">
      <div className="container-fh py-10">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-red">
            <Mail className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-2xl font-extrabold">
              Do not miss a World Cup story
            </h3>
            <p className="mt-1 text-sm text-white/70">
              Get FIFA World Cup 2026 headlines, match recaps and standout player updates in your inbox.
            </p>
          </div>
          <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2 md:w-auto">
            {submitted ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold">
                <Check className="h-4 w-4" />
                Thanks, you are subscribed.
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  suppressHydrationWarning
                  autoComplete="email"
                  className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                />
                <HydrationSafeButton
                  type="submit"
                  className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold hover:bg-brand-red-dark"
                >
                  Subscribe
                </HydrationSafeButton>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
