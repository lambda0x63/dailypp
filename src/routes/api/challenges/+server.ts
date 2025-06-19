import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { kv, generateChallengeKey } from '$lib/server/kv';
import { APIError, errorResponse } from '$lib/server/errors';
import { osuApi } from '$lib/server/osu-api';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		if (!locals.user) {
			throw new APIError('Unauthorized', 401);
		}

		// 오늘 날짜 키 생성
		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
		const challengeKey = generateChallengeKey(locals.user.id, today);

		// 캐시된 챌린지 확인
		const existingChallenge = await kv.get(challengeKey);
		if (existingChallenge) {
			return json(existingChallenge);
		}

		// 새로운 챌린지 생성
		const [easyBeatmap, normalBeatmap, hardBeatmap] = await Promise.all([
			osuApi.findSuitableBeatmap(locals.user.pp_raw, 'EASY', locals.user.id),
			osuApi.findSuitableBeatmap(locals.user.pp_raw, 'NORMAL', locals.user.id),
			osuApi.findSuitableBeatmap(locals.user.pp_raw, 'HARD', locals.user.id)
		]);

		const challenges = [
			{
				beatmap_id: easyBeatmap.id,
				difficulty: 'EASY',
				completed: false,
				beatmap: {
					title: easyBeatmap.title,
					version: easyBeatmap.version,
					cover_url: easyBeatmap.cover_url || '',
					creator: easyBeatmap.creator,
					difficulty_rating: easyBeatmap.difficulty_rating,
					bpm: easyBeatmap.bpm,
					total_length: easyBeatmap.total_length
				}
			},
			{
				beatmap_id: normalBeatmap.id,
				difficulty: 'NORMAL',
				completed: false,
				beatmap: {
					title: normalBeatmap.title,
					version: normalBeatmap.version,
					cover_url: normalBeatmap.cover_url || '',
					creator: normalBeatmap.creator,
					difficulty_rating: normalBeatmap.difficulty_rating,
					bpm: normalBeatmap.bpm,
					total_length: normalBeatmap.total_length
				}
			},
			{
				beatmap_id: hardBeatmap.id,
				difficulty: 'HARD',
				completed: false,
				beatmap: {
					title: hardBeatmap.title,
					version: hardBeatmap.version,
					cover_url: hardBeatmap.cover_url || '',
					creator: hardBeatmap.creator,
					difficulty_rating: hardBeatmap.difficulty_rating,
					bpm: hardBeatmap.bpm,
					total_length: hardBeatmap.total_length
				}
			}
		];

		const challengeData = {
			user_id: locals.user.id,
			date: today,
			challenges,
			created_at: new Date().toISOString()
		};

		// 24시간 TTL로 저장 (86400초)
		await kv.setex(challengeKey, 86400, challengeData);

		return json(challengeData);
	} catch (error) {
		return errorResponse(error);
	}
};
