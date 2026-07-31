// The officials page is a client component, so its metadata lives here.
//
// noindex is deliberate and permanent. The page is personal to one address and
// renders entirely from client-side state, so a crawler sees an empty shell.
// `follow` stays on so links out of it still count. robots.js also disallows
// the path, but that only saves crawl budget; this is the directive that keeps
// it out of an index.
//
// The title is bare because the root layout applies the "%s | XUsDemocracy"
// template. Do not repeat the brand here.
// The self-referential canonical is not optional. `alternates.canonical` in
// the root layout is inherited by any page that does not set its own, so
// without this line /officials declared the home page as its canonical while
// also declaring itself noindex, which are contradictory instructions.
export const metadata = {
  title: 'My Officials',
  description:
    'Your U.S. senators, House representative, governor, and state legislators, plus your next election.',
  alternates: { canonical: '/officials' },
  robots: { index: false, follow: true }
};

export default function OfficialsLayout({ children }) {
  return children;
}
