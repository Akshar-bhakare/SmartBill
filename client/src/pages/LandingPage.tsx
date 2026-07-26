import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, FileText, BarChart3, CheckCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-dark text-white overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <header className="w-full border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-base tracking-tight">SMARTBILL</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#workflow" className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#about" className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors">
              About
            </a>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green hover:text-white transition-colors cursor-pointer"
            >
              Open App →
            </button>
          </nav>
          <button
            onClick={() => navigate('/dashboard')}
            className="md:hidden text-xs font-extrabold uppercase tracking-widest text-brand-green cursor-pointer"
          >
            Open App
          </button>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-4xl">
          <h1
            className="font-extrabold uppercase tracking-tight leading-[0.88]"
            style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
          >
            BILLING.
            <br />
            <span className="text-brand-purple">WITHOUT</span>
            <br />
            THE BORING.
          </h1>
          <p className="mt-8 text-neutral-400 text-lg lg:text-xl max-w-lg font-medium leading-relaxed">
            Create invoices, track payments, and know exactly where your money stands.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/invoices/new')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-purple text-white font-extrabold text-sm uppercase tracking-widest border-2 border-white/20 shadow-brutal-md cursor-pointer transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Create an Invoice
              <ArrowRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Large editorial tag */}
        <div className="mt-16 lg:mt-24 flex items-center gap-4 text-neutral-600">
          <div className="w-16 h-px bg-neutral-700" />
          <span className="text-xs font-bold uppercase tracking-[0.3em]">
            Create. Send. Track. Paid.
          </span>
        </div>
      </section>

      {/* ─── DASHBOARD PREVIEW ─── */}
      <section className="relative py-16 lg:py-24">
        <div className="absolute inset-0 bg-brand-purple opacity-90" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-white/60">
              The Dashboard
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold uppercase mt-3 text-white tracking-tight">
              Money, at a glance.
            </h2>
          </div>

          {/* Fake browser frame */}
          <div className="border-3 border-black bg-white shadow-brutal-xl">
            {/* Browser top bar */}
            <div className="bg-neutral-100 border-b-2 border-black px-4 py-2.5 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-coral border border-black" />
              <div className="w-3 h-3 rounded-full bg-brand-yellow border border-black" />
              <div className="w-3 h-3 rounded-full bg-brand-green border border-black" />
              <div className="ml-4 flex-1 bg-white border border-neutral-300 rounded-sm px-3 py-1 text-[10px] text-neutral-400 font-mono">
                smartbill.app/dashboard
              </div>
            </div>
            {/* Dashboard mockup content */}
            <div className="p-6 lg:p-10 bg-background">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <DashPreviewCard label="TOTAL REVENUE" value="$84,329" accent="white" />
                <DashPreviewCard label="OUTSTANDING" value="$12,402" accent="yellow" />
                <DashPreviewCard label="PAID" value="18" accent="green" />
                <DashPreviewCard label="OVERDUE" value="3" accent="coral" />
              </div>
              <div className="mt-6 border-2 border-black bg-white p-6 shadow-brutal-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-foreground">Recent Invoices</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">View All →</span>
                </div>
                {[
                  { inv: 'INV-2026-001', name: 'Acme Studio', amount: '$28,500', status: 'PAID' },
                  { inv: 'INV-2026-002', name: 'Apex Global', amount: '$14,160', status: 'OVERDUE' },
                  { inv: 'INV-2026-003', name: 'Pulse Agency', amount: '$9,912', status: 'UNPAID' },
                ].map((row) => (
                  <div key={row.inv} className="flex items-center justify-between py-2.5 border-b border-neutral-100 last:border-0 text-foreground">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold font-mono text-neutral-500">{row.inv}</span>
                      <span className="text-sm font-bold">{row.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold tabular-nums">{row.amount}</span>
                      <MockBadge status={row.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES / CAPABILITIES ─── */}
      <section id="features" className="bg-background text-foreground py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-neutral-400">
            Core Capabilities
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold uppercase mt-3 tracking-tight">
            Everything you need.
            <br />
            <span className="text-brand-purple">Nothing you don't.</span>
          </h2>

          <div className="mt-14 grid md:grid-cols-3 gap-5">
            <FeatureCard
              num="01"
              title="Create"
              desc="Build professional invoices without fighting spreadsheets. Add items, set taxes, preview — done."
              icon={<FileText size={24} strokeWidth={2.5} />}
              accent="bg-brand-purple text-white"
              cta="Create Invoice"
            />
            <FeatureCard
              num="02"
              title="Track"
              desc="Know what's paid, unpaid, and overdue at a glance. Status badges, dates, and amounts — always visible."
              icon={<BarChart3 size={24} strokeWidth={2.5} />}
              accent="bg-brand-yellow"
              cta="View Dashboard"
            />
            <FeatureCard
              num="03"
              title="Understand"
              desc="See revenue totals, outstanding amounts, and monthly trends. Your billing health in one screen."
              icon={<CheckCircle size={24} strokeWidth={2.5} />}
              accent="bg-brand-green"
              cta="See Analytics"
            />
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section id="workflow" className="bg-brand-dark text-white py-20 lg:py-28 border-t-3 border-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-neutral-500">
            Simple Workflow
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold uppercase mt-3 tracking-tight">
            From draft
            <br />
            to <span className="text-brand-green">paid</span>.
          </h2>

          <div className="mt-14 grid md:grid-cols-4 gap-6">
            {[
              { step: '01', label: 'Create', desc: 'Fill in business & customer details, add line items.' },
              { step: '02', label: 'Preview', desc: 'See a professional invoice before saving.' },
              { step: '03', label: 'Send', desc: 'Download as PDF and send to your client.' },
              { step: '04', label: 'Track', desc: 'Mark as paid, watch your revenue grow.' },
            ].map((s) => (
              <div key={s.step} className="border border-neutral-800 p-6 hover:border-brand-purple transition-colors">
                <span className="text-xs font-bold text-neutral-600 tracking-widest">{s.step}</span>
                <h3 className="text-xl font-extrabold uppercase mt-3 mb-2">{s.label}</h3>
                <p className="text-sm text-neutral-400 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="bg-brand-purple py-20 lg:py-28 border-t-3 border-black">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-4xl lg:text-6xl font-extrabold uppercase tracking-tight text-white leading-[0.95]">
            Ready to
            <br />
            get paid?
          </h2>
          <p className="mt-6 text-white/70 text-lg font-medium max-w-md mx-auto">
            Your first invoice is about 30 seconds away.
          </p>
          <button
            onClick={() => navigate('/invoices/new')}
            className="mt-10 inline-flex items-center gap-3 px-10 py-5 bg-brand-dark text-white font-extrabold text-sm uppercase tracking-widest border-2 border-white/20 shadow-brutal-md cursor-pointer transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Start Billing
            <ArrowRight size={18} strokeWidth={3} />
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer id="about" className="bg-brand-dark border-t border-neutral-800 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap size={14} strokeWidth={3} className="text-brand-purple" />
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              SmartBill — Full Stack Developer Assessment
            </span>
          </div>
          <p className="text-[11px] text-neutral-700 font-medium">
            Built with React · Express · PostgreSQL · Prisma
          </p>
        </div>
      </footer>
    </div>
  );
};

/* ─── Sub-components ─── */

const DashPreviewCard: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => {
  const bg = {
    white: 'bg-white',
    yellow: 'bg-brand-yellow',
    green: 'bg-brand-green',
    coral: 'bg-brand-coral',
  }[accent] || 'bg-white';

  return (
    <div className={`border-2 border-black p-4 shadow-brutal-sm ${bg}`}>
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-600">{label}</span>
      <p className="text-xl lg:text-2xl font-extrabold mt-1 tabular-nums text-foreground">{value}</p>
    </div>
  );
};

const MockBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    PAID: 'bg-brand-green',
    UNPAID: 'bg-brand-yellow',
    OVERDUE: 'bg-brand-coral',
    DRAFT: 'bg-neutral-200',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 border border-black text-[9px] font-black uppercase tracking-widest ${colors[status] || 'bg-neutral-200'}`}>
      {status}
    </span>
  );
};

const FeatureCard: React.FC<{
  num: string; title: string; desc: string; icon: React.ReactNode; accent: string; cta: string;
}> = ({ num, title, desc, icon, accent, cta }) => (
  <div className={`border-3 border-black p-8 shadow-brutal-md ${accent} transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg`}>
    <span className="text-xs font-bold opacity-60 tracking-widest">{num}</span>
    <div className="mt-4 mb-3">{icon}</div>
    <h3 className="text-2xl font-extrabold uppercase tracking-tight">{title}</h3>
    <p className="mt-3 text-sm font-medium leading-relaxed opacity-80">{desc}</p>
    <span className="inline-block mt-6 text-xs font-extrabold uppercase tracking-widest opacity-60">
      {cta} →
    </span>
  </div>
);

export default LandingPage;
