export const metadata = {
  title: 'Democracy | XUsDemocracy',
  description:
    'How the American system works, how elections are actually run, and what the evidence says about why any of it matters.'
};

// Every factual claim on this page traces to a source linked in the text.
// Sourcing notes for future edits:
//   Paper records         EAC 2024 Election Administration and Voting Survey
//   Audits vary by state  EAC, "Election Audits Across the United States"
//   Critical infrastructure  CISA, election security topic page (2017 designation)
//   Health outcomes       Bollyky et al., The Lancet, 2019
//   Economic growth       Acemoglu et al., Journal of Political Economy, 2019
// If you add a claim here, source it the same way or leave it out.
//
// The two journal links point at the free NIH and NBER copies rather than the
// publishers. Thelancet.com and journals.uchicago.edu sit behind bot
// protection and a paywall, and a citation a reader cannot open is not much
// of a citation.

export default function Democracy() {
  return (
    <article className="prose">
      <h1>How our democracy works</h1>
      <p>
        A short, plain explanation of the system you live under: who holds power, how elections
        are actually run, and what the evidence says about why participating matters. No
        partisanship, no lecture.
      </p>

      <h2 id="system">What our system actually is</h2>
      <p>
        The United States is a <strong>constitutional republic</strong> with a{' '}
        <strong>representative democracy</strong>. You don&apos;t vote directly on most laws.
        You choose people to do it, and the Constitution sets limits neither they nor a
        majority can cross.
      </p>
      <p>
        Power is also split by geography, which is called <strong>federalism</strong>. The
        federal government handles national defense, immigration, currency, and interstate
        matters. Your state handles most of everything else: schools, roads, policing, housing,
        licensing, and the bulk of criminal law. Cities and counties handle what is closer
        still. This is why the officials on one page can feel so different from each other.
      </p>

      <h2 id="branches">The three branches</h2>
      <p>
        Federal power is divided three ways, and each branch can check the other two.
      </p>
      <p>
        <strong>Legislative.</strong> Congress writes the laws and controls federal spending.
        It has two chambers: the Senate, with two members per state serving six-year terms, and
        the House, divided by population into 435 districts, each serving two years. These are
        your most direct link to the federal government, because you and your neighbors are the
        only people who choose them.
      </p>
      <p>
        <strong>Executive.</strong> The President carries out the laws, commands the armed
        forces, conducts foreign policy, and can veto legislation. The President is elected
        nationally, is limited to two elected terms by the 22nd Amendment, and appoints the
        Cabinet secretaries who run the departments. Those appointees need Senate confirmation,
        which is one branch checking another.
      </p>
      <p>
        <strong>Judicial.</strong> Federal courts decide what the law means and can strike down
        laws or executive actions that conflict with the Constitution. Judges are nominated by
        the President, confirmed by the Senate, and serve for life so they can rule without
        worrying about the next election. The Supreme Court has nine justices, but it sits atop
        a much larger system of roughly 870 federal judgeships that handle nearly every case
        that never reaches it.
      </p>
      <p>
        <a href="/officials">See who holds these offices for you →</a>
      </p>

      <h2 id="congress">How Congress organizes itself</h2>
      <p>
        Knowing your representative&apos;s name is a start. Knowing who controls the floor is
        what explains why bills you care about move or die.
      </p>
      <p>
        The <strong>Speaker of the House</strong> is elected by the entire House, controls what
        gets scheduled for a vote, and is second in line to the presidency after the Vice
        President. The <strong>President pro tempore</strong> of the Senate, by tradition the
        senior member of the majority party, is third. <strong>Majority and minority leaders</strong>{' '}
        run each party&apos;s floor strategy, and <strong>whips</strong> count votes before
        anything reaches the floor so leadership knows whether it will pass.
      </p>
      <p>
        <strong>Committee chairs</strong> matter more than most people realize. Most bills never
        get a floor vote at all; they are decided in committee, quietly. So whether your
        representative can actually move something depends heavily on which committees they sit
        on and whether leadership is willing to schedule it. That is the practical reason to
        know these names.
      </p>

      <h2 id="elections">How elections are actually run</h2>
      <p>
        There is no single national election. Elections are run by states, counties, and
        towns, by your neighbors, under state law. In 2017 the federal government designated
        election infrastructure as{' '}
        <a
          href="https://www.cisa.gov/topics/election-security"
          target="_blank"
          rel="noopener noreferrer"
        >
          critical infrastructure
        </a>
        , which means federal agencies help state and local officials defend it but do not run
        the elections themselves.
      </p>
      <p>
        That decentralization is a security feature. There is no central system to compromise,
        because there are thousands of separate ones with different equipment and procedures.
      </p>
      <p>
        Most votes leave a paper trail. In the{' '}
        <a
          href="https://www.eac.gov/sites/default/files/2025-07/2024_EAVS_Report_508.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Election Assistance Commission&apos;s 2024 survey
        </a>
        , which had a response rate covering all 50 states and the territories, more than 98% of
        election jurisdictions used equipment that either has voters mark a paper ballot or
        produces an auditable paper record. Paper matters because it can be recounted by hand
        and checked against the machine totals.
      </p>
      <p>
        Most states then audit results after the fact, though{' '}
        <a
          href="https://www.eac.gov/election-officials/election-audits-across-united-states"
          target="_blank"
          rel="noopener noreferrer"
        >
          methods vary and there is no national standard
        </a>
        . Counting is observed by both parties, results are certified in public, and close races
        can be recounted. The system is built on the assumption that mistakes happen, which is
        exactly why they get caught.
      </p>
      <p>
        If you want to know how it works where you live, your state election office publishes
        its own procedures. That is the most reliable answer to any question about your ballot.
      </p>

      <h2 id="turnout">Why turnout matters more than it feels like it does</h2>
      <p>
        The elections with the lowest turnout are usually the ones that touch your daily life
        most. Primaries often decide the real outcome in districts that reliably favor one
        party, and they draw a fraction of the voters a November election does. Local races are
        regularly decided by dozens of votes, sometimes by a coin toss after a tie.
      </p>
      <p>
        The arithmetic is unintuitive: your vote is worth the most in exactly the elections
        most people skip.
      </p>

      <h2 id="evidence">What the evidence says</h2>
      <p>
        Democracy is usually defended on principle. It also has a measurable track record, and
        the research is about systems of government, not about any party.
      </p>
      <p>
        A study of 170 countries from 1980 to 2016, published in{' '}
        <a
          href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6484695/"
          target="_blank"
          rel="noopener noreferrer"
        >
          The Lancet
        </a>
        , found that countries gained roughly 3% in adult life expectancy within a decade of
        transitioning to democracy, and that rising democratic experience accounted for about a
        9.6% decline in cardiovascular deaths between 1995 and 2015. Notably, those gains were
        not explained by economic growth. They tracked with governments becoming more
        answerable to the people affected.
      </p>
      <p>
        Separately, economists writing in the{' '}
        <a
          href="https://www.nber.org/papers/w20004"
          target="_blank"
          rel="noopener noreferrer"
        >
          Journal of Political Economy
        </a>{' '}
        found that countries which democratized saw GDP per capita rise roughly 20% over the
        following decades, driven by investment in schooling, health, and infrastructure.
      </p>
      <p>
        The pattern in both is the same. When people can remove their leaders, leaders spend
        more on the people.
      </p>

      <h2 id="history">A right that had to be won</h2>
      <p>
        Voting in America started narrow and was widened by people who fought for it. The{' '}
        <strong>15th Amendment</strong> (1870) barred denying the vote based on race. The{' '}
        <strong>19th</strong> (1920) barred denying it based on sex. The <strong>24th</strong>{' '}
        (1964) abolished poll taxes in federal elections, and the{' '}
        <strong>Voting Rights Act of 1965</strong> finally put federal enforcement behind the
        15th Amendment nearly a century after it passed. The <strong>26th</strong> (1971)
        lowered the voting age to 18, on the argument that people old enough to be drafted were
        old enough to vote.
      </p>
      <p>
        Each of those took decades and cost people a great deal. Voting is an American
        tradition, but it is more accurate to call it an inheritance: a right that was
        expanded, deliberately, by people who did not have it.
      </p>
      <p>
        What you do with it is how the country gets decided. Not just who wins, but what gets
        built, what gets funded, and who has to be listened to.
      </p>

      <p>
        <a href="/?new=1">Find out who represents you →</a>
      </p>
      <p>
        More about this project on <a href="/why">who we are</a>.
      </p>
    </article>
  );
}
