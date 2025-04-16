import { createClient } from 'redis';
import { WorkItem } from './types';

const redis = createClient({
  url: process.env['REDIS_URL'] || 'redis://localhost:6379',
});
redis.connect().then(() => console.log('Connected to redis'));

const QUEUE_KEY = process.env['REDIS_QUEUE_KEY'] || 'ecfr:work';

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
