import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data', 'accountingpulse.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    summary         TEXT,
    article_url     TEXT NOT NULL UNIQUE,
    image_url       TEXT,
    source_name     TEXT NOT NULL,
    source_url      TEXT,
    topic_id        TEXT NOT NULL,
    published_at    TEXT NOT NULL,
    fetched_at      TEXT NOT NULL DEFAULT (datetime('now')),
    archived_at     TEXT,
    is_urgent       INTEGER DEFAULT 0,
    is_trending     INTEGER DEFAULT 0,
    source_quality  TEXT DEFAULT 'tier2'
  );

  CREATE INDEX IF NOT EXISTS idx_articles_topic_id ON articles(topic_id);
  CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
  CREATE INDEX IF NOT EXISTS idx_articles_article_url ON articles(article_url);
  CREATE INDEX IF NOT EXISTS idx_articles_archived_at ON articles(archived_at);
  CREATE INDEX IF NOT EXISTS idx_articles_source_quality ON articles(source_quality);
`);

// Prepared statements
const insertArticle = db.prepare(`
  INSERT OR IGNORE INTO articles (id, title, summary, article_url, image_url, source_name, source_url, topic_id, published_at, fetched_at, is_urgent, is_trending, source_quality)
  VALUES (@id, @title, @summary, @article_url, @image_url, @source_name, @source_url, @topic_id, @published_at, @fetched_at, @is_urgent, @is_trending, @source_quality)
`);

const insertMany = db.transaction((articles) => {
  let inserted = 0;
  for (const a of articles) {
    const result = insertArticle.run(a);
    if (result.changes > 0) inserted++;
  }
  return inserted;
});

export function saveArticles(articles) {
  if (!articles.length) return 0;
  return insertMany(articles);
}

export function getArticles({ topicId, search, limit = 30, offset = 0, includeArchived = false } = {}) {
  let where = [];
  let params = {};

  if (!includeArchived) {
    where.push('archived_at IS NULL');
  }
  if (topicId) {
    where.push('topic_id = @topicId');
    params.topicId = topicId;
  }
  if (search) {
    where.push("(title LIKE @search OR summary LIKE @search OR source_name LIKE @search)");
    params.search = `%${search}%`;
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) as count FROM articles ${whereClause}`).get(params).count;

  const articles = db.prepare(`
    SELECT * FROM articles ${whereClause}
    ORDER BY
      is_urgent DESC,
      CASE source_quality WHEN 'gov' THEN 0 WHEN 'tier1' THEN 1 ELSE 2 END,
      published_at DESC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit, offset });

  return {
    articles,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}

export function getTopicSummary() {
  const rows = db.prepare(`
    SELECT topic_id, COUNT(*) as count FROM articles WHERE archived_at IS NULL GROUP BY topic_id
  `).all();
  const result = {};
  rows.forEach(r => { result[r.topic_id] = r.count; });
  return result;
}

export function archiveOldArticles(days = 30) {
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const result = db.prepare(`
    UPDATE articles SET archived_at = datetime('now') WHERE archived_at IS NULL AND published_at < @cutoff
  `).run({ cutoff });
  return result.changes;
}

export function getArticleCount() {
  return db.prepare('SELECT COUNT(*) as count FROM articles WHERE archived_at IS NULL').get().count;
}

export default db;
