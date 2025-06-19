import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { APIError, errorResponse } from '$lib/server/errors';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw new APIError('Unauthorized', 401);
	}

	return json({
		id: locals.user.id,
		name: locals.user.name,
		pp_raw: locals.user.pp_raw,
		settings: locals.user.settings
	});
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const data = await request.json();

		console.log('User settings update:', data);

		return new Response(null, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
};
