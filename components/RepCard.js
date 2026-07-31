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

function termEndLabel(termEnd) {
  if (!termEnd) return null;
  const d = new Date(termEnd + 'T00:00:00');
  return `Term ends ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

// Generates a .vcf contact card in the browser — nothing sent to any server.
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

// Full-bleed portrait viewer. Officials without a published photo never
// reach this — their card shows a monogram that isn't clickable.
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

  const since = rep.servingSince ? `In office since ${rep.servingSince}` : null;
  const subline = [since, rep.termEnd ? termEndLabel(rep.termEnd) : rep.extra]
    .filter(Boolean)
    .join(' · ');

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
        {subline && <p className="rep-term">{subline}</p>}
        <div className="rep-actions">
          {rep.phone && <a href={`tel:${rep.phone}`}>Call</a>}
          {rep.email && <a href={`mailto:${rep.email}`}>Email</a>}
          {rep.website && (
            <a href={rep.website} target="_blank" rel="noopener noreferrer">Website</a>
          )}
          {rep.contactForm && (
            <a href={rep.contactForm} target="_blank" rel="noopener noreferrer">Contact form</a>
          )}
          <button className="save-contact-btn" onClick={() => saveContact(rep)}>
            Save contact
          </button>
        </div>
      </div>

      {viewing && <PortraitViewer rep={rep} onClose={() => setViewing(false)} />}
    </div>
  );
}
