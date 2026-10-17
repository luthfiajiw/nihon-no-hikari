<script lang="ts">
	import type { Question } from '../models/admin-content-form.model';
	import type { AdminContentRecord } from '../../domain/entities/admin.entity';
	let {
		questions = $bindable([]),
		skill,
		templates
	}: { questions: Question[]; skill: string; templates: AdminContentRecord[] } = $props();
	function addQuestion() {
		questions.push({
			question_type: skill === 'reading' ? 'multiple_choice' : 'stroke_writing',
			prompt_text: '',
			stimulus_text: '',
			stimulus_media_url: null,
			explanation: '',
			points: 1,
			stroke_template_id: null,
			show_writing_guide: true,
			options:
				skill === 'reading'
					? [
							{ label: '', media_url: null, is_correct: true },
							{ label: '', media_url: null, is_correct: false }
						]
					: []
		});
	}
</script>

<div class="admin-stack border-t pt-4">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold">Soal ({questions.length})</h2>
		<button type="button" onclick={addQuestion} class="rounded-lg border px-3 py-2 text-sm">
			Tambah Soal
		</button>
	</div>
	{#each questions as question, i (question)}
		<div class="admin-stack rounded-xl border bg-slate-50 p-4">
			<div class="flex justify-between">
				<h3 class="font-semibold">Soal {i + 1}</h3>
				<button type="button" class="text-sm text-red-700" onclick={() => questions.splice(i, 1)}>
					Hapus Soal
				</button>
			</div>
			<label class="block text-sm">
				Instruksi
				<input bind:value={question.prompt_text} class="admin-field" />
			</label>
			<label class="block text-sm">
				Stimulus teks
				<input bind:value={question.stimulus_text} class="admin-field" />
			</label>
			<label class="block text-sm">
				URL media stimulus
				<input
					value={question.stimulus_media_url ?? ''}
					oninput={(e) => (question.stimulus_media_url = e.currentTarget.value || null)}
					class="admin-field"
				/>
			</label>
			<div class="admin-fields">
				<label class="block text-sm">
					Poin
					<input bind:value={question.points} type="number" min="1" class="admin-field" />
				</label>
				<label class="block text-sm">
					Penjelasan
					<input bind:value={question.explanation} class="admin-field" />
				</label>
			</div>
			{#if skill === 'writing'}
				<label class="block text-sm">
					Template kana
					<select bind:value={question.stroke_template_id} class="admin-field">
						<option value={null}>Pilih template</option>
						{#each templates as template (template.id)}
							<option value={String(template.id)}>
								{template.script}
								{template.character} · {template.romaji} ({template.source_version})
							</option>
						{/each}
					</select>
				</label>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={question.show_writing_guide} />
					Tampilkan panduan goresan
				</label>
			{:else}
				<div class="space-y-2">
					<p class="text-sm font-medium">Pilihan jawaban</p>
					{#each question.options as option, j (option)}
						<div class="grid gap-2 rounded-lg border bg-white p-2 sm:grid-cols-[auto_1fr_auto]">
							<input
								type="radio"
								name={`correct-${i}`}
								checked={option.is_correct}
								onchange={() =>
									question.options.forEach((entry, index) => (entry.is_correct = index === j))}
								aria-label={`Jawaban benar pilihan ${j + 1}`}
							/>
							<div class="space-y-2">
								<input
									bind:value={option.label}
									class="w-full rounded-lg border px-3 py-2"
									placeholder={`Pilihan ${j + 1}`}
								/>
								<input
									type="url"
									value={option.media_url ?? ''}
									oninput={(e) => (option.media_url = e.currentTarget.value || null)}
									class="w-full rounded-lg border px-3 py-2"
									placeholder="URL media pilihan (opsional)"
								/>
							</div>
							<button
								type="button"
								class="text-sm text-red-700"
								onclick={() => question.options.splice(j, 1)}
							>
								Hapus
							</button>
						</div>
					{/each}
					<button
						type="button"
						class="text-sm text-blue-700"
						onclick={() => question.options.push({ label: '', media_url: null, is_correct: false })}
					>
						Tambah pilihan
					</button>
				</div>
			{/if}
		</div>
	{/each}
</div>
