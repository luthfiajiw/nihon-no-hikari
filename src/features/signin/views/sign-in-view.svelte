<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { FieldGroup, Field, FieldLabel, FieldDescription } from '$lib/components/ui/field/index.js';
	import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
	import { LoaderCircle, LockIcon, MailIcon } from 'lucide-svelte';
	import logo from '$lib/assets/images/nnh-logo.png';

	import { createForm } from '@tanstack/svelte-form';
	// import { SignInUseCase } from '../domain/usecases/sign-in.usecase';
	// import type { AuthRepository } from '../domain/repositories/auth.repository';
	// import { AuthRepositoryImpl } from '../data/repositories/auth.repository.impl';

	interface Props {
		// authRepository?: AuthRepository;
		onSuccess?: (accessToken: string) => void;
	}

	// let { authRepository = new AuthRepositoryImpl(), onSuccess }: Props = $props();
	let { onSuccess }: Props = $props();

	// const signInUseCase = $derived(new SignInUseCase(authRepository));

	let serverError = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	const form = createForm(() => ({
		defaultValues: {
			email: '',
			password: ''
		},
		onSubmit: async ({ value }) => {
			serverError = null;
			successMessage = null;
			// try {
			// 	const result = await signInUseCase.execute({
			// 		email: value.email,
			// 		password: value.password
			// 	});
			// 	successMessage = 'Sign in berhasil! Mengalihkan...';
				if (onSuccess) {
					onSuccess(value.email);
				}
			// } catch (err) {
			// 	if (err instanceof Error) {
			// 		serverError = err.message || 'Terjadi kesalahan saat sign in.';
			// 	}
			// }
		}
	}));
</script>

<Card.Root class="w-full max-w-lg p-8 shadow-lg">
	<Card.Header class="flex flex-col items-center pb-8">
		<img src={logo} alt="Logo" class="mb-4 h-9" />
		<Card.Title class="text-primary text-xl font-semibold">Selamat Datang</Card.Title>
		<Card.Description class="text-center">
			Masuk ke akun Nihon no Hikari kamu untuk melanjutkan perjalanan belajar bahasa Jepang.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if serverError}
			<div class="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20">
				{serverError}
			</div>
		{/if}

		{#if successMessage}
			<div class="mb-4 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-600 font-medium border border-emerald-500/20 dark:text-emerald-400">
				{successMessage}
			</div>
		{/if}

		<form
			onsubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<FieldGroup class="gap-4">
				<form.Field
					name="email"
					validators={{
						onChange: ({ value }: { value: string }) => {
							if (!value) return 'Email tidak boleh kosong.';
							if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email tidak valid.';
							return undefined;
						}
					}}
				>
					{#snippet children(field)}
						<Field>
							<FieldLabel for="email">Email</FieldLabel>
							<InputGroup>
								<InputGroupAddon>
									<MailIcon class="size-4" />
								</InputGroupAddon>
								<InputGroupInput
									id="email"
									name={field.name}
									type="email"
									value={field.state.value}
									oninput={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									placeholder="nama@email.com"
								/>
							</InputGroup>
							{#if field.state.meta.isTouched && field.state.meta.errors.length}
								<span class="text-xs text-destructive font-medium">
									{field.state.meta.errors.join(', ')}
								</span>
							{/if}
						</Field>
					{/snippet}
				</form.Field>

				<form.Field
					name="password"
					validators={{
						onChange: ({ value }: { value: string }) => {
							if (!value) return 'Password tidak boleh kosong.';
							if (value.length < 6) return 'Password minimal 6 karakter.';
							return undefined;
						}
					}}
				>
					{#snippet children(field)}
						<Field>
							<FieldLabel for="password">Password</FieldLabel>
							<InputGroup>
								<InputGroupAddon>
									<LockIcon class="size-4" />
								</InputGroupAddon>
								<InputGroupInput
									id="password"
									name={field.name}
									type="password"
									value={field.state.value}
									oninput={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									placeholder="Masukkan password"
								/>
							</InputGroup>
							{#if field.state.meta.isTouched && field.state.meta.errors.length}
								<span class="text-xs text-destructive font-medium">
									{field.state.meta.errors.join(', ')}
								</span>
							{/if}
							<a href="##" class="ms-auto inline-block text-right text-sm underline">
								Forgot your password?
							</a>
						</Field>
					{/snippet}
				</form.Field>

				<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
					{#snippet children([canSubmit, isSubmitting])}
						<Field>
							<Button type="submit" class="w-full" disabled={!canSubmit || isSubmitting}>
								{#if isSubmitting}
									<LoaderCircle class="mr-2 size-4 animate-spin" />
									Memproses...
								{:else}
									Login
								{/if}
							</Button>
							<FieldDescription class="text-center">
								Don't have an account? <a href="##">Sign up</a>
							</FieldDescription>
						</Field>
					{/snippet}
				</form.Subscribe>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>