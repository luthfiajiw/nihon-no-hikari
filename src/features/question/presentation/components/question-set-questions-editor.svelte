<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import type { QuestionAdminFormQuestion } from '$features/question/presentation/models/question-admin-content-form.model';
	import type { QuestionKanaTemplateMetadata } from '$features/question/domain/entities/question-kana-template.entity';
	let {
		questions = $bindable([]),
		skill,
		templates
	}: {
		questions: QuestionAdminFormQuestion[];
		skill: string;
		templates: QuestionKanaTemplateMetadata[];
	} = $props();
	const id = $props.id();
	const templateItems = $derived(
		templates.map((template) => ({
			value: String(template.id),
			label: `${template.script} ${template.character} · ${template.romaji} (${template.source_version})`
		}))
	);
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
		<Card.Root size="sm" class="gap-4 px-(--card-spacing)">
			<div class="flex justify-between">
				<h3 class="font-semibold">Soal {i + 1}</h3>
				<button type="button" class="text-sm text-red-700" onclick={() => questions.splice(i, 1)}>
					Hapus Soal
				</button>
			</div>
			<label class="block text-sm">
				Instruksi
				<Input bind:value={question.prompt_text} class="mt-2 h-10" />
			</label>
			<label class="block text-sm">
				Stimulus teks
				<Input bind:value={question.stimulus_text} class="mt-2 h-10" />
			</label>
			<label class="block text-sm">
				URL media stimulus
				<Input
					value={question.stimulus_media_url ?? ''}
					oninput={(e) => (question.stimulus_media_url = e.currentTarget.value || null)}
					class="mt-2 h-10"
				/>
			</label>
			<div class="admin-fields">
				<label class="block text-sm">
					Poin
					<Input bind:value={question.points} type="number" min="1" class="mt-2 h-10" />
				</label>
				<label class="block text-sm">
					Penjelasan
					<Input bind:value={question.explanation} class="mt-2 h-10" />
				</label>
			</div>
			{#if skill === 'writing'}
				<div class="text-sm">
					<label for={`${id}-template-${i}`}>Template kana</label>
					<Select.Root
						type="single"
						items={templateItems}
						value={question.stroke_template_id ?? ''}
						onValueChange={(value) => (question.stroke_template_id = value || null)}
						allowDeselect={false}
					>
						<Select.Trigger id={`${id}-template-${i}`} class="mt-2 w-full">
							<Select.Value placeholder="Pilih template" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="" label="Pilih template" />
							{#each templateItems as template (template.value)}
								<Select.Item value={template.value} label={template.label} />
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<label class="flex items-center gap-2 text-sm">
					<Checkbox bind:checked={question.show_writing_guide} />
					Tampilkan panduan goresan
				</label>
			{:else}
				<div class="space-y-2">
					<p class="text-sm font-medium">Pilihan jawaban</p>
					<RadioGroup.Root
						value={String(question.options.findIndex((option) => option.is_correct))}
						onValueChange={(value) =>
							question.options.forEach(
								(entry, index) => (entry.is_correct = String(index) === value)
							)}
						aria-label={`Jawaban benar soal ${i + 1}`}
					>
						{#each question.options as option, j (option)}
							<div
								class="grid gap-2 rounded-lg border bg-background p-2 sm:grid-cols-[auto_1fr_auto]"
							>
								<RadioGroup.Item value={String(j)} aria-label={`Jawaban benar pilihan ${j + 1}`} />
								<div class="space-y-2">
									<Input bind:value={option.label} class="h-10" placeholder={`Pilihan ${j + 1}`} />
									<Input
										type="url"
										value={option.media_url ?? ''}
										oninput={(e) => (option.media_url = e.currentTarget.value || null)}
										class="h-10"
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
					</RadioGroup.Root>
					<button
						type="button"
						class="text-sm text-primary"
						onclick={() => question.options.push({ label: '', media_url: null, is_correct: false })}
					>
						Tambah pilihan
					</button>
				</div>
			{/if}
		</Card.Root>
	{/each}
</div>
