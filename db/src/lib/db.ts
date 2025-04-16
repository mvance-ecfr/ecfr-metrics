import { Pool } from 'pg';
import type { WorkResult } from 'cache';
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

export async function saveResult(result: WorkResult): Promise<void> {
  const query = `
    INSERT INTO metrics (agency, effective_date, total_word_count)
    VALUES ($1, $2, $3) ON CONFLICT DO NOTHING
  `;

  const pool = await getPool();
  await pool.query(query, [
    result.agency,
    result.effective_date,
    result.total_word_count,
  ]);
}
