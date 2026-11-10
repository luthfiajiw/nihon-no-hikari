<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import { ArrowLeft, Plus, Trash2 } from 'lucide-svelte';
	import type { CourseAdminLevel } from '$features/course/domain/entities/course-admin.entity';

	let {
		data,
		form
	}: {
		data: { level: CourseAdminLevel; id: string };
		form?: ManagementFormResult;
	} = $props();

	const isNew = $derived(data.id === 'new');
	const pageTitle = $derived(isNew ? 'Buat Level Baru' : `Edit Level ${data.level.code}`);

	const initial = untrack(() => data.level);
	let code = $state(initial.code ?? '');
	let name = $state(initial.name ?? '');
	let tag = $state(initial.tag ?? '');
	let description = $state(initial.description ?? '');
	let price = $state(initial.price ?? 0);
	let orderIndex = $state(initial.order_index ?? 0);
	let points = $state<Array<{ text: string }>>(
		(initial.points ?? []).map((point) => ({ text: point }))
	);

	let confirmDelete = $state(false);
	let pendingAction = $state<'save' | 'remove' | null>(null);

	function addPoint() {
		points = [...points, { text: '' }];
	}

	function removePoint(index: number) {
		points = points.filter((_, i) => i !== index);
	}

	function getPayloadString(): string {
		let collectedPoints: string[] = [];
		if (typeof document !== 'undefined') {
			const pointInputs = document.querySelectorAll<HTMLInputElement>('.level-point-input');
			if (pointInputs.length > 0) {
				collectedPoints = Array.from(pointInputs)
					.map((el) => el.value.trim())
					.filter((val) => val.length > 0);
			}
		}
		if (collectedPoints.length === 0) {
			collectedPoints = points.map((p) => p.text.trim()).filter((p) => p.length > 0);
		}

		return JSON.stringify({
			code: code.trim(),
			name: name.trim(),
			tag: tag.trim() || null,
			description: description.trim(),
			price: Number(price) || 0,
			points: collectedPoints,
			order_index: Number(orderIndex) || 0
		});
	}

	const payloadString = $derived(getPayloadString());

	function submitForm(action: 'save' | 'remove'): SubmitFunction {
		return ({ cancel, formData }) => {
			if (pendingAction) {
				cancel();
				return;
			}
			if (action === 'save') {
				formData.set('payload', getPayloadString());
			}
			pendingAction = action;
			return async ({ update }) => {
				try {
					await update({ reset: false });
				} finally {
					pendingAction = null;
				}
			};
		};
	}
</script>

<svelte:head>
	<title>{pageTitle} | Admin - Gakkobit</title>
	<meta name="description" content="Kelola informasi level JLPT, harga, dan poin manfaat kartu harga." />
</svelte:head>

<div class="admin-page space-y-6">
	<div class="flex items-center gap-4">
		<Button
			variant="outline"
			size="icon"
			type="button"
			aria-label="Kembali ke daftar level"
			onclick={() => goto(resolve('/(protected)/admin/levels'))}
		>
			<ArrowLeft class="size-4" />
		</Button>
		<ManagementPageHeader
			title={pageTitle}
			description="Atur rincian level, harga paket, dan poin-poin yang ditampilkan pada kartu paket belajar."
		/>
	</div>

	{#if form?.message}
		<p
			role="status"
			class="admin-notice rounded-lg border border-taupe-200 bg-taupe-50 p-4 text-sm text-taupe-800 dark:border-taupe-800 dark:bg-taupe-950 dark:text-taupe-200"
		>
			{form.message}
		</p>
	{/if}

	<form
		id="level-editor-form"
		method="POST"
		action="?/save"
		use:enhance={submitForm('save')}
		data-slot="card"
		data-size="default"
	>
		<div class={Card.cardVariants({ class: 'admin-page block px-(--card-spacing) space-y-6' })}>
			<input type="hidden" name="payload" value={payloadString} />

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<label class="block text-sm font-medium">
					Kode Level (e.g. N5, N4)
					<Input
						bind:value={code}
						required
						maxlength={8}
						placeholder="N5"
						class="mt-2 h-10"
					/>
				</label>
				<label class="block text-sm font-medium">
					Nama Level
					<Input
						bind:value={name}
						required
						maxlength={100}
						placeholder="JLPT N5"
						class="mt-2 h-10"
					/>
				</label>
			</div>

			<label class="block text-sm font-medium">
				Tag Kartu (Opsional)
				<Input
					bind:value={tag}
					maxlength={40}
					placeholder="Favorit Pemula"
					class="mt-2 h-10"
				/>
				<span class="mt-1 block text-xs text-muted-foreground">
					Badge kecil yang ditampilkan di pojok atas kartu harga (misal: Favorit Pemula, Populer).
				</span>
			</label>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<label class="block text-sm font-medium">
					Harga Paket (Rp)
					<Input
						type="number"
						bind:value={price}
						required
						min={0}
						max={100000000}
						class="mt-2 h-10"
					/>
					<span class="mt-1 block text-xs text-muted-foreground">
						Gunakan 0 untuk tingkat gratis.
					</span>
				</label>
				<label class="block text-sm font-medium">
					Urutan Tampilan
					<Input
						type="number"
						bind:value={orderIndex}
						required
						min={0}
						class="mt-2 h-10"
					/>
				</label>
			</div>

			<label class="block text-sm font-medium">
				Deskripsi Singkat
				<Textarea
					bind:value={description}
					placeholder="Pemula Dasar (0 → N5)..."
					maxlength={1000}
					class="mt-2 min-h-20"
				/>
			</label>

			<!-- Poin-poin Manfaat Kartu -->
			<div class="space-y-3 pt-2">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-sm font-semibold text-foreground">Poin Manfaat Kartu Harga</h3>
						<p class="text-xs text-muted-foreground">
							Daftar checklist yang ditampilkan pada kartu paket di landing page dan halaman rincian.
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={addPoint}
						class="gap-1.5"
					>
						<Plus class="size-3.5" /> Tambah Poin
					</Button>
				</div>

				{#if points.length === 0}
					<div
						class="rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground"
					>
						Belum ada poin manfaat. Klik <strong>Tambah Poin</strong> untuk menambahkan manfaat kartu.
					</div>
				{:else}
					<div class="space-y-2.5">
						{#each points as item, index (index)}
							<div class="flex items-center gap-2">
								<input
									class="level-point-input flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
									bind:value={item.text}
									placeholder={`Poin manfaat ${index + 1}`}
									maxlength={200}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label={`Hapus poin ${index + 1}`}
									class="text-destructive hover:bg-destructive/10"
									onclick={() => removePoint(index)}
								>
									<Trash2 class="size-4" />
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</form>

	<div class="flex items-center justify-between pt-2">
		<Button
			type="submit"
			form="level-editor-form"
			disabled={pendingAction !== null}
			isLoading={pendingAction === 'save'}
			class="px-6"
		>
			Simpan Level
		</Button>

		{#if !isNew}
			<div class="flex items-center gap-3">
				{#if !confirmDelete}
					<Button
						type="button"
						variant="destructive"
						onclick={() => (confirmDelete = true)}
					>
						Hapus Level
					</Button>
				{:else}
					<div class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2">
						<span class="text-xs text-destructive font-medium">Yakin ingin menghapus level ini?</span>
						<form method="POST" action="?/remove" use:enhance={submitForm('remove')}>
							<Button
								type="submit"
								size="sm"
								variant="destructive"
								disabled={pendingAction !== null}
								isLoading={pendingAction === 'remove'}
							>
								Ya, Hapus
							</Button>
						</form>
						<Button
							type="button"
							size="sm"
							variant="ghost"
							onclick={() => (confirmDelete = false)}
						>
							Batal
						</Button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>