import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bell, Lock, Smartphone, Check } from 'lucide-react';

const FEATURES = [
  { icon: MessageSquare, title: 'Real-time conversations', text: 'Team channels and private 1:1 messages, delivered instantly without reloading the page.' },
  { icon: Bell, title: 'Never miss a message', text: 'Unread counters, toasts and a badge in the browser tab tell you where the conversation is.' },
  { icon: Lock, title: 'Private by design', text: 'Every conversation is checked on the server: people only read what they are allowed to read.' },
  { icon: Smartphone, title: 'Works everywhere', text: 'The same app on your desktop and on your phone, served over HTTPS.' },
];

const PLANS = [
  {
    name: 'Free',
    price: '€0',
    period: 'forever',
    quotas: ['Up to 10 members', '1 workspace', '90 days of message history', 'Unlimited channels and direct messages'],
  },
  {
    name: 'Pro',
    price: '€5',
    period: 'per member / month',
    highlighted: true,
    quotas: ['Unlimited members', 'Up to 10 workspaces', 'Unlimited message history', '10 GB of file storage per workspace', 'Priority support'],
  },
];

function Landing({ onTry, onLogin }) {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--ink)] font-sans">
      <header className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
        <span className="text-lg font-bold tracking-wide">RealTimeChat</span>
        <Button variant="outline" onClick={onLogin} className="bg-transparent text-[var(--ink)] border-[var(--line-strong)] cursor-pointer">
          Log in
        </Button>
      </header>

      <section className="max-w-5xl mx-auto px-4 pt-12 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">Your team's conversations, in real time.</h1>
        <p className="mt-5 text-lg text-[var(--ink-muted)] max-w-2xl mx-auto">
          Channels for every topic, private messages for everything else, and notifications that tell you what you missed.
        </p>
        <Button onClick={onTry} className="mt-8 h-12 px-8 text-base font-bold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] cursor-pointer">
          Try it now
        </Button>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16 grid gap-4 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--line-strong)]">
            <Icon className="h-6 w-6 text-[var(--accent)]" />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">{text}</p>
          </div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center">Pricing</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-xl bg-[var(--surface)] border ${plan.highlighted ? 'border-[var(--accent)]' : 'border-[var(--line-strong)]'}`}
            >
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>{' '}
                <span className="text-sm text-[var(--ink-muted)]">{plan.period}</span>
              </p>
              <ul className="mt-5 space-y-2 list-none p-0">
                {plan.quotas.map((q) => (
                  <li key={q} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-[var(--accent)] shrink-0" />
                    {q}
                  </li>
                ))}
              </ul>
              <Button onClick={onTry} className="mt-6 w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-bold cursor-pointer">
                Try it now
              </Button>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-[var(--ink-muted)]">RealTimeChat — school project, IFOSUP Wavre</footer>
    </div>
  );
}

export default Landing;