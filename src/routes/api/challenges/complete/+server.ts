import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { kv, generateChallengeKey } from '$lib/server/kv';
import { APIError, errorResponse } from '$lib/server/errors';
import { osuApi } from '$lib/server/osu-api';

// 타입 정의 추가
interface Challenge {
	beatmap_id: string;
	difficulty: 'EASY' | 'NORMAL' | 'HARD';
	completed: boolean;
	completed_at?: string;
	score?: any;
	beatmap: {
		title: string;
		version: string;
		cover_url: string;
		creator: string;
		difficulty_rating: number;
		bpm: number;
		total_length: number;
	};
}

interface ChallengeData {
	user_id: string;
	date: string;
	challenges: Challenge[];
	created_at: string;
}

// 랭크 값 매핑
const RANK_VALUES: Record<string, number> = {
	C: 1,
	B: 2,
	A: 3,
	S: 4,
	SH: 5,
	ANY: 0
} as const;

function isValidOsuRank(rank: string): boolean {
	return ['C', 'B', 'A', 'S', 'SH', 'ANY'].includes(rank);
}

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			throw new APIError('Unauthorized', 401);
		}

		const data = await request.json();
		const { beatmap_id } = data;

		// 오늘의 챌린지 가져오기
		const today = new Date().toISOString().split('T')[0];
		const challengeKey = generateChallengeKey(locals.user.id, today);
		const challenge = await kv.get<ChallengeData>(challengeKey);

		if (!challenge) {
			throw new APIError('Challenge not found', 404);
		}

		// 현재 챌린지 찾기
		const currentChallenge = challenge.challenges.find(
			(c: Challenge) => c.beatmap_id === beatmap_id
		);

		if (!currentChallenge) {
			throw new APIError('Challenge not found', 404);
		}

		// osu! API를 통해 최근 플레이 기록 확인
		const recentScore = await osuApi.getUserRecentScore(locals.user.id, beatmap_id);

		if (!recentScore) {
			throw new APIError('최근 플레이 기록을 찾을 수 없습니다', 404);
		}

		// 사용자의 목표 랭크와 비교
		const targetRank = locals.user.settings?.targetRanks?.[currentChallenge.difficulty] || 'ANY';

		if (targetRank !== 'ANY') {
			if (!isValidOsuRank(recentScore.rank) || !isValidOsuRank(targetRank)) {
				throw new APIError('Invalid rank value', 500);
			}

			const achievedRankValue = RANK_VALUES[recentScore.rank];
			const targetRankValue = RANK_VALUES[targetRank];

			if (achievedRankValue < targetRankValue) {
				throw new APIError(`${targetRank} 랭크 이상을 달성해야 합니다`, 400);
			}
		}

		// 챌린지 완료 처리
		const completed_at = new Date().toISOString();
		currentChallenge.completed = true;
		currentChallenge.completed_at = completed_at;
		currentChallenge.score = recentScore;

		// KV에 업데이트된 데이터 저장
		await kv.setex(challengeKey, 86400, challenge);

		return json({
			verified: true,
			completed_at,
			score: recentScore
		});
	} catch (error) {
		return errorResponse(error);
	}
};
