<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	const toastStore = getToastStore();
	let url: string;
	let urlList: { key: string; value: string }[] = [];
	let disableSubmit: boolean = false;
	const backendUrl = env.PUBLIC_BACKEND_URL + '/url'
	onMount(() => {
		const storage = localStorage.getItem('urlList');
		if (storage) {
			const storageList: string[] = JSON.parse(storage);
			const param = storageList.join(',');
			fetchData(param);
		}
		async function fetchData(param:string): Promise<void> {
			const req = await fetch(backendUrl + '?ids=' + param);
			const data = await req.json();
			data.forEach(({ key, value }: { key: string; value: string }) => {
				urlList = [...urlList, { key, value }]
			})
		}
	})
	function copyToClipboard(url: string, e?: MouseEvent) {
		if (e) {
			e.preventDefault();
		}
		navigator.clipboard.writeText(url);
		const t: ToastSettings = {
			message: 'Copied to clipboard.',
		};
		toastStore.trigger(t);
	}
	async function handleSubmit() {
		if (url) {
			disableSubmit = true;
			const req = await fetch(backendUrl, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					originalUrl: url
				}),
			});
			const res = await req.json();
			if (res.url) {
				urlList = [{ key: res.url, value: url }, ...urlList]
				localStorage.setItem('urlList', JSON.stringify(urlList.map((val) => val.key)))
				url = '';
				const t: ToastSettings = {
					message: 'URL successfully created.',
					action: {
						label: 'Copy to clipboard',
						response: () => copyToClipboard(env.PUBLIC_BASE_URL + res.url)
					}
				};
				toastStore.trigger(t);
				disableSubmit = false;
			} else { 
				const t: ToastSettings = {
					message: res.message,
					background: 'bg-red-500'
				};
				toastStore.trigger(t);
				disableSubmit = false;
			}
		}
	}
</script>
<div class="container mt-10 h-full mx-auto flex justify-center items-center">
	<div class="space-y-5 w-full max-w-screen-md">
		<h1 class="text-4xl text-center">Mini URL Shortener</h1>
		<h2 class="text-md text-center">Enter a link to start, click on links below to copy to clipboard.</h2>
		<div class="flex flex-row gap-2">
			<input class="input p-3 w-full" type="text" name="originalUrl" placeholder="Enter a url to shorten" bind:value={url} />
			<button type="button" class="btn variant-filled" disabled={disableSubmit} on:click={handleSubmit}>Submit</button>
		</div>
		<nav class="list-nav bg-gradient-to-b from-slate-900 rounded-md to-slate-800 shadow-md">
			{#each urlList as shortenUrl}	
				<ul>
					<li class="border-b-slate-800 border-b-2">
						<a on:click={(e) => copyToClipboard(env.PUBLIC_BASE_URL + shortenUrl.key, e)} class="flex md:flex-row flex-col" href={env.PUBLIC_BASE_URL + shortenUrl.key} target="_blank">
							<!-- <span class="md:w-1/2 w-full">Shortened URL: {env.PUBLIC_BASE_URL + shortenUrl.key}</span> -->
							<span class="w-full text-ellipsis overflow-hidden md:whitespace-nowrap">{`${env.PUBLIC_BASE_URL + shortenUrl.key} → ${shortenUrl.value}`}</span>
						</a>
					</li>
				</ul>
			{/each}
		</nav>
	</div>
</div>
