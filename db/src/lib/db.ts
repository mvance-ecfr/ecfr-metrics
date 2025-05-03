import { Pool } from 'pg';
import { Metric, WorkResult } from 'cache';
import { AuthTypes, Connector } from '@google-cloud/cloud-sql-connector';

const pgInstanceName = process.env['PGINSTANCE'];
let _pool: Pool | undefined;

export async function getPool(): Promise<Pool> {
  if (_pool) return _pool;
  if (pgInstanceName) {
    const connector = new Connector();
    const clientOpts = await connector.getOptions({
      instanceConnectionName: pgInstanceName,
      authType: AuthTypes.IAM,
    });
    _pool = new Pool({
      ...clientOpts,
      user: process.env['PGUSER'] || 'test-user',
      database: process.env['PGDATABASE'] || 'ecfr-metrics',
    });
  } else {
    _pool = new Pool({
      host: process.env['PGHOST'] || 'localhost',
      port: process.env['PGPORT'] ? Number(process.env['PGPORT']) : 5432,
      database: process.env['PGDATABASE'] || 'ecfr-metrics',
      user: process.env['PGUSER'] || 'test-user',
      password: process.env['PGPASSWORD'] || 'test-password',
    });
  }
  return _pool;
}

export async function hasResult(
  agency: string,
  effectiveDate: string,
  title: number,
  chapterOrSubtitle: string
): Promise<boolean> {
  const query = `SELECT word_count FROM metrics WHERE agency = $1 AND effective_date = $2 AND title = $3 AND chapter_or_subtitle = $4`;

  const pool = await getPool();
  const { rows } = await pool.query(query, [
    agency,
    effectiveDate,
    title,
    chapterOrSubtitle,
  ]);
  return rows.length > 0 && rows[0].word_count > 0;
}

export async function saveResult(result: WorkResult): Promise<void> {
  const query = `
    INSERT INTO metrics (agency, effective_date, title, chapter_or_subtitle, word_count, sections)
    VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (agency, effective_date, title, chapter_or_subtitle) DO UPDATE
      SET word_count = $5, sections = $6;
  `;

  const pool = await getPool();
  await pool.query(query, [
    result.agency,
    result.effective_date,
    result.title,
    result.chapter || result.subtitle,
    result.word_count,
    result.sections,
  ]);
}

export async function getMetrics(date?: string | undefined): Promise<Metric[]> {
  if (date) {
    const query = `
    SELECT agency, effective_date::text, SUM(word_count) as total_word_count, SUM(sections) as total_section_count FROM metrics WHERE effective_date = $1 GROUP BY agency, effective_date
  `;
    const pool = await getPool();
    const { rows } = await pool.query(query, [date]);
    return rows;
  } else {
    const query = `
    SELECT agency, effective_date::text, SUM(word_count) as total_word_count, SUM(sections) as total_section_count FROM metrics GROUP BY agency, effective_date
  `;
    const pool = await getPool();
    const { rows } = await pool.query(query);
    return rows;
  }
}

export async function getDates(): Promise<string[]> {
  const query = `
    SELECT DISTINCT effective_date::text FROM metrics
  `;
  const pool = await getPool();
  const { rows } = await pool.query(query);
  return rows.map((r) => r.effective_date);
}
