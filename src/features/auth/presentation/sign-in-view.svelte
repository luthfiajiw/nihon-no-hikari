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

	import { createForm } from '@tanstack/svelte-form';
	import { DomainError } from '../domain/entities/auth.entity';
	import { capitalizeFirst } from '$lib/utils';
	import { signInUseCase } from '$dependencies/auth.dependency';
	import { resolve } from '$app/paths';
	import logo from '$lib/assets/images/gakkobit-full-logo.png';

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
				const result = await signInUseCase.exec({
					email: value.email,
					password: value.password
				});

				await goto(resolve(result.data.role === 'Admin' ? '/admin' : '/'), { invalidateAll: true });
			} catch (err) {
				serverError =
					err instanceof DomainError
						? capitalizeFirst(err.message)
						: 'Terjadi kesalahan saat sign in.';
			}
		}
	}));
</script>

<Card.Root
	class="flex w-full flex-col justify-between gap-8 rounded-none border-0 px-8 pt-28 pb-10 shadow-2xl backdrop-blur-sm md:m-8 md:rounded-3xl lg:w-115 lg:py-12"
>
	<Card.Header class="w-full gap-3 px-0 text-center">
		<!-- <img src={logo} alt="Logo Gakkobit" class="mx-auto h-12 object-contain" /> -->
		<Card.Title class="w-full! text-center text-3xl font-semibold tracking-tight text-taupe-600">
			<p class="hidden md:block">Selamat Datang</p>
			<img src={logo} alt="Logo Gakkobit" class="mx-auto block h-12 object-contain md:hidden" />
		</Card.Title>
		<Card.Description class="w-full! text-center text-sm leading-6">
			Masuk ke akun Gakkobit kamu untuk melanjutkan perjalananmu belajar bahasa Jepang.
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex h-full w-full flex-col justify-center px-0">
		{#if serverError}
			<div
				class="mb-4 w-full rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive"
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
			<FieldGroup class="gap-5">
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
							<InputGroup class="bg-background">
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
							<InputGroup class="bg-background">
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
						<Field class="mt-1 gap-4">
							<Button
								type="submit"
								class="w-full"
								disabled={!canSubmit || isSubmitting}
								isLoading={isSubmitting}
							>
								Login
							</Button>
							<FieldDescription class="text-center">
								Don't have an account? <a href={resolve('/register')} class="underline">Sign up</a>
							</FieldDescription>
						</Field>
					{/snippet}
				</form.Subscribe>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
