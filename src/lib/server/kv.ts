
const localStore = new Map<string, any>();

export const kv = {
  async get<T = any>(key: string): Promise<T | null> {
    if (process.env.NODE_ENV === 'development') {
      return localStore.get(key) || null;
    }
    const { kv: realKv } = await import('@vercel/kv');
    return realKv.get<T>(key);
  },

  async setex(key: string, ttl: number, value: any): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      localStore.set(key, value);
      return;
    }

    const { kv: realKv } = await import('@vercel/kv');
    await realKv.setex(key, ttl, value); 
  }
};

export const generateChallengeKey = (userId: string, date: string) => 
  `challenges:${userId}:${date}`;

export const generateStatsKey = (userId: string) => 
  `stats:${userId}`;