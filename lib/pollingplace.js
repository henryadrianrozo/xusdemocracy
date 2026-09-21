// Where each state lets a voter look up their own polling place.
//
// Source: the National Association of Secretaries of State's "Find Your Polling
// Place" page (nass.org/can-I-vote/find-your-polling-place), which links each
// state to its own official lookup, retrieved 21 September 2026. NASS is the
// secretaries of state's own association, so every link is a state government
// tool. Three states had moved since NASS last updated (FL, GA, WY); those
// carry the address their old link redirects to.
//
// This is a link, not a lookup. The address never touches us: the reader is
// handed to the state's tool and types it there. That is deliberate. Google's
// Civic API returns a real polling place by address, but only publishes it
// about 5 to 25 days before an election, so for most of the season it would
// return nothing.
//
// Most states fold this into one voter portal that also shows registration
// status, which is why several links look like "check your registration".
// That is the state's design, not a mistake here. Oregon is all-mail and has no
// polling places, so its link is the drop box locator, which is what an Oregon
// voter is actually looking for.
//
// VERIFICATION, 21 September 2026, first by script and then in a real browser:
//   Loaded a real state page (36): AK CA CO CT DE GA HI ID IN IA KY LA ME MA MI
//                                  MN MS MT NV NH NJ NY NC ND OR PA RI SC SD TX
//                                  UT VT VA WA WV WI
//   Real domain behind a bot challenge that a person passes but a script cannot
//   (5): AZ DC FL MO OH
//   Blocked an automated browser outright (1): IL
//   403 Forbidden even in a real browser (2): NM OK. These two may be broken or
//     may block automated visitors only. Click them first.
//   Never checked (7): AL AR KS MD NE TN WY. The first six would not connect
//     from the check machine; WY only redirects (see above).
// Unconfirmed does not mean wrong. It means the same thing it means for NCSL and
// vote.gov in CLAUDE.md: only a person in a browser can confirm it.
//
// MAINTENANCE: state sites reorganize their portals without notice. Re-check
// each spring with the registration deadlines.

export const POLLING_LOOKUP = {
  AL: 'https://myinfo.alabamavotes.gov/voterview',
  AK: 'https://akelections.maps.arcgis.com/apps/webappviewer/index.html?id=579890d66c7e40ae9f7cc227d76669b1',
  AZ: 'https://my.arizona.vote/WhereToVote.aspx?s=address',
  AR: 'https://www.voterview.ar-nova.org/',
  CA: 'https://www.sos.ca.gov/elections/polling-place/',
  CO: 'https://www.sos.state.co.us/voter/pages/pub/olvr/findVoterReg.xhtml',
  CT: 'https://www.dir.ct.gov/sots/LookUp.aspx',
  DE: 'https://ivote.de.gov/voterview',
  DC: 'https://dcboe.org/voters/find-out-where-to-vote/vote-center-locator-tool',
  FL: 'https://registration.dos.fl.gov/',
  GA: 'https://mvp.sos.ga.gov/s/',
  HI: 'https://elections.hawaii.gov/voting/voting-in-hawaii/',
  ID: 'https://elections.sos.idaho.gov/ElectionLink/ElectionLink/ViewPollingLocation.aspx',
  IL: 'https://ova.elections.il.gov/PollingPlaceLookup.aspx',
  IN: 'https://indianavoters.in.gov/PublicSite/PublicMain.aspx',
  IA: 'https://sos.iowa.gov/elections/voterreg/pollingplace/search.aspx',
  KS: 'https://myvoteinfo.voteks.org/VoterView',
  KY: 'https://vrsws.sos.ky.gov/ovrweb/govoteky',
  LA: 'https://voterportal.sos.la.gov/',
  ME: 'https://www.maine.gov/portal/government/edemocracy/voter_lookup.php',
  MD: 'https://www.elections.state.md.us/voting/where.html',
  MA: 'https://www.sec.state.ma.us/WhereDoIVoteMA/WhereDoIVote',
  MI: 'https://mvic.sos.state.mi.us/Voter/index',
  MN: 'https://pollfinder.sos.state.mn.us/',
  MS: 'https://myelectionday.sos.state.ms.us/VoterOutreach/Pages/VOSearch.aspx',
  MO: 'https://www.sos.mo.gov/elections/pollingplacelookup/',
  MT: 'https://app.mt.gov/voterinfo/',
  NE: 'https://www.votercheck.necvr.ne.gov/',
  NV: 'https://nvsos.gov/votersearch/',
  NH: 'https://app.sos.nh.gov/viphome',
  NJ: 'https://www.state.nj.us/state/elections/vote-polling-location.shtml',
  NM: 'https://voterportal.servis.sos.state.nm.us/WhereToVote.aspx',
  NY: 'https://voterlookup.elections.ny.gov/',
  NC: 'https://vt.ncsbe.gov/PPLkup/',
  ND: 'https://vip.sos.nd.gov/WhereToVote.aspx?tab=AddressandVotingTimes',
  OH: 'https://www.ohiosos.gov/directories/find-my-polling-location',
  OK: 'https://okvoterportal.okelections.us/',
  OR: 'https://sos.oregon.gov/voting/pages/drop-box-locator.aspx',
  PA: 'https://www.pavoterservices.pa.gov/Pages/PollingPlaceInfo.aspx',
  RI: 'https://vote.sos.ri.gov/Home/PollingPlaces?ActiveFlag=2',
  SC: 'https://vrems.scvotes.sc.gov/Voter/Login?PageMode=PollingPlace',
  SD: 'https://vip.sdsos.gov/VIPLogin.aspx',
  TN: 'https://tnmap.tn.gov/voterlookup/',
  TX: 'https://teamrv-mvp.sos.texas.gov/MVP/mvp.do',
  UT: 'https://votesearch.utah.gov/voter-search/search/search-by-address/how-and-where-can-i-vote',
  VT: 'https://mvp.vermont.gov',
  VA: 'https://vote.elections.virginia.gov/VoterInformation/Lookup/polling',
  WA: 'https://voter.votewa.gov/WhereToVote.aspx',
  WV: 'https://apps.sos.wv.gov/elections/voter/index.aspx',
  WI: 'https://myvote.wi.gov/en-us/FindMyPollingPlace',
  WY: 'https://myelectionday.sos.wyo.gov/WYVOTES/Pages/VOSearch.aspx'
};

const NASS = 'https://www.nass.org/can-I-vote/find-your-polling-place';

// Puerto Rico and the other territories are not in the table. They fall back to
// the NASS page rather than to a guessed address, so a missing entry costs the
// reader one extra click and never a wrong link.
export function pollingPlaceUrl(state) {
  return POLLING_LOOKUP[state] || NASS;
}
