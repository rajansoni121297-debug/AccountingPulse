export const TOPICS = [
  { id: 'tax', label: 'Tax & Compliance', color: '#d97706', bg: 'rgba(217,119,6,.12)', icon: '🏛️', keywords: ['tax', 'irs', 'tcja', 'deduction', 'credit', 'compliance', 'filing', 'withholding', '1099', 'income tax'] },
  { id: 'acc', label: 'Accounting & Auditing', color: '#2563eb', bg: 'rgba(37,99,235,.12)', icon: '📊', keywords: ['audit', 'accounting', 'gaap', 'fasb', 'pcaob', 'sox', 'restatement', 'financial reporting', 'cpa'] },
  { id: 'fin', label: 'Finance & Investment', color: '#059669', bg: 'rgba(5,150,105,.12)', icon: '💹', keywords: ['finance', 'investment', 'market', 'stock', 'bond', 'fed', 'sec', 'banking', 'interest rate', 'ipo'] },
  { id: 'law', label: 'Corporate Law & Regulatory', color: '#dc2626', bg: 'rgba(220,38,38,.12)', icon: '⚖️', keywords: ['law', 'legal', 'regulatory', 'regulation', 'ftc', 'doj', 'enforcement', 'litigation', 'court'] },
  { id: 'hr', label: 'HR Payroll & Labor', color: '#7c3aed', bg: 'rgba(124,58,237,.12)', icon: '👥', keywords: ['hr', 'payroll', 'labor', 'employment', 'hiring', 'salary', 'benefits', 'workforce', 'osha', 'dol'] },
  { id: 'cys', label: 'Risk Fraud & Cybersecurity', color: '#0891b2', bg: 'rgba(8,145,178,.12)', icon: '🛡️', keywords: ['cyber', 'security', 'fraud', 'risk', 'breach', 'hack', 'ransomware', 'cisa', 'vulnerability'] },
  { id: 'tec', label: 'Technology & AI in Business', color: '#e11d48', bg: 'rgba(225,29,72,.12)', icon: '🤖', keywords: ['ai', 'technology', 'digital', 'automation', 'cloud', 'machine learning', 'saas', 'blockchain'] },
  { id: 'str', label: 'Business Strategy & Management', color: '#ea580c', bg: 'rgba(234,88,12,.12)', icon: '🎯', keywords: ['strategy', 'management', 'consulting', 'leadership', 'transformation', 'growth', 'ceo'] },
  { id: 'dat', label: 'Data Analytics & Reporting', color: '#4f46e5', bg: 'rgba(79,70,229,.12)', icon: '📈', keywords: ['data', 'analytics', 'reporting', 'dashboard', 'business intelligence', 'census', 'statistics'] },
  { id: 'wlt', label: 'Wealth Retirement & Estate', color: '#0d9488', bg: 'rgba(13,148,136,.12)', icon: '💎', keywords: ['wealth', 'retirement', 'estate', 'planning', 'trust', 'pension', '401k', 'ira', 'investment'] },
];

export const TOPIC_MAP = {};
TOPICS.forEach(t => { TOPIC_MAP[t.id] = t; });
