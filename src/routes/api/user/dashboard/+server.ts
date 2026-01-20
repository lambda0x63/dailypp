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

		for (let i = 0; i < 7; i++) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);
			dates.push(date.toISOString().split('T')[0]);
		}

		const challengePromises = dates.map((date) =>
			kv.get<ChallengeData>(generateChallengeKey(userId, date))
		);

		const challengeResults = await Promise.all(challengePromises);

		let weekly_completed = 0;
		let today_completed = 0;
		let current_streak = 0;

		challengeResults.forEach((challenge, index) => {
			if (challenge) {
				const completed = challenge.challenges.filter((c) => c.completed).length;
				weekly_completed += completed;

				// 오늘 완료 수 (첫 번째가 오늘)
				if (index === 0) {
					today_completed = completed;
				}

				// 연속 완료 계산 (완료된 챌린지가 3개면 그 날은 완주)
				if (completed === 3) {
					if (index === current_streak) {
						current_streak++;
					}
				}
			}
		});

		return json({
			weekly_completed,
			today_completed,
			current_streak,
			pp_growth: 0
		});
	} catch (error) {
		return errorResponse(error);
	}
};
