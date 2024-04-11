import { env } from '$env/dynamic/public';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const req = await fetch(env.PUBLIC_BACKEND_URL + '/url/' + params.id);
    const url = await req.json();
    
	if (url.url) {
		return redirect(302, url.url);
	}

	return error(404, 'Not found');
}