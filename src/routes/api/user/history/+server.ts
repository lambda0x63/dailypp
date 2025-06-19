import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { kv, generateChallengeKey } from '$lib/server/kv';
import { APIError, errorResponse } from '$lib/server/errors';
import type { ChallengeData } from '$lib/types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw new APIError('Unauthorized', 401);
	}

	try {
		const userId = locals.user.id;
		const today = new Date();
		const dates: string[] = []; // 타입 명시

		// 지난 30일 날짜 생성
		for (let i = 0; i < 30; i++) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);
			dates.push(date.toISOString().split('T')[0]);
		}

		// 각 날짜별 챌린지 데이터 가져오기
		const challengePromises = dates.map((date) =>
			kv.get<ChallengeData>(generateChallengeKey(userId, date))
		);

		const challengeResults = await Promise.all(challengePromises);

		const history = challengeResults
			.map((challenge, index) => {
				if (!challenge) return null;
				return {
					date: dates[index],
					challenges: challenge.challenges.map((c) => ({
						beatmap_id: c.beatmap_id,
						difficulty: c.difficulty,
						completed: c.completed,
						completed_at: c.completed_at,
						beatmap: {
							title: c.beatmap.title,
							version: c.beatmap.version
						}
					}))
				};
			})
			.filter((item): item is NonNullable<typeof item> => item !== null); // 타입 가드

		return json(history);
	} catch (error) {
		return errorResponse(error);
	}
};
