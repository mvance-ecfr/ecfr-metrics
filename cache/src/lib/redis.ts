import { createClient } from 'redis';
import { EcfrStructure, WorkItem } from './types';

const redis = createClient({
  url: process.env['REDIS_URL'] || 'redis://localhost:6379',
});
redis.connect().then(() => console.log('Connected to redis'));

const QUEUE_KEY = process.env['REDIS_QUEUE_KEY'] || 'ecfr:work';

export async function saveStructureToCache(
  title: number,
  date: string,
  structure: EcfrStructure
) {
  await redis.set(`${date}-${title}-structure`, JSON.stringify(structure));
}

export async function getCachedStructure(
  title: number,
  date: string
): Promise<EcfrStructure | undefined> {
  const structure = await redis.get(`${date}-${title}-structure`);
  if (structure) return JSON.parse(structure);
  return undefined;
}

export async function enqueueWork(task: WorkItem) {
  await redis.lPush(QUEUE_KEY, JSON.stringify(task));
}

export async function dequeueWork(): Promise<WorkItem | null> {
  const result = await redis.rPop(QUEUE_KEY);
  if (!result) return null;

  try {
    return JSON.parse(result);
  } catch (err) {
    console.error('Failed to parse work item from Redis:', err);
    return null;
  }
}
