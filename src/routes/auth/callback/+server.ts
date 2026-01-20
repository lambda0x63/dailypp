import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';
import { DEFAULT_USER_SETTINGS } from '$lib/types';

export const GET = async ({ url, cookies }: RequestEvent) => {
	const code = url.searchParams.get('code');

	if (!code) {
		return new Response(null, {
			status: 303,
			headers: { Location: '/?error=no_code' }
		});
	}

	try {
		// osu! OAuth 토큰 요청
		const tokenResponse = await fetch('https://osu.ppy.sh/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify({
				client_id: OSU_CLIENT_ID,
				client_secret: OSU_CLIENT_SECRET,
				code,
				grant_type: 'authorization_code',
				redirect_uri: `${url.origin}/auth/callback`
			})
		});

		if (!tokenResponse.ok) {
			console.error('Token response error:', await tokenResponse.text());
			return new Response(null, {
				status: 303,
				headers: { Location: '/?error=token_failed' }
			});
		}

		const { access_token } = await tokenResponse.json();

		// osu! 유저 정보 요청
		const userResponse = await fetch('https://osu.ppy.sh/api/v2/me', {
			headers: {
				Authorization: `Bearer ${access_token}`
			}
		});

		if (!userResponse.ok) {
			return new Response(null, {
				status: 303,
				headers: { Location: '/?error=user_info_failed' }
			});
		}

		const userData = await userResponse.json();

		// JWT 토큰 생성 (DB 저장 없이)
		const token = jwt.sign(
			{
				id: userData.id,
				name: userData.username,
				pp_raw: userData.statistics.pp,
				settings: DEFAULT_USER_SETTINGS
			},
			AUTH_SECRET,
			{ expiresIn: '7d' }
		);

		// 쿠키에 JWT 토큰 설정
		cookies.set('jwt', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7일
		});

		return new Response(null, {
			status: 303,
			headers: { Location: '/dashboard' }
		});
	} catch (error) {
		console.error('Auth callback error:', error);
		return new Response(null, {
			status: 303,
			headers: { Location: '/?error=auth_failed' }
		});
	}
};
