import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { APIError, errorResponse } from '$lib/server/errors';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			throw new APIError('Unauthorized', 401);
		}

		const { beatmap_id, pattern_type, difficulty_feel } = await request.json();

		console.log('Beatmap feedback:', {
			user_id: locals.user.id,
			beatmap_id,
			pattern_type,
			difficulty_feel,
			timestamp: new Date().toISOString()
		});

		return json({ success: true });
	} catch (error) {
		return errorResponse(error);
	}
};
