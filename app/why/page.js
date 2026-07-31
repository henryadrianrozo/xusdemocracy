import { CONTACT_EMAIL, SITE_URL } from '@/lib/site';

// Title is bare: the root layout applies the "%s | XUsDemocracy" template.
export const metadata = {
  title: 'Who We Are',
  description:
    'Why XUsDemocracy exists: knowing who represents you should take ten seconds, not an afternoon of research.',
  alternates: { canonical: '/why' },
  openGraph: {
    title: 'Who We Are',
    description:
      'Why XUsDemocracy exists: knowing who represents you should take ten seconds, not an afternoon of research.',
    url: '/why'
  }
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Who We Are',
  url: `${SITE_URL}/why`,
  description:
    'The mission and privacy commitments behind XUsDemocracy, a free nonpartisan tool for finding your elected officials.',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  publisher: { '@id': `${SITE_URL}/#organization` },
  mainEntity: {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    email: CONTACT_EMAIL
  }
};

export default function WhoWeAre() {
  return (
    <article className="prose">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h1>Who we are</h1>
      <p>
        Most Americans can name the President. Far fewer can name their House member. Almost
        nobody can name their state senator, the person who votes on their schools, their
        roads, their police, their rent laws. That gap isn&apos;t a personal failing. It&apos;s a
        design failure: the information was never made easy to find.
      </p>
      <h2>Access is the first step of engagement</h2>
      <p>
        When knowing who represents you takes research, most people never start. When it takes
        ten seconds, everything downstream changes: you know who to call when something affects
        your life, you know whose name to look for on your ballot, and you know exactly who is
        accountable to you. Representation only works when constituents can see it.
      </p>
      <h2>What we believe</h2>
      <p>
        This project is nonpartisan, free, and built to empower people. We don&apos;t care who
        you vote for. We care that you know who represents you, when your next election is, and
        how to make your voice heard. That&apos;s it. That&apos;s the whole mission.
      </p>
      <h2>How we handle your address</h2>
      <p>
        Your address is used for one lookup and then discarded. We don&apos;t store it, we
        don&apos;t log it, and we don&apos;t sell it, because we never have it in the first
        place. If you ask us to remember it, it is saved in your own browser and never sent
        anywhere. There are no accounts, no ads, and no tracking.
      </p>
      <h2>When we get something wrong</h2>
      <p>
        Some of our data comes from live government feeds and some is maintained by hand, which
        means errors are possible. If a name, date, or district looks wrong, tell us at{' '}
        <a href="mailto:xusalldevelopment@gmail.com">xusalldevelopment@gmail.com</a> and
        we&apos;ll fix it. We would rather be corrected than be confidently wrong.
      </p>
      <p>
        New here? Start with <a href="/democracy">how our democracy works</a>, or{' '}
        <a href="/?new=1">find your officials</a>.
      </p>
    </article>
  );
}
