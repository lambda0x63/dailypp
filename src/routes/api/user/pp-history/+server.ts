import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { APIError, errorResponse } from '$lib/server/errors';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		if (!locals.user) {
			throw new APIError('Unauthorized', 401);
		}

		const ppHistory = [
			{
				pp: locals.user.pp_raw,
				recorded_at: new Date().toISOString()
			}
		];

		return json(ppHistory);
	} catch (error) {
		return errorResponse(error);
	}
};
