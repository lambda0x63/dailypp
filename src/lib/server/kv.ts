// 로컬 개발용 임시 메모리 저장소
const localStore = new Map<string, any>();

export const kv = {
	async get<T = any>(key: string): Promise<T | null> {
		if (process.env.NODE_ENV === 'development') {
			return localStore.get(key) || null;
		}
		// Upstash Redis 사용
		const { Redis } = await import('@upstash/redis');
		const redis = new Redis({
			url: process.env.KV_REST_API_URL!,
			token: process.env.KV_REST_API_TOKEN!
		});
		return redis.get<T>(key);
	},

	async setex(key: string, ttl: number, value: any): Promise<void> {
		if (process.env.NODE_ENV === 'development') {
			localStore.set(key, value);
			return;
		}
		// Upstash Redis 사용
		const { Redis } = await import('@upstash/redis');
		const redis = new Redis({
			url: process.env.KV_REST_API_URL!,
			token: process.env.KV_REST_API_TOKEN!
		});
		await redis.setex(key, ttl, value);
	}
};

export const generateChallengeKey = (userId: string, date: string) =>
	`challenges:${userId}:${date}`;

export const generateStatsKey = (userId: string) => `stats:${userId}`;
