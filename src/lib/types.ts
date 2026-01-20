export interface JWTPayload {
	id: string;
	name: string;
	pp_raw: number;
	osu_id: string;
	settings: UserSettings;
}

export interface User {
	osu_id: string;
	username: string;
	pp_raw: number;
	settings: UserSettings;
}

export interface ChallengeMap {
	beatmap: {
		title: string;
		version: string;
		cover_url: string;
		creator: string;
		difficulty_rating: number;
		bpm: number;
		total_length: number;
	};
	difficulty: 'EASY' | 'NORMAL' | 'HARD';
	beatmap_id: string;
	completed: boolean;
	completed_at?: string;
	score?: {
		score: number;
		accuracy: number;
		max_combo: number;
		rank: string;
		created_at: string;
		pp: number;
	};
}

// 챌린지 데이터 타입 (KV용)
export interface ChallengeData {
	user_id: string;
	date: string;
	challenges: ChallengeMap[];
	created_at: string;
}

export const DIFFICULTY_FACTOR = {
	EASY: {
		MIN: 1.0,
		MAX: 1.1,
		BASE_PP: 20
	},
	NORMAL: {
		MIN: 1.1,
		MAX: 1.2,
		BASE_PP: 30
	},
	HARD: {
		MIN: 1.2,
		MAX: 1.3,
		BASE_PP: 40
	}
} as const;

export const MIN_DIFFICULTY = {
	EASY: 1.5,
	NORMAL: 2.0,
	HARD: 2.5
} as const;

export const MAP_CRITERIA = {
	MIN_PLAYCOUNT: 1000,
	LENGTH: {
		MIN: 60,
		MAX: 300
	},
	RECENT_DAYS: 30
} as const;

export interface Beatmap {
	id: string;
	beatmapset_id: string;
	title: string;
	artist: string;
	version: string;
	difficulty_rating: number;
	bpm: number;
	total_length: number;
	creator: string;
	cover_url?: string;
	preview_url?: string;
}

export interface Score {
	score: number;
	accuracy: number;
	max_combo: number;
	rank: string;
	created_at: string;
	pp: number;
}

// 난이도 타입 정의
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';
export type OsuRank = 'C' | 'B' | 'A' | 'S' | 'SH' | 'ANY';

// UserSettings 인터페이스
export interface UserSettings {
	targetRanks: {
		EASY: string;
		NORMAL: string;
		HARD: string;
	};
}

// 기본 설정값
export const DEFAULT_USER_SETTINGS: UserSettings = {
	targetRanks: {
		EASY: 'S',
		NORMAL: 'A',
		HARD: 'B'
	}
};
