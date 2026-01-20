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
		const dates = [];

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

		const stats = {
			total: 0,
			completed: 0,
			byDifficulty: {
				EASY: { total: 0, completed: 0 },
				NORMAL: { total: 0, completed: 0 },
				HARD: { total: 0, completed: 0 }
			}
		};

		challengeResults.forEach((challenge) => {
			if (challenge) {
				challenge.challenges.forEach((c) => {
					stats.total++;
					stats.byDifficulty[c.difficulty].total++;

					if (c.completed) {
						stats.completed++;
						stats.byDifficulty[c.difficulty].completed++;
					}
				});
			}
		});

		return json(stats);
	} catch (error) {
		return errorResponse(error);
	}
};
