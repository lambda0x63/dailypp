import { sequence } from '@sveltejs/kit/hooks';
import jwt from 'jsonwebtoken';
import type { Handle } from '@sveltejs/kit';
import { AUTH_SECRET } from '$env/static/private';
import { DEFAULT_USER_SETTINGS } from '$lib/types';

interface JWTUserPayload {
	id: string;
	name: string;
	pp_raw: number;
	settings?: {
		targetRanks: {
			EASY: string;
			NORMAL: string;
			HARD: string;
		};
	};
	iat?: number;
	exp?: number;
}

export const handleAuth: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('jwt');

	if (token) {
		try {
			const decoded = jwt.verify(token, AUTH_SECRET) as JWTUserPayload;

			event.locals.user = {
				id: decoded.id,
				name: decoded.name,
				pp_raw: decoded.pp_raw,
				settings: decoded.settings || DEFAULT_USER_SETTINGS
			};
		} catch (error) {
			console.error('JWT verification failed:', error);
			event.cookies.delete('jwt', { path: '/' });
		}
	}

	return resolve(event);
};

const handleErrors: Handle = async ({ event, resolve }) => {
	try {
		return await resolve(event);
	} catch (error) {
		console.error('Server error:', error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'Internal server error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};

export const handle = sequence(handleAuth, handleErrors);
