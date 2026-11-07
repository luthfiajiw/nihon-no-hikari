<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { env } from '$env/dynamic/public';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { KeyRound, AlertCircleIcon, LoaderCircle, CheckCircle2 } from 'lucide-svelte';
	import googleLogo from '$lib/assets/images/google-logo.png';
	import { onDestroy } from 'svelte';

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

	interface Props {
		open: boolean;
		email: string;
		onSuccess?: () => void;
	}

	let { open = $bindable(false), email, onSuccess }: Props = $props();

	const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
	const clientId = env.PUBLIC_GOOGLE_CLIENT_ID;

	let step = $state<'request' | 'verify' | 'link'>('request');
	let code = $state('');
	let verificationToken = $state('');
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);
	let cooldown = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let googleContainer = $state<HTMLElement>();

	function maskEmail(val: string): string {
		if (!val) return '';
		const [local, domain] = val.split('@');
		if (!domain) return val;
		if (local.length <= 2) {
			return `${local[0]}***@${domain}`;
		}
		return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
	}

	function startCooldown() {
		cooldown = 60;
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			cooldown--;
			if (cooldown <= 0) {
				if (timerInterval) clearInterval(timerInterval);
				timerInterval = null;
			}
		}, 1000);
	}

	function resetState() {
		step = 'request';
		code = '';
		verificationToken = '';
		isLoading = false;
		errorMessage = null;
		cooldown = 0;
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	$effect(() => {
		if (!open) {
			resetState();
		}
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

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

	function initGoogleSignIn() {
		if (!clientId) {
			errorMessage = 'Google Client ID belum dikonfigurasi di lingkungan aplikasi.';
			return;
		}
		loadScript()
			.then(() => {
				const google = (window as unknown as { google: GoogleIdentity }).google;
				if (!google?.accounts?.id) return;
				google.accounts.id.initialize({
					client_id: clientId,
					callback: (response) => {
						if (response.credential) {
							handleGoogleCredential(response.credential);
						} else {
							errorMessage = 'Login dengan Google gagal. Silakan coba lagi.';
						}
					}
				});
				if (googleContainer) {
					google.accounts.id.renderButton(googleContainer, {
						type: 'standard',
						theme: 'outline',
						size: 'large',
						text: 'continue_with',
						shape: 'rectangular',
						width: 280
					});
				}
			})
			.catch(() => {
				errorMessage = 'Gagal memuat layanan Google Sign-In.';
			});
	}

	async function handleRequestCode() {
		if (isLoading) return;
		errorMessage = null;
		isLoading = true;
		try {
			const res = await fetch('?/requestLinkGoogleCode', {
				method: 'POST',
				body: new FormData()
			});
			const result: ActionResult = deserialize(await res.text());
			if (result.type === 'success') {
				step = 'verify';
				startCooldown();
			} else if (result.type === 'failure') {
				errorMessage = (result.data?.error as string) || 'Gagal mengirim kode verifikasi.';
			} else {
				errorMessage = 'Terjadi kesalahan sistem saat mengirim kode.';
			}
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
		} finally {
			isLoading = false;
		}
	}

	async function handleVerifyCode() {
		if (isLoading) return;
		const trimmedCode = code.trim();
		if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
			errorMessage = 'Masukkan 6 digit angka kode verifikasi.';
			return;
		}
		errorMessage = null;
		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('code', trimmedCode);
			const res = await fetch('?/verifyLinkGoogleCode', {
				method: 'POST',
				body: formData
			});
			const result: ActionResult = deserialize(await res.text());
			if (result.type === 'success') {
				verificationToken = (result.data?.verification_token as string) || '';
				step = 'link';
				setTimeout(() => {
					initGoogleSignIn();
				}, 100);
			} else if (result.type === 'failure') {
				errorMessage =
					(result.data?.error as string) || 'Kode verifikasi tidak valid atau telah kadaluarsa.';
			} else {
				errorMessage = 'Terjadi kesalahan sistem saat verifikasi kode.';
			}
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
		} finally {
			isLoading = false;
		}
	}

	async function handleGoogleCredential(credential: string) {
		if (isLoading) return;
		errorMessage = null;
		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('id_token', credential);
			formData.append('verification_token', verificationToken);
			const res = await fetch('?/linkGoogle', {
				method: 'POST',
				body: formData
			});
			const result: ActionResult = deserialize(await res.text());
			if (result.type === 'success') {
				await invalidateAll();
				open = false;
				onSuccess?.();
			} else if (result.type === 'failure') {
				errorMessage = (result.data?.error as string) || 'Gagal menautkan akun Google.';
			} else {
				errorMessage = 'Terjadi kesalahan sistem saat menautkan Google.';
			}
		} catch {
			errorMessage = 'Gagal terhubung ke server.';
		} finally {
			isLoading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2 text-lg font-bold">
				{#if step === 'request'}
					Tautkan Akun Google
				{:else if step === 'verify'}
					<KeyRound class="size-5 text-primary" />
					Verifikasi Kode Email
				{:else}
					<img src={googleLogo} alt="Google" class="size-5 object-contain" />
					Hubungkan Akun Google
				{/if}
			</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				{#if step === 'request'}
					Demi keamanan akun Anda, kami perlu mengirimkan kode verifikasi 6 digit ke alamat email
					terdaftar Anda sebelum menghubungkan akun Google.
				{:else if step === 'verify'}
					Masukkan kode verifikasi 6 digit yang telah kami kirimkan ke email Anda.
				{:else}
					Email Anda telah terverifikasi. Silakan lanjutkan dengan memilih akun Google Anda.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		{#if errorMessage}
			<div
				class="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive"
				role="alert"
			>
				<AlertCircleIcon class="mt-0.5 size-4 shrink-0" />
				<p class="leading-relaxed">{errorMessage}</p>
			</div>
		{/if}

		{#if step === 'request'}
			<div class="flex flex-col gap-4 py-2">
				<div class="rounded-lg border bg-muted/30 p-3 text-sm">
					<p class="text-xs text-muted-foreground">Email Tujuan:</p>
					<p class="font-semibold text-foreground">{maskEmail(email)}</p>
				</div>
			</div>
			<Dialog.Footer class="mt-4 flex flex-row justify-end gap-2 sm:justify-end">
				<Button variant="ghost" disabled={isLoading} onclick={() => (open = false)}>Batal</Button>
				<Button {isLoading} disabled={isLoading} onclick={handleRequestCode}>
					Kirim Kode Verifikasi
				</Button>
			</Dialog.Footer>
		{:else if step === 'verify'}
			<div class="flex flex-col gap-5 py-3">
				<div class="flex flex-col items-center gap-3">
					<span class="text-xs font-medium text-muted-foreground">
						Masukkan 6 digit kode yang dikirim ke email Anda
					</span>
					<div class="flex justify-center">
						<InputOTP.Root
							maxlength={6}
							bind:value={code}
							disabled={isLoading}
							onComplete={() => {
								if (code.trim().length === 6) {
									handleVerifyCode();
								}
							}}
						>
							{#snippet children({ cells })}
								<InputOTP.Group>
									{#each cells.slice(0, 3) as cell, i (i)}
										<InputOTP.Slot {cell} class="size-11 text-base font-bold" />
									{/each}
								</InputOTP.Group>
								<InputOTP.Separator />
								<InputOTP.Group>
									{#each cells.slice(3, 6) as cell, i (i + 3)}
										<InputOTP.Slot {cell} class="size-11 text-base font-bold" />
									{/each}
								</InputOTP.Group>
							{/snippet}
						</InputOTP.Root>
					</div>
				</div>

				<div class="flex items-center justify-between text-xs text-muted-foreground">
					<span>Tidak menerima kode?</span>
					{#if cooldown > 0}
						<span class="font-medium text-muted-foreground">Kirim ulang ({cooldown}s)</span>
					{:else}
						<button
							type="button"
							class="font-medium text-primary hover:underline disabled:opacity-50"
							disabled={isLoading}
							onclick={handleRequestCode}
						>
							Kirim ulang
						</button>
					{/if}
				</div>
			</div>
			<Dialog.Footer class="mt-4 flex flex-row justify-end gap-2 sm:justify-end">
				<Button variant="ghost" disabled={isLoading} onclick={() => (open = false)}>Batal</Button>
				<Button
					{isLoading}
					disabled={isLoading || code.trim().length !== 6}
					onclick={handleVerifyCode}
				>
					{#if isLoading}
						<LoaderCircle class="size-4 animate-spin" />
					{/if}
					Verifikasi Kode
				</Button>
			</Dialog.Footer>
		{:else if step === 'link'}
			<div class="flex flex-col items-center gap-4 py-6">
				<div
					class="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
				>
					<CheckCircle2 class="size-6" />
				</div>
				<div class="text-center">
					<p class="text-sm font-semibold text-foreground">Verifikasi Berhasil</p>
					<p class="text-xs text-muted-foreground">
						Silakan klik tombol Google di bawah ini untuk menyelesaikan penautan akun Anda.
					</p>
				</div>

				<div class="group relative mt-2 flex w-full justify-center">
					<div bind:this={googleContainer} class="flex justify-center"></div>
				</div>

				{#if isLoading}
					<div class="flex items-center gap-2 text-xs text-muted-foreground">
						<LoaderCircle class="size-4 animate-spin text-primary" />
						<span>Menautkan akun Google...</span>
					</div>
				{/if}
			</div>
			<Dialog.Footer class="mt-2 flex flex-row justify-end">
				<Button variant="ghost" disabled={isLoading} onclick={() => (open = false)}>Tutup</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
