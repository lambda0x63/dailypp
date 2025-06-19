import type { LayoutServerLoad } from './$types';
import jwt from 'jsonwebtoken';
import { AUTH_SECRET } from '$env/static/private';
import { DEFAULT_USER_SETTINGS } from '$lib/types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const token = cookies.get('jwt');
	console.log('Layout Server Load - JWT Token:', token);

	if (!token) {
		console.log('No JWT token found');
		return { user: null };
	}

	try {
		const decoded = jwt.verify(token, AUTH_SECRET) as any;
		console.log('Decoded JWT:', decoded);

		const userData = {
			id: decoded.id,
			name: decoded.name,
			pp_raw: decoded.pp_raw,
			settings: decoded.settings || DEFAULT_USER_SETTINGS
		};

		console.log('Returning user data:', userData);
		return { user: userData };
	} catch (error) {
		console.error('JWT verification failed:', error);
		cookies.delete('jwt', { path: '/' });
		return { user: null };
	}
};
