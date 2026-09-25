import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Instagram } from 'lucide-react';

const D = ({ style, children }: { style?: React.CSSProperties; children?: React.ReactNode }) => (
  <div style={style}>{children}</div>
);

const ownEvents = [
  {
    title: 'Freshers Party',
    date: 'Aug 12, 2025',
    entryFee: '₹450 per student',
    turnout: '450+ Students',
    revenue: '₹2,00,000+',
    sponsorship:
      'The flagship icebreaker for college students. High potential for product sampling, dynamic venue banners, and heavy social media tagging.',
    accentColor: '#f59e0b',
  },
  {
    title: 'Tandulwadi Trek',
    date: 'Oct 04, 2025',
    entryFee: '₹450 per student',
    turnout: '200+ Trekkers',
    revenue: '₹90,000+',
    sponsorship:
      'Centered on fitness, endurance, and youth adventure. Direct sampling opportunities for athletic, beverage, and outdoor lifestyle brands.',
    accentColor: '#10b981',
  },
  {
    title: 'The Last Ride Camp',
    date: 'Feb 12–14, 2026',
    entryFee: '₹3,450 per student',
    turnout: '130+ Campers',
    revenue: '₹4,50,000+',
    sponsorship:
      'Premium 3-day multi-day retreat. Reaches students with high spending capacity through deep brand activations around campfire sessions.',
    accentColor: '#f59e0b',
  },
  {
    title: 'The Last Chapter Farewell',
    date: 'Mar 24, 2026',
    entryFee: '₹500 per student',
    turnout: '500+ Students',
    revenue: '₹2,50,000+',
    sponsorship:
      'Our largest, most emotional end-of-year event. Maximum brand exposure with main-stage integration.',
    accentColor: '#8b5cf6',
  },
];

const dark = '#09090b';
const card = 'rgba(24,24,27,0.95)';
const border = '#27272a';
const gold = '#f59e0b';
const goldLight = '#fbbf24';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0b', color: '#f4f4f5' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#1a1200 0%,#09090b 60%,#0c0020 100%)', padding: '5rem 1rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: gold, fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>
            Est. 2024 · @the.arrival.affairs
          </p>
          <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            The{' '}
            <span style={{ color: gold }}>Arrival Affairs</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            We don't just host events, we build culture.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="#events-section">
              <Button size="lg" style={{ background: gold, color: '#000', fontWeight: 700, border: 'none' }}>
                Our Events <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#partner">
              <Button size="lg" variant="outline" style={{ borderColor: gold, color: gold }}>
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT QUOTE ───────────────────────────────────── */}
      <section style={{ padding: '4rem 1rem', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <blockquote style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.55rem)', fontStyle: 'italic', color: '#e4e4e7', lineHeight: 1.75, marginBottom: '1.5rem' }}>
            "The Arrival Affairs is the strongest bridge between premium brands and the dynamic student
            demographic (Gen-Z). We curate safe, unforgettable, and high-energy experiences, serving as
            a direct touchpoint for your brand."
          </blockquote>
          <p style={{ color: gold, fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            — The Arrival Affairs · Event Management
          </p>
        </div>
      </section>

      {/* ── KEY HIGHLIGHTS ────────────────────────────────── */}
      <section style={{ padding: '4rem 1rem', background: card }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', color: gold, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            Key Highlights
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '3rem', color: '#fff' }}>
            About Us &amp; Audience Reach
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1.5rem' }}>
            {[
              { value: '4', label: 'Mega Events Per Year' },
              { value: '1,280+', label: 'Active Youth Participants' },
              { value: '100%', label: 'Student & Youth Audience' },
              { value: '₹9.9L+', label: 'Total Event Economy' },
            ].map((s) => (
              <div key={s.label} style={{ background: dark, border: `1px solid ${border}`, borderRadius: '0.75rem', padding: '1.75rem 1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, color: goldLight, lineHeight: 1 }}>{s.value}</p>
                <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANNUAL EVENT CALENDAR ─────────────────────────── */}
      <section style={{ backgroundColor: dark, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ background: card, border: `1px solid rgba(39,39,42,0.8)`, borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '0.12em', color: gold, textTransform: 'uppercase' }}>
                Annual Event Calendar
              </h2>
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${border}`, marginBottom: '2rem' }}>
              <div>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Revenue</p>
                <p style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: goldLight, fontWeight: 600, lineHeight: 1.1 }}>₹9.9 Lakhs+</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '0.25rem' }}>100% Student &amp; Youth Audience</p>
                <p style={{ fontSize: 'clamp(1.2rem, 3vw, 2.4rem)', color: '#e4e4e7', fontWeight: 500, lineHeight: 1.1 }}>1,280+ Active Youth Participants</p>
              </div>
            </div>
            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid #3f3f46` }}>
                    {['Event Name', 'Event Date', 'Audience Target', 'Revenue'].map((h, i) => (
                      <th key={h} style={{ padding: '0.75rem 0.75rem', color: gold, fontWeight: 400, fontSize: 'clamp(0.9rem, 1.8vw, 1.25rem)', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Freshers Party', date: 'Aug 12, 2025', audience: '450+ Students', revenue: '₹2,00,000+' },
                    { name: 'Tandulwadi Trek', date: 'Oct 04, 2025', audience: '200+ Students', revenue: '₹90,000+' },
                    { name: 'The Last Ride Camp', date: 'Feb 12–14, 2026', audience: '130+ Students', revenue: '₹4,50,000+' },
                    { name: 'The Last Chapter Farewell', date: 'Mar 24, 2026', audience: '500+ Students', revenue: '₹2,50,000+' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 700, color: '#fff' }}>{row.name}</td>
                      <td style={{ padding: '1rem 0.75rem', color: '#d4d4d8' }}>{row.date}</td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: 700, color: '#fff' }}>{row.audience}</td>
                      <td style={{ padding: '1rem 0.75rem', color: '#f4f4f5', fontWeight: 500, textAlign: 'right' }}>{row.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR SIGNATURE EVENTS ──────────────────────────── */}
      <section id="events-section" style={{ padding: '5rem 1rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', color: gold, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            Signature Experiences
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '3.5rem', color: '#fff' }}>
            Our Hosted Events
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {ownEvents.map((ev, i) => (
              <div key={ev.title} style={{ background: card, border: `1px solid ${border}`, borderLeft: `4px solid ${ev.accentColor}`, borderRadius: '0.75rem', padding: '2rem 2rem 2rem 1.75rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                <div>
                  <p style={{ color: ev.accentColor, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Event {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
                    {ev.title} <span style={{ color: '#a1a1aa', fontWeight: 400, fontSize: '0.9rem' }}>({ev.date})</span>
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {[
                      `Entry Fee: ${ev.entryFee}`,
                      `Expected Turnout: ${ev.turnout}`,
                      `Revenue Pool: ${ev.revenue}`,
                    ].map((item) => (
                      <span key={item} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${border}`, borderRadius: '999px', padding: '0.3rem 0.9rem', fontSize: '0.8rem', color: '#d4d4d8' }}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <p style={{ color: '#a1a1aa', lineHeight: 1.7, fontSize: '0.95rem' }}>
                    <span style={{ color: ev.accentColor, fontWeight: 600 }}>Sponsorship Value:</span>{' '}
                    {ev.sponsorship}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY PARTNER WITH US ───────────────────────────── */}
      <section id="partner" style={{ padding: '5rem 1rem', background: card, borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', color: gold, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            Sponsorship Proposal 2025–2026
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '3rem', color: '#fff' }}>
            Why Partner With Us?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem' }}>
            {[
              { title: 'Direct Gen-Z Reach', desc: 'Access over 1,280+ energetic, high-spending college students across 4 mega events per year.', icon: '🎯' },
              { title: 'High ROI & Recall', desc: 'High-visibility physical placements paired with strong post-event digital traction across social media.', icon: '📈' },
              { title: 'Professional Management', desc: 'Managed by an organized team driving an overall ₹9.9 Lakhs+ event ecosystem with proven execution.', icon: '🏆' },
            ].map((p) => (
              <div key={p.title} style={{ background: dark, border: `1px solid ${border}`, borderRadius: '0.75rem', padding: '1.75rem' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{p.icon}</p>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>{p.title}</h3>
                <p style={{ color: '#a1a1aa', lineHeight: 1.65, fontSize: '0.9rem' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO VOLUNTEER ──────────────────────────────── */}
      <section style={{ padding: '5rem 1rem', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '3rem', color: '#fff' }}>
            How to Volunteer with Us
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
            {[
              { n: '01', t: 'Browse Events', d: 'Explore our upcoming volunteer opportunities and find the perfect fit for your schedule.' },
              { n: '02', t: 'Express Interest', d: 'Click "I\'m Interested" and fill in just your name and phone number — no account needed.' },
              { n: '03', t: 'Get Selected', d: 'Our team reviews applications and contacts selected volunteers directly via phone or WhatsApp.' },
            ].map((s) => (
              <div key={s.n} style={{ background: card, border: `1px solid ${border}`, borderRadius: '0.75rem', padding: '1.75rem' }}>
                <p style={{ fontSize: '2rem', fontWeight: 900, color: gold, marginBottom: '0.5rem' }}>{s.n}</p>
                <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{s.t}</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.65 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section style={{ padding: '4rem 1rem', background: card, borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 800, marginBottom: '2.5rem', color: '#fff' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { q: 'Do I need to create an account?', a: 'No! Just provide your name and phone number when expressing interest. Takes under 30 seconds.' },
              { q: 'Is there a fee to volunteer?', a: 'Volunteering is free. Entry fees mentioned are for attendees/participants, not volunteers.' },
              { q: 'How will I be contacted?', a: 'Our team contacts selected volunteers directly via phone call or WhatsApp message.' },
              { q: 'Can I apply to multiple events?', a: 'Yes — as long as the dates don\'t conflict, you can apply to as many as you like.' },
            ].map((faq, i) => (
              <details key={i} style={{ background: dark, border: `1px solid ${border}`, borderRadius: '0.6rem', padding: '1.1rem 1.25rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#fff', fontSize: '0.95rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.q}
                  <ArrowRight style={{ width: '1rem', height: '1rem', color: gold, flexShrink: 0, marginLeft: '0.75rem' }} />
                </summary>
                <p style={{ marginTop: '0.75rem', color: '#a1a1aa', lineHeight: 1.65, fontSize: '0.9rem' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1rem', background: 'linear-gradient(135deg,#1a1200 0%,#09090b 100%)', borderTop: `1px solid ${border}`, textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            Ready to Be Part of the Experience?
          </h2>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem', lineHeight: 1.7 }}>
            Browse our upcoming events and secure your spot today. No registration required.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/">
              <Button size="lg" style={{ background: gold, color: '#000', fontWeight: 700, border: 'none' }}>
                Browse Events Now
              </Button>
            </Link>
            <a href="https://www.instagram.com/the.arrival.affairs" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" style={{ borderColor: gold, color: gold }}>
                <Instagram className="mr-2 h-4 w-4" />
                Follow Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: '2rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#52525b', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} The Arrival Affairs — Event Management. All rights reserved. · @the.arrival.affairs
        </p>
      </footer>
    </div>
  );
}