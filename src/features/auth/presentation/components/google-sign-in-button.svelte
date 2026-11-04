<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';
	import { googleSignInUseCase } from '$dependencies/auth.dependency';
	import { capitalizeFirst } from '$lib/utils';
	import { onMount } from 'svelte';
	import { DomainError } from '../../domain/entities/auth.entity';

	// Minimal typing for the Google Identity Services script (loaded at runtime).
	interface GoogleIdentity {
		accounts: {
			id: {
				initialize(config: {
					client_id: string;
					callback: (response: { credential?: string }) => void;
				}): void;
				renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
			};
		};
	}

	const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
	const clientId = env.PUBLIC_GOOGLE_CLIENT_ID;

	let { onError }: { onError?: (message: string | null) => void } = $props();

	let container = $state<HTMLElement>();

	function loadScript(): Promise<void> {
		if ((window as unknown as { google?: GoogleIdentity }).google?.accounts) {
			return Promise.resolve();
		}
		return new Promise((resolveLoad, reject) => {
			let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
			if (!script) {
				script = document.createElement('script');
				script.src = SCRIPT_SRC;
				script.async = true;
				document.head.appendChild(script);
			}
			script.addEventListener('load', () => resolveLoad(), { once: true });
			script.addEventListener('error', () => reject(new Error('gsi')), { once: true });
		});
	}

	async function handleCredential(response: { credential?: string }) {
		onError?.(null);
		if (!response.credential) {
			onError?.('Login dengan Google gagal. Silakan coba lagi.');
			return;
		}
		try {
			const result = await googleSignInUseCase.exec({ idToken: response.credential });
			await goto(resolve(result.data.role === 'Admin' ? '/admin' : '/'), { invalidateAll: true });
		} catch (err) {
			onError?.(
				err instanceof DomainError
					? capitalizeFirst(err.message)
					: 'Terjadi kesalahan saat sign in dengan Google.'
			);
		}
	}

	onMount(() => {
		if (!clientId) return;
		loadScript()
			.then(() => {
				const google = (window as unknown as { google: GoogleIdentity }).google;
				google.accounts.id.initialize({ client_id: clientId, callback: handleCredential });
				if (container) {
					google.accounts.id.renderButton(container, {
						type: 'standard',
						theme: 'outline',
						size: 'large',
						text: 'continue_with',
						shape: 'rectangular',
						width: container.clientWidth || 320
					});
				}
			})
			.catch(() => onError?.('Gagal memuat Google Sign-In.'));
	});
</script>

{#if clientId}
	<div class="mb-4 flex flex-col gap-4">
		<div bind:this={container} class="flex w-full justify-center"></div>
		<div class="flex items-center gap-3 text-xs text-muted-foreground">
			<span class="h-px flex-1 bg-border"></span>
			<span>atau</span>
			<span class="h-px flex-1 bg-border"></span>
		</div>
	</div>
{/if}
