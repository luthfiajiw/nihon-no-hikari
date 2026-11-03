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
	import { LockIcon, MailIcon, UserIcon } from 'lucide-svelte';

	import { createForm } from '@tanstack/svelte-form';
	import { DomainError } from '../domain/entities/auth.entity';
	import { capitalizeFirst } from '$lib/utils';
	import { registerUseCase } from '$dependencies/auth.dependency';
	import { resolve } from '$app/paths';

	let serverError = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	const form = createForm(() => ({
		defaultValues: {
			displayName: '',
			email: '',
			password: '',
			confirmPassword: ''
		},
		onSubmit: async ({ value }) => {
			serverError = null;
			successMessage = null;
			try {
				const result = await registerUseCase.exec({
					display_name: value.displayName.trim(),
					email: value.email.trim(),
					password: value.password,
					confirm_password: value.confirmPassword
				});

				successMessage = result.message || 'Pendaftaran berhasil! Mengalihkan ke halaman masuk...';
				setTimeout(async () => {
					await goto(resolve('/signin'));
				}, 1500);
			} catch (err) {
				serverError =
					err instanceof DomainError
						? capitalizeFirst(err.message)
						: 'Terjadi kesalahan saat pendaftaran akun.';
			}
		}
	}));
</script>

<Card.Root
	class="flex w-full flex-col justify-between gap-6 overflow-y-auto rounded-none border-0 px-8 pt-16 pb-10 shadow-2xl backdrop-blur-sm md:m-8 md:rounded-3xl lg:w-115 lg:py-10"
>
	<Card.Header class="w-full gap-2 px-0 text-center">
		<Card.Title
			class="w-full! text-center text-2xl font-semibold tracking-tight text-taupe-600 md:text-3xl"
		>
			Buat Akun Baru
		</Card.Title>
		<Card.Description class="w-full! text-center text-sm leading-6">
			Daftar akun Gakkobit kamu untuk mulai perjalananmu belajar bahasa Jepang.
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
			<FieldGroup class="gap-4">
				<form.Field
					name="displayName"
					validators={{
						onChange: ({ value }: { value: string }) => {
							if (!value?.trim()) return 'Nama tampilan tidak boleh kosong.';
							return undefined;
						}
					}}
				>
					{#snippet children(field)}
						<Field>
							<FieldLabel for="displayName">Nama Tampilan</FieldLabel>
							<InputGroup class="bg-background">
								<InputGroupAddon>
									<UserIcon class="size-4" />
								</InputGroupAddon>
								<InputGroupInput
									id="displayName"
									name={field.name}
									type="text"
									value={field.state.value}
									oninput={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									placeholder="Nama Anda"
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
									placeholder="Minimal 6 karakter"
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
					name="confirmPassword"
					validators={{
						onChangeListenTo: ['password'],
						onChange: ({ value }: { value: string }) => {
							if (!value) return 'Konfirmasi password tidak boleh kosong.';
							if (value !== form.state.values.password) return 'Konfirmasi password tidak cocok.';
							return undefined;
						}
					}}
				>
					{#snippet children(field)}
						<Field>
							<FieldLabel for="confirmPassword">Konfirmasi Password</FieldLabel>
							<InputGroup class="bg-background">
								<InputGroupAddon>
									<LockIcon class="size-4" />
								</InputGroupAddon>
								<InputGroupInput
									id="confirmPassword"
									name={field.name}
									type="password"
									value={field.state.value}
									oninput={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									placeholder="Ulangi password"
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

				<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
					{#snippet children([canSubmit, isSubmitting])}
						<Field class="mt-2 gap-4">
							<Button
								type="submit"
								class="w-full"
								disabled={!canSubmit || isSubmitting}
								isLoading={isSubmitting}
							>
								Daftar
							</Button>
							<FieldDescription class="text-center">
								Sudah punya akun? <a href={resolve('/signin')} class="underline">Masuk</a>
							</FieldDescription>
						</Field>
					{/snippet}
				</form.Subscribe>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
