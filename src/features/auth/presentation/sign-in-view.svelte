<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
	import { LockIcon, MailIcon } from 'lucide-svelte';
	import logo from '$lib/assets/images/nnh-logo.png';

	import { createForm } from '@tanstack/svelte-form';
	import { DomainError } from '../domain/entities/auth.entity';
	import { capitalizeFirst } from '$lib/utils';
	import { signInUseCase } from '../../../dependencies/auth.dependency';
	import { resolve } from '$app/paths';

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
			try {
				await signInUseCase.exec({
					email: value.email,
					password: value.password
				});

				await goto(resolve('/'), { invalidateAll: true });
			} catch (err) {
				serverError =
					err instanceof DomainError
						? capitalizeFirst(err.message)
						: 'Terjadi kesalahan saat sign in.';
			}
		}
	}));
</script>

<Card.Root class="w-full max-w-lg p-8 shadow-lg">
	<Card.Header class="flex flex-col items-center pb-8">
		<img src={logo} alt="Logo" class="mb-4 h-9" />
		<Card.Title class="text-xl font-semibold text-primary">Selamat Datang</Card.Title>
		<Card.Description class="text-center">
			Masuk ke akun Nihon no Hikari kamu untuk melanjutkan perjalanan belajar bahasa Jepang.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if serverError}
			<div
				class="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive"
			>
				{serverError}
			</div>
		{/if}

		{#if successMessage}
			<div
				class="mb-4 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
			>
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
								<span class="text-xs font-medium text-destructive">
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
								<span class="text-xs font-medium text-destructive">
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
							<Button
								type="submit"
								class="w-full"
								disabled={!canSubmit || isSubmitting}
								isLoading={isSubmitting}
							>
								Login
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
