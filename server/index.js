import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { getArticles, getTopicSummary, getArticleCount } from './db.js';
import { runFetchCycle } from './fetcher.js';

const app = express();
const PORT = process.env.PORT || 4000;
const FETCH_INTERVAL = parseInt(process.env.FETCH_INTERVAL_MINUTES || '15');

app.use(cors());
app.use(express.json());

// ── API: Get articles ──
app.get('/api/articles', (req, res) => {
  try {
    const { topicId, search, limit = '30', offset = '0', includeArchived } = req.query;
    const result = getArticles({
      topicId: topicId || undefined,
      search: search || undefined,
      limit: Math.min(parseInt(limit) || 30, 100),
      offset: parseInt(offset) || 0,
      includeArchived: includeArchived === 'true',
    });
    res.json(result);
  } catch (err) {
    console.error('Articles error:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// ── API: Topic summary (counts per topic) ──
app.get('/api/articles/topics/summary', (req, res) => {
  try {
    res.json(getTopicSummary());
  } catch (err) {
    console.error('Topic summary error:', err);
    res.status(500).json({ error: 'Failed to get topic summary' });
  }
});

// ── API: Manual refresh ──
app.post('/api/refresh', async (req, res) => {
  try {
    const result = await runFetchCycle();
    res.json({ message: 'Refresh completed', ...result });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

// ── API: Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    articles: getArticleCount(),
    uptime: process.uptime(),
  });
});

// ── Scheduling ──
function startScheduler() {
  // Run every N minutes
  const cronExpr = FETCH_INTERVAL >= 60 ? '0 * * * *' : `*/${FETCH_INTERVAL} * * * *`;
  cron.schedule(cronExpr, () => {
    console.log(`[CRON] Scheduled fetch cycle at ${new Date().toISOString()}`);
    runFetchCycle().catch(console.error);
  });

  // Archive daily at 2 AM
  cron.schedule('0 2 * * *', () => {
    console.log('[CRON] Daily archive cleanup');
    // archiveOldArticles is called inside runFetchCycle too
  });

  console.log(`[SCHEDULER] Feed refresh every ${FETCH_INTERVAL} minutes`);
}

// ── Start ──
async function start() {
  console.log('AccountingPulse API starting...');
  console.log('Pre-fetching feeds (this may take a minute)...\n');

  // Initial fetch
  await runFetchCycle().catch(console.error);

  // Start scheduler
  startScheduler();

  app.listen(PORT, () => {
    console.log(`\nAccountingPulse API running on http://localhost:${PORT}`);
    console.log(`Endpoints:`);
    console.log(`  GET  /api/articles?topicId=&search=&limit=&offset=`);
    console.log(`  GET  /api/articles/topics/summary`);
    console.log(`  POST /api/refresh`);
    console.log(`  GET  /api/health\n`);
  });
}

start();
