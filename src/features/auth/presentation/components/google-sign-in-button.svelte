<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';
	import { googleSignInUseCase } from '$dependencies/auth.dependency';
	import { capitalizeFirst } from '$lib/utils';
	import { onMount } from 'svelte';
	import { DomainError } from '../../domain/entities/auth.entity';
	import Button from '$lib/components/ui/button/button.svelte';
	import googleLogo from '$lib/assets/images/google-logo.png';

	// Minimal typing for the Google Identity Services script (loaded at runtime).
	interface GoogleIdentity {
		accounts: {
			id: {
				initialize(config: {
					client_id: string;
					callback: (response: { credential?: string }) => void;
				}): void;
				renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
				prompt?: () => void;
			};
		};
	}

	const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
	const clientId = env.PUBLIC_GOOGLE_CLIENT_ID;

	let { onError }: { onError?: (message: string | null) => void } = $props();

	let container = $state<HTMLElement>();
	let isLoading = $state(false);
	let isScriptLoaded = $state(false);

	function loadScript(): Promise<void> {
		if ((window as unknown as { google?: GoogleIdentity }).google?.accounts) {
			isScriptLoaded = true;
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
			script.addEventListener(
				'load',
				() => {
					isScriptLoaded = true;
					resolveLoad();
				},
				{ once: true }
			);
			script.addEventListener('error', () => reject(new Error('gsi')), { once: true });
		});
	}

	async function handleCredential(response: { credential?: string }) {
		onError?.(null);
		if (!response.credential) {
			onError?.('Login dengan Google gagal. Silakan coba lagi.');
			return;
		}
		isLoading = true;
		try {
			const result = await googleSignInUseCase.exec({ idToken: response.credential });
			await goto(resolve(result.data.role === 'Admin' ? '/admin' : '/dashboard'), { invalidateAll: true });
		} catch (err) {
			isLoading = false;
			onError?.(
				err instanceof DomainError
					? capitalizeFirst(err.message)
					: 'Terjadi kesalahan saat sign in dengan Google.'
			);
		}
	}

	function handleClick() {
		if (isLoading) return;
		if (!clientId) {
			onError?.('Google Client ID tidak terkonfigurasi.');
			return;
		}
		if (!isScriptLoaded) {
			onError?.('Google Sign-In sedang dimuat atau diblokir.');
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
						width: 400
					});
				}
			})
			.catch(() => onError?.('Gagal memuat Google Sign-In.'));
	});
</script>

{#if clientId}
	<div class="mb-3 flex w-full flex-col gap-4">
		<div class="group relative w-full">
			<Button
				type="button"
				variant="secondary"
				class="w-full gap-2.5 group-hover:bg-[color-mix(in_oklch,var(--color-secondary),var(--color-foreground)_5%)] group-active:translate-y-1 group-active:shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]"
				{isLoading}
				disabled={isLoading}
				onclick={handleClick}
			>
				{#if !isLoading}
					<img
						src={googleLogo}
						alt="Google"
						class="absolute left-4 size-4 shrink-0 object-contain"
					/>
				{/if}
				<span>Lanjutkan dengan Google</span>
			</Button>

			<div
				bind:this={container}
				class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center overflow-hidden rounded-xl [&_iframe]:scale-125 [&>div]:scale-125"
				style="opacity: 0.0001;"
				class:pointer-events-none={isLoading}
				aria-hidden="true"
			></div>
		</div>

		<div class="flex items-center gap-3 text-xs text-muted-foreground">
			<span class="h-px flex-1 bg-border"></span>
			<span>atau</span>
			<span class="h-px flex-1 bg-border"></span>
		</div>
	</div>
{/if}
