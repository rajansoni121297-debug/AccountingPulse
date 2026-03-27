// ═══════════════════════════════════════════
// AccountingPulse — 113 RSS Feeds across 10 Topics
// ═══════════════════════════════════════════

export const feeds = [
  // ── TAX & COMPLIANCE ──
  { url: 'https://www.irs.gov/newsroom/feed', topic: 'tax', name: 'IRS Newswire', urgent: true },
  { url: 'https://taxfoundation.org/feed/', topic: 'tax', name: 'Tax Foundation' },
  { url: 'https://www.accountingtoday.com/feed?rss=true', topic: 'tax', name: 'Accounting Today Tax' },
  { url: 'https://news.google.com/rss/search?q=tax+compliance+IRS+2025&hl=en-US&gl=US&ceid=US:en', topic: 'tax', name: 'Google News Tax' },
  { url: 'https://www.journalofaccountancy.com/rss/all-news.xml', topic: 'tax', name: 'Journal of Accountancy Tax' },
  { url: 'https://www.forbes.com/taxes/feed/', topic: 'tax', name: 'Forbes Tax' },
  { url: 'https://www.cnbc.com/id/10000113/device/rss/rss.html', topic: 'tax', name: 'CNBC Tax' },
  { url: 'https://accountants.intuit.com/taxprocenter/feed/', topic: 'tax', name: 'Intuit Tax Pro Center' },
  { url: 'https://www.currentfederaltaxdevelopments.com/blog?format=rss', topic: 'tax', name: 'Current Federal Tax' },

  // ── ACCOUNTING & AUDITING ──
  { url: 'https://www.accountingtoday.com/feed?rss=true', topic: 'acc', name: 'Accounting Today' },
  { url: 'https://www.journalofaccountancy.com/rss/all-news.xml', topic: 'acc', name: 'Journal of Accountancy' },
  { url: 'https://www.cpajournal.com/feed/', topic: 'acc', name: 'The CPA Journal' },
  { url: 'https://www.goingconcern.com/feed/', topic: 'acc', name: 'Going Concern' },
  { url: 'https://www.cpapracticeadvisor.com/feed', topic: 'acc', name: 'CPA Practice Advisor' },
  { url: 'https://pcaobus.org/news-events/rss', topic: 'acc', name: 'PCAOB', urgent: true },
  { url: 'https://news.google.com/rss/search?q=FASB+accounting+standards+GAAP&hl=en-US&gl=US&ceid=US:en', topic: 'acc', name: 'FASB News' },

  // ── FINANCE & INVESTMENT ──
  { url: 'https://feeds.reuters.com/reuters/businessNews', topic: 'fin', name: 'Reuters Business' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', topic: 'fin', name: 'Bloomberg Markets' },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', topic: 'fin', name: 'CNBC Markets' },
  { url: 'https://news.google.com/rss/search?q=finance+investment+markets&hl=en-US&gl=US&ceid=US:en', topic: 'fin', name: 'Google Finance News' },
  { url: 'https://seekingalpha.com/feed.xml', topic: 'fin', name: 'Seeking Alpha' },
  { url: 'https://www.sec.gov/news/pressreleases.rss', topic: 'fin', name: 'SEC Press Releases', urgent: true },
  { url: 'https://www.federalreserve.gov/feeds/press_all.xml', topic: 'fin', name: 'Federal Reserve', urgent: true },
  { url: 'https://www.fdic.gov/news/press-releases/feed', topic: 'fin', name: 'FDIC', urgent: true },
  { url: 'https://finance.yahoo.com/news/rssindex', topic: 'fin', name: 'Yahoo Finance' },
  { url: 'https://www.ft.com/?format=rss', topic: 'fin', name: 'Financial Times' },
  { url: 'https://fortune.com/feed/fortune-feeds/finance/', topic: 'fin', name: 'Fortune Finance' },
  { url: 'https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_headline', topic: 'fin', name: 'Investopedia' },
  { url: 'https://www.barrons.com/feed', topic: 'fin', name: 'Barrons' },
  { url: 'https://www.marketwatch.com/rss/topstories', topic: 'fin', name: 'MarketWatch' },

  // ── CORPORATE LAW & REGULATORY ──
  { url: 'https://news.google.com/rss/search?q=corporate+law+regulatory+compliance&hl=en-US&gl=US&ceid=US:en', topic: 'law', name: 'Google Law News' },
  { url: 'https://www.ftc.gov/feeds/press-releases.xml', topic: 'law', name: 'FTC', urgent: true },
  { url: 'https://www.justice.gov/feeds/opa/justice-news.xml', topic: 'law', name: 'DOJ', urgent: true },
  { url: 'https://www.federalregister.gov/documents/search.atom?conditions%5Btype%5D=RULE', topic: 'law', name: 'Federal Register', urgent: true },
  { url: 'https://www.scotusblog.com/feed/', topic: 'law', name: 'SCOTUSblog' },
  { url: 'https://www.jdsupra.com/law-news/rss/', topic: 'law', name: 'JD Supra' },
  { url: 'https://feeds.reuters.com/reuters/USlegalnews', topic: 'law', name: 'Reuters Legal' },

  // ── HR, PAYROLL & LABOR ──
  { url: 'https://www.hrdive.com/feeds/news/', topic: 'hr', name: 'HR Dive' },
  { url: 'https://news.google.com/rss/search?q=HR+payroll+labor+employment+law&hl=en-US&gl=US&ceid=US:en', topic: 'hr', name: 'Google HR News' },
  { url: 'https://www.dol.gov/rss/releases.xml', topic: 'hr', name: 'DOL', urgent: true },
  { url: 'https://www.osha.gov/rss/whatsnew.xml', topic: 'hr', name: 'OSHA', urgent: true },
  { url: 'https://www.eeoc.gov/rss/press-releases.xml', topic: 'hr', name: 'EEOC', urgent: true },
  { url: 'https://www.bls.gov/feed/bls_latest.rss', topic: 'hr', name: 'BLS' },
  { url: 'https://www.shrm.org/rss/pages/custom.aspx', topic: 'hr', name: 'SHRM' },

  // ── RISK, FRAUD & CYBERSECURITY ──
  { url: 'https://www.cisa.gov/news.xml', topic: 'cys', name: 'CISA', urgent: true },
  { url: 'https://krebsonsecurity.com/feed/', topic: 'cys', name: 'KrebsOnSecurity' },
  { url: 'https://www.schneier.com/feed/', topic: 'cys', name: 'Schneier on Security' },
  { url: 'https://www.darkreading.com/rss.xml', topic: 'cys', name: 'Dark Reading' },
  { url: 'https://www.bleepingcomputer.com/feed/', topic: 'cys', name: 'BleepingComputer' },
  { url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml', topic: 'cys', name: 'NVD CVE', urgent: true },
  { url: 'https://news.google.com/rss/search?q=cybersecurity+fraud+risk+compliance&hl=en-US&gl=US&ceid=US:en', topic: 'cys', name: 'Google Cyber News' },
  { url: 'https://www.wired.com/feed/category/security/latest/rss', topic: 'cys', name: 'WIRED Security' },
  { url: 'https://feeds.feedburner.com/TheHackersNews', topic: 'cys', name: 'The Hacker News' },

  // ── TECHNOLOGY & AI IN BUSINESS ──
  { url: 'https://www.technologyreview.com/feed/', topic: 'tec', name: 'MIT Technology Review' },
  { url: 'https://www.wired.com/feed/rss', topic: 'tec', name: 'WIRED' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', topic: 'tec', name: 'Ars Technica' },
  { url: 'https://techcrunch.com/feed/', topic: 'tec', name: 'TechCrunch' },
  { url: 'https://venturebeat.com/category/ai/feed/', topic: 'tec', name: 'VentureBeat AI' },
  { url: 'https://www.zdnet.com/news/rss.xml', topic: 'tec', name: 'ZDNet' },
  { url: 'https://www.theverge.com/rss/index.xml', topic: 'tec', name: 'The Verge' },
  { url: 'https://news.google.com/rss/search?q=AI+technology+business+enterprise&hl=en-US&gl=US&ceid=US:en', topic: 'tec', name: 'Google Tech News' },

  // ── BUSINESS STRATEGY & MANAGEMENT ──
  { url: 'https://hbr.org/resources/rss', topic: 'str', name: 'Harvard Business Review' },
  { url: 'https://www.mckinsey.com/Insights/rss', topic: 'str', name: 'McKinsey Insights' },
  { url: 'https://www.bain.com/insights/feed/', topic: 'str', name: 'Bain & Company' },
  { url: 'https://www2.deloitte.com/us/en/rss/home.rss', topic: 'str', name: 'Deloitte Insights' },
  { url: 'https://www.pwc.com/us/en/insights.rss', topic: 'str', name: 'PwC Strategy+' },
  { url: 'https://fortune.com/feed/', topic: 'str', name: 'Fortune' },
  { url: 'https://www.inc.com/rss.html', topic: 'str', name: 'Inc. Magazine' },
  { url: 'https://www.fastcompany.com/latest/rss', topic: 'str', name: 'Fast Company' },
  { url: 'https://feeds.feedburner.com/TheEconomistFullFeed', topic: 'str', name: 'The Economist' },
  { url: 'https://news.google.com/rss/search?q=business+strategy+management+consulting&hl=en-US&gl=US&ceid=US:en', topic: 'str', name: 'Google Strategy News' },

  // ── DATA, ANALYTICS & REPORTING ──
  { url: 'https://news.google.com/rss/search?q=data+analytics+reporting+business+intelligence&hl=en-US&gl=US&ceid=US:en', topic: 'dat', name: 'Google Data News' },
  { url: 'https://towardsdatascience.com/feed', topic: 'dat', name: 'Towards Data Science' },
  { url: 'https://feeds.feedburner.com/kdnuggets-data-mining-analytics', topic: 'dat', name: 'KDnuggets' },
  { url: 'https://www.census.gov/economic-indicators/indicator.xml', topic: 'dat', name: 'Census Bureau' },
  { url: 'https://datafloq.com/feed/', topic: 'dat', name: 'Datafloq' },

  // ── WEALTH, RETIREMENT & ESTATE ──
  { url: 'https://www.kiplinger.com/feed/all', topic: 'wlt', name: 'Kiplinger' },
  { url: 'https://www.morningstar.com/feeds/rss', topic: 'wlt', name: 'Morningstar' },
  { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', topic: 'wlt', name: 'CNBC Wealth' },
  { url: 'https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_headline', topic: 'wlt', name: 'Investopedia Wealth' },
  { url: 'https://www.nerdwallet.com/blog/feed/', topic: 'wlt', name: 'NerdWallet' },
  { url: 'https://news.google.com/rss/search?q=wealth+management+retirement+estate+planning&hl=en-US&gl=US&ceid=US:en', topic: 'wlt', name: 'Google Wealth News' },
  { url: 'https://www.financial-planning.com/feed?rss=true', topic: 'wlt', name: 'Financial Planning' },

  // ── CPA FIRM INSIGHTS ──
  { url: 'https://www.withum.com/feed/', topic: 'acc', name: 'Withum' },
  { url: 'https://www.sikich.com/insights/feed/', topic: 'acc', name: 'Sikich' },
  { url: 'https://www.pkfod.com/insights/feed/', topic: 'acc', name: "PKF O'Connor Davies" },
  { url: 'https://www.grassiadvisors.com/feed/', topic: 'acc', name: 'Grassi Advisors' },
  { url: 'https://www.schneiderdowns.com/feed', topic: 'acc', name: 'Schneider Downs' },
  { url: 'https://www.anchin.com/feed/', topic: 'acc', name: 'Anchin' },
  { url: 'https://www.bpm.com/feed/', topic: 'acc', name: 'BPM' },
  { url: 'https://www.windhambrannon.com/feed/', topic: 'acc', name: 'Windham Brannon' },

  // ── ADDITIONAL TIER-1 NEWS ──
  { url: 'https://feeds.reuters.com/reuters/topNews', topic: 'fin', name: 'Reuters Top News' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', topic: 'str', name: 'NYT Business' },
  { url: 'https://feeds.washingtonpost.com/rss/business', topic: 'str', name: 'Washington Post Business' },
  { url: 'https://rss.politico.com/economy.xml', topic: 'law', name: 'Politico Economy' },
  { url: 'https://thehill.com/feed/', topic: 'law', name: 'The Hill' },
];

// Source quality classification
const GOV_PATTERNS = /\.(gov|fed\.us|mil)\b|irs\.|sec\.|cisa\.|dol\.|doj\.|ftc\.|fdic\.|osha\.|eeoc\.|nist\.|pcaob\.|fasb\.|gao\.|occ\.|cfpb\.|bls\./i;
const TIER1_DOMAINS = ['reuters.com', 'bloomberg.com', 'apnews.com', 'wsj.com', 'ft.com', 'cnbc.com', 'nytimes.com', 'washingtonpost.com', 'economist.com', 'hbr.org', 'mckinsey.com', 'axios.com', 'marketwatch.com', 'barrons.com', 'fortune.com', 'politico.com'];

export function classifySourceQuality(url) {
  if (!url) return 'tier2';
  if (GOV_PATTERNS.test(url)) return 'gov';
  for (const d of TIER1_DOMAINS) {
    if (url.includes(d)) return 'tier1';
  }
  return 'tier2';
}
