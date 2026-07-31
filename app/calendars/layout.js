// The calendars page is a client component, so its metadata lives here.
// Without this it inherited the home page's title, which meant two indexable
// URLs competing under one name.
export const metadata = {
  title: 'Election Calendars for Every State',
  description:
    'Subscribe to your state election calendar and never miss a primary, runoff, or Election Day. Free .ics feeds for all 50 states, no account needed.',
  alternates: { canonical: '/calendars' },
  openGraph: {
    title: 'Election Calendars for Every State',
    description:
      'Free, auto-updating election calendar feeds for all 50 states. Works with Apple Calendar, Google Calendar, and Outlook.',
    url: '/calendars'
  }
};

export default function CalendarsLayout({ children }) {
  return children;
}
