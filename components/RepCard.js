'use client';

import { useEffect, useState } from 'react';

function initials(name) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('');
}

export function partyMeta(party) {
  const p = (party || '').toLowerCase();
  if (p.startsWith('dem')) return { label: 'Democrat', cls: 'party-dem' };
  if (p.startsWith('rep')) return { label: 'Republican', cls: 'party-rep' };
  return { label: party || 'Independent', cls: 'party-other' };
}

// Splits "U.S. Representative, District 4" into role + district pill text.
function splitRole(role) {
  const m = role.match(/^(.*?),\s*(District .+|At-Large.*)$/i);
  return m ? { role: m[1], district: m[2] } : { role, district: null };
}

// 14px line icons, drawn to match the 1.4 stroke weight used elsewhere.
const svg = (children) => (
  <svg
    className="btn-icon"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ICONS = {
  phone: svg(
    <path d="M21 16.9v2.6a1.7 1.7 0 0 1-1.9 1.7 17 17 0 0 1-7.4-2.6 16.6 16.6 0 0 1-5.1-5.1A17 17 0 0 1 4 6.1 1.7 1.7 0 0 1 5.7 4.2h2.6a1.7 1.7 0 0 1 1.7 1.5c.1.9.3 1.7.6 2.5a1.7 1.7 0 0 1-.4 1.8l-1.1 1.1a13.6 13.6 0 0 0 5.1 5.1l1.1-1.1a1.7 1.7 0 0 1 1.8-.4c.8.3 1.6.5 2.5.6a1.7 1.7 0 0 1 1.5 1.7z" />
  ),
  mail: svg(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3,7 12,13 21,7" />
    </>
  ),
  globe: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
    </>
  ),
  form: svg(
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <polyline points="14,3 14,8 19,8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </>
  ),
  person: svg(
    <>
      <circle cx="10" cy="8" r="3.2" />
      <path d="M4 20c0-3.4 2.7-5.6 6-5.6 1.2 0 2.3.3 3.2.8" />
      <line x1="18" y1="12" x2="18" y2="18" />
      <line x1="15" y1="15" x2="21" y2="15" />
    </>
  )
};

function termEndLabel(termEnd) {
  if (!termEnd) return null;
  const d = new Date(termEnd + 'T00:00:00');
  return `Term ends ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

// Generates a .vcf contact card in the browser. Nothing is sent to any server.
// On iPhone, opening the file offers "Create New Contact".
function saveContact(rep) {
  const label = [rep.role, rep.party, termEndLabel(rep.termEnd)].filter(Boolean).join(' · ');
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${rep.name}`,
    `N:${rep.name.split(' ').slice(-1)[0]};${rep.name.split(' ').slice(0, -1).join(' ')};;;`,
    `ORG:${rep.role}`,
    rep.phone ? `TEL;TYPE=WORK,VOICE:${rep.phone}` : null,
    rep.email ? `EMAIL;TYPE=WORK:${rep.email}` : null,
    rep.website ? `URL:${rep.website}` : null,
    `NOTE:${label} · saved from democracy.xusall.com`,
    'END:VCARD'
  ].filter(Boolean);

  const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${rep.name.replace(/[^a-z0-9 ]/gi, '')}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Full-bleed portrait viewer. Officials without a published photo never reach
// this, because their card shows a monogram that is not clickable.
function PortraitViewer({ rep, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="portrait-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <figure className="portrait-figure" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rep.photoLarge || rep.photo} alt={`Official portrait of ${rep.name}`} />
        <figcaption>
          <strong>{rep.name}</strong>
          <span>{rep.role}</span>
        </figcaption>
        <button className="portrait-close" onClick={onClose} aria-label="Close portrait">
          ✕
        </button>
      </figure>
    </div>
  );
}

export default function RepCard({ rep }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [viewing, setViewing] = useState(false);
  const pm = partyMeta(rep.party);
  const { role, district } = splitRole(rep.role);
  const hasPhoto = Boolean(rep.photo) && !imgFailed;

  // Federal reps and governors ship a `facts` array. State legislators come
  // from OpenStates without term data, so they simply have none.
  const facts = rep.facts && rep.facts.length ? rep.facts : null;

  return (
    <div className="rep-card">
      {hasPhoto ? (
        <button
          className={`rep-avatar rep-avatar-photo ${pm.cls}`}
          onClick={() => setViewing(true)}
          aria-label={`View larger portrait of ${rep.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={rep.photo} alt={rep.name} onError={() => setImgFailed(true)} />
          <span className="rep-avatar-zoom" aria-hidden="true">⤢</span>
        </button>
      ) : (
        <div className={`rep-avatar ${pm.cls}`} aria-hidden="true">
          {initials(rep.name)}
        </div>
      )}

      <div className="rep-info">
        <h3>{rep.name}</h3>
        <div className="rep-meta">
          <span className="rep-role">{role}</span>
          {district && <span className="pill">{district}</span>}
          <span className={`party-pill ${pm.cls}`}>{pm.label}</span>
        </div>

        {facts && (
          <ul className="rep-facts">
            {facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}

        <div className="rep-actions">
          {rep.phone && (
            <a href={`tel:${rep.phone}`}>{ICONS.phone} Call</a>
          )}
          {rep.email && (
            <a href={`mailto:${rep.email}`}>{ICONS.mail} Email</a>
          )}
          {rep.website && (
            <a href={rep.website} target="_blank" rel="noopener noreferrer">
              {ICONS.globe} Website
            </a>
          )}
          {rep.contactForm && (
            <a href={rep.contactForm} target="_blank" rel="noopener noreferrer">
              {ICONS.form} Contact form
            </a>
          )}
          <button className="save-contact-btn" onClick={() => saveContact(rep)}>
            {ICONS.person} Save contact
          </button>
        </div>
      </div>

      {viewing && <PortraitViewer rep={rep} onClose={() => setViewing(false)} />}
    </div>
  );
}
