<script>
	import {base} from '$app/paths';
	import {initAuth, session, signIn, signOut, isOwner, ownerEmail} from '$lib/config/auth.svelte.js';
	import {
		adminState,
		listCards,
		blankCard,
		saveCard,
		deleteCard,
		duplicateCard,
		uploadPhoto,
		removePhoto,
		validateCard,
		slugify,
		photoPublicUrl
	} from '$lib/config/admin.svelte.js';

	initAuth();

	// Pull the card list as soon as the owner session is confirmed, so the
	// sidebar is populated without anyone having to press reload.
	let listLoaded = false;
	$effect(() => {
		if (isOwner() && !listLoaded) {
			listLoaded = true;
			listCards();
		}
	});

	let email = $state('');
	let password = $state('');

	let draft = $state(null);
	let problems = $state([]);
	let saved = $state(false);
	let filter = $state('');

	// Two settings fields are edited as raw text rather than structured inputs:
	// the wish lines (one per line) and the closing rules (json).
	let wishLinesText = $state('');
	let rulesText = $state('');
	let themesText = $state('');

	const splitWishLines = () => {
		if (!draft) return;
		draft.settings.greet.wishLines = wishLinesText
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
	};

	// The finale themes are emoji pairs keyed by the last planner stage; a flat
	// "key emoji emoji" list is far easier to edit than nested json.
	const applyThemes = () => {
		if (!draft) return;
		for (const line of themesText.split('\n')) {
			const [key, left, right] = line.trim().split(/\s+/);
			if (key && left && right) draft.settings.finale.themes[key] = [left, right];
		}
		saved = false;
	};

	const applyRules = () => {
		if (!draft) return;
		try {
			draft.settings.finale.closing.rules = JSON.parse(rulesText);
		} catch {
			// keep the last valid rules until the json is fixed
		}
	};

	let visibleRows = $derived(
		adminState.rows.filter((row) =>
			filter.trim() ? `${row.name} ${row.slug}`.toLowerCase().includes(filter.trim().toLowerCase()) : true,
		),
	);

	// ---- generic settings editor -------------------------------------------
	// Every string/number leaf in settings is editable, discovered by walking
	// the object rather than hand-listed — so anything new in defaults.js shows
	// up here automatically. The planner stages and closing rules have their own
	// editors below, so the walk skips them.
	const OWN_EDITORS = new Set(['planner.stages', 'finale.closing.rules']);

	const getPath = (obj, path) => path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

	const setPath = (obj, path, value) => {
		const keys = path.split('.');
		let cursor = obj;
		for (const key of keys.slice(0, -1)) cursor = cursor[key];
		cursor[keys[keys.length - 1]] = value;
	};

	// Nice labels for the fields people touch most; the rest are prettified
	// from their path so nothing is left unlabelled.
	const LABELS = {
		'gate.spanDays': 'gate · countdown window (days)',
		'gate.timeUp': 'gate · time is up',
		'gate.taglines.early': 'gate · tagline (days away)',
		'gate.taglines.hours': 'gate · tagline (hours away)',
		'gate.taglines.minutes': 'gate · tagline (minutes away)',
		'greet.wishLines': 'greeting · wish lines (one per line)',
		'system.exploreGoal': 'system · bodies to explore',
		'system.cardKicker': 'system · card kicker',
		'system.dismiss': 'system · dismiss',
		'system.hints': 'system · hint lines (one per line)',
		'system.moon.text': 'system · moon text',
		'system.sun.text': 'system · sun text',
		'giftsScreen.tagline': 'gifts · tagline',
		'giftsScreen.sub': 'gifts · sub',
		'giftsScreen.surprise': 'gifts · surprise button',
		'giftsScreen.openAnother': 'gifts · open another',
		'giftsScreen.nextHint': 'gifts · next hint',
		'planner.planTemplate': 'planner · plan template',
		'finale.wishes': 'finale · wish lines (one per line)',
		'finale.closing.fallback': 'finale · closing fallback'
	};

	const prettify = (path) => {
		const tail = path.split('.').at(-1).replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
		return `${path.split('.')[0]} · ${tail}`;
	};

	const walkFields = (obj, prefix = '') => {
		const out = [];
		for (const [key, value] of Object.entries(obj ?? {})) {
			const path = prefix ? `${prefix}.${key}` : key;
			if (OWN_EDITORS.has(path)) continue;
			if (Array.isArray(value)) {
				if (value.every((item) => typeof item === 'string')) {
					out.push({ path, kind: 'lines', label: LABELS[path] ?? prettify(path) });
				} else {
					value.forEach((item, i) => out.push(...walkFields(item, `${path}.${i}`)));
				}
			} else if (value && typeof value === 'object') {
				out.push(...walkFields(value, path));
			} else if (typeof value === 'number') {
				out.push({ path, kind: 'number', label: LABELS[path] ?? prettify(path) });
			} else if (typeof value === 'string') {
				out.push({ path, kind: 'text', label: LABELS[path] ?? prettify(path) });
			}
		}
		return out;
	};

	let autoFields = $derived(walkFields(draft?.settings));

	// Long copy gets a taller box; short strings stay on one line.
	const isLong = (value) => typeof value === 'string' && value.length > 58;

	const readField = (path) => getPath(draft.settings, path);

	const writeField = (path, kind) => (event) => {
		const raw = event.currentTarget.value;
		if (kind === 'number') setPath(draft.settings, path, Number(raw));
		else if (kind === 'lines') setPath(draft.settings, path, raw.split('\n').map((line) => line.trimEnd()));
		else setPath(draft.settings, path, raw);
		saved = false;
	};

	const previewUrl = $derived(draft?.photo_path ? photoPublicUrl(draft.photo_path) : '');

	const syncTextareas = () => {
		if (!draft) return;
		wishLinesText = (draft.settings.greet.wishLines ?? []).join('\n');
		rulesText = JSON.stringify(draft.settings.finale.closing.rules ?? [], null, '\t');
		themesText = Object.entries(draft.settings.finale.themes ?? {})
			.map(([key, pair]) => `${key} ${pair[0]} ${pair[1]}`)
			.join('\n');
	};

	const open = (row) => {
		// $state.snapshot, not structuredClone: rows are reactive Proxies.
		draft = $state.snapshot(row);
		problems = [];
		saved = false;
		syncTextareas();
	};

	const startNew = () => {
		draft = blankCard();
		problems = [];
		saved = false;
		syncTextareas();
	};

	const reload = async () => {
		await listCards();
	};

	const submit = async (event) => {
		event.preventDefault();
		if (!draft) return;
		problems = validateCard(draft);
		if (problems.length) return;
		saved = false;
		const ok = await saveCard(draft);
		if (ok) saved = true;
	};

	const onName = () => {
		if (!draft) return;
		if (!draft.id) {
			const next = slugify(draft.name);
			if (!draft.slug || draft.slug === slugify(draft.name.slice(0, -1))) draft.slug = next;
		}
	};

	const onFile = async (event) => {
		const file = event.currentTarget.files?.[0];
		if (!file || !draft) return;
		// A new card has no row id yet, so it needs saving before the upload
		// can be filed under cards/<id>/.
		if (!draft.id) {
			problems = validateCard(draft);
			if (problems.length) return;
			const ok = await saveCard(draft);
			if (!ok) return;
		}
		const result = await uploadPhoto(draft.id, file);
		if (result.ok) {
			if (draft.photo_path && draft.photo_path !== result.path) removePhoto(draft.id, draft.photo_path);
			draft.photo_path = result.path;
		}
	};

	const remove = async () => {
		if (!draft?.id) return;
		if (!confirm(`Delete “${draft.name}”? This cannot be undone.`)) return;
		if (await deleteCard(draft.id)) draft = null;
	};

	const copy = async (row) => {
		await duplicateCard(row);
	};
</script>

<svelte:head>
	<title>cards · admin</title>
</svelte:head>

<div class="admin">
	<header>
		<h1>cards</h1>
		<div class="head-actions">
			<a class="ghost" href={base + '/'}>view site</a>
			{#if isOwner()}
				<button class="ghost" onclick={signOut}>sign out</button>
			{/if}
		</div>
	</header>

	{#if session.loading}
		<p class="note">checking your session…</p>
	{:else if !session.user}
		<form class="auth" onsubmit={(e) => { e.preventDefault(); signIn(email, password); }}>
			<h2>sign in</h2>
			<p class="note">this area is owner-only.</p>
			<label>
				<span>email</span>
				<input type="email" bind:value={email} autocomplete="username" required />
			</label>
			<label>
				<span>password</span>
				<input type="password" bind:value={password} autocomplete="current-password" required />
			</label>
			<button type="submit">sign in</button>
			{#if ownerEmail}
				<p class="note">signed in as {session.user?.email ?? ownerEmail}</p>
			{/if}
		</form>
	{:else if !isOwner()}
		<div class="note-block">
			<p><strong>{session.user.email}</strong> is signed in but is not the card owner.</p>
			<p class="note">
				set <code>PUBLIC_OWNER_EMAIL</code> to {session.user.email} in <code>.env</code>, or sign in with the
				owner account.
			</p>
			<button class="ghost" onclick={signOut}>sign out</button>
		</div>
	{:else}
		<div class="shell">
			<aside>
				<div class="aside-head">
					<input class="search" placeholder="filter cards" bind:value={filter} />
					<button class="primary" onclick={startNew}>new</button>
				</div>
				<button class="reload" onclick={reload} disabled={adminState.loading}>
					{adminState.loading ? 'loading…' : 'reload'}
				</button>

				<ul class="rows">
					{#each visibleRows as row (row.id)}
						<li class:open={draft?.id === row.id}>
							<div class="row-tools">
								<button class="tiny primary-tiny" onclick={() => open(row)}>edit</button>
								<a class="tiny" href={base + '/c/' + row.slug} target="_blank" rel="noreferrer">open</a>
								<button class="tiny" onclick={() => copy(row)}>duplicate</button>
							</div>
							<button class="row-btn" onclick={() => open(row)}>
								<span class="row-name">{row.name}</span>
								<span class="row-slug">/c/{row.slug}</span>
							</button>
						</li>
					{:else}
						<li class="empty">no cards yet.</li>
					{/each}
				</ul>
			</aside>

			<main>
				{#if !draft}
					<p class="note">pick a card on the left, or start a new one.</p>
				{:else}
					<form onsubmit={submit}>
						<section>
							<h2>basics</h2>
							<div class="grid2">
								<label>
									<span>name</span>
									<input bind:value={draft.name} oninput={onName} required />
								</label>
								<label>
									<span>slug</span>
									<input bind:value={draft.slug} required />
									<small>public url: /c/{draft.slug || '…'}</small>
								</label>
								<label>
									<span>birthday</span>
									<input type="datetime-local" bind:value={draft.birthday_at} required />
								</label>
								<label>
									<span>reel photo</span>
									<input type="file" accept="image/png,image/jpeg,image/webp" onchange={onFile} />
									{#if previewUrl}
										<img class="thumb" src={previewUrl} alt="" />
										<button type="button" class="tiny" onclick={() => (draft.photo_path = '')}>remove</button>
									{:else}
										<small>png with transparency works best.</small>
									{/if}
								</label>
							</div>
						</section>

						<section>
							<h2>planets</h2>
							<p class="note">
								add, remove or reorder. visuals (size, colour, orbit) are generated by position.
							</p>
							{#each draft.planets as planet, i (planet.id ?? i)}
								<div class="item">
									<div class="item-head">
										<strong>{planet.name || `planet ${i + 1}`}</strong>
										<span class="tools">
											<button type="button" class="tiny" disabled={i === 0} onclick={() => draft.planets.splice(i - 1, 0, draft.planets.splice(i, 1)[0])}>↑</button>
											<button type="button" class="tiny" disabled={i === draft.planets.length - 1} onclick={() => draft.planets.splice(i + 1, 0, draft.planets.splice(i, 1)[0])}>↓</button>
											<button type="button" class="tiny danger" onclick={() => draft.planets.splice(i, 1)}>remove</button>
										</span>
									</div>
									<label><span>name</span><input bind:value={planet.name} /></label>
									<label><span>text</span><textarea rows="3" bind:value={planet.text}></textarea></label>
								</div>
							{/each}
							<button type="button" class="ghost" onclick={() => draft.planets.push({ id: `planet-${Date.now()}`, kind: 'planet', name: '', text: '' })}>+ add planet</button>
						</section>

						<section>
							<h2>gifts</h2>
							<p class="note">add, remove or reorder. <code>{'{name}'}</code> is replaced with the card's name.</p>
							{#each draft.gifts as gift, i (gift.id ?? i)}
								<div class="item">
									<div class="item-head">
										<strong>{gift.text || `gift ${i + 1}`}</strong>
										<span class="tools">
											<button type="button" class="tiny" disabled={i === 0} onclick={() => draft.gifts.splice(i - 1, 0, draft.gifts.splice(i, 1)[0])}>↑</button>
											<button type="button" class="tiny" disabled={i === draft.gifts.length - 1} onclick={() => draft.gifts.splice(i + 1, 0, draft.gifts.splice(i, 1)[0])}>↓</button>
											<button type="button" class="tiny danger" onclick={() => draft.gifts.splice(i, 1)}>remove</button>
										</span>
									</div>
									<div class="grid2">
										<label><span>label</span><input bind:value={gift.text} /></label>
										<label><span>emoji</span><input bind:value={gift.emoji} /></label>
										<label><span>hint</span><input bind:value={gift.hint} /></label>
										<label>
											<span>kind</span>
											<select bind:value={gift.kind}>
												<option value="quote">quote</option>
												<option value="playful">playful</option>
												<option value="message">message</option>
												<option value="visual">visual</option>
												<option value="interactive">interactive</option>
											</select>
										</label>
										<label><span>title</span><input bind:value={gift.title} /></label>
										<label><span>vibe</span><input bind:value={gift.vibe} /></label>
										<label><span>accent</span><input bind:value={gift.accent} /></label>
									</div>
									<label><span>body</span><textarea rows="4" bind:value={gift.body}></textarea></label>
									{#if gift.kind === 'interactive'}
										<div class="grid2">
											<label><span>interactive label</span><input bind:value={gift.interactiveLabel} /></label>
											<label><span>wish</span><input bind:value={gift.wish} /></label>
										</div>
									{/if}
								</div>
							{/each}
							<button type="button" class="ghost" onclick={() => draft.gifts.push({ id: `gift-${Date.now()}`, kind: 'message', text: '', emoji: '🎁', hint: '', title: '', vibe: '', body: '', accent: '#8d6a4a' })}>+ add gift</button>
						</section>

						<section>
							<h2>day planner</h2>
							<p class="note">
								the four stages are a fixed shape: the closing line branches on the exact choice
								indices, so stages and choices cannot be added, removed or reordered — only their
								wording is editable.
							</p>
							{#each draft.settings.planner.stages as stage, si (si)}
								<div class="item">
									<div class="item-head">
										<strong>{si + 1}. {stage.phase}</strong>
										<span class="chip">{stage.choices.length} choices</span>
									</div>
									<label>
										<span>question</span>
										<input value={stage.title} oninput={(e) => (stage.title = e.currentTarget.value)} />
									</label>
									{#each stage.choices as choice, ci (ci)}
										<div class="choice">
											<span class="choice-idx">{ci}</span>
											<input
												class="c-icon"
												value={choice.icon}
												oninput={(e) => (choice.icon = e.currentTarget.value)}
												aria-label="icon"
											/>
											<div class="c-body">
												<input
													value={choice.text}
													oninput={(e) => (choice.text = e.currentTarget.value)}
													aria-label="choice text"
												/>
												<input
													value={choice.sub}
													oninput={(e) => (choice.sub = e.currentTarget.value)}
													aria-label="choice sub"
												/>
											</div>
										</div>
									{/each}
								</div>
							{/each}
						</section>

						<section>
							<h2>closing line</h2>
							<label>
								<span>fallback (used when no rule matches)</span>
								<textarea rows="2" bind:value={draft.settings.finale.closing.fallback}></textarea>
							</label>
							<label>
								<span>rules (json)</span>
								<textarea rows="10" bind:value={rulesText} oninput={applyRules}></textarea>
								<small>
									evaluated top to bottom, first match wins. each rule is {'{'}
									<code>when</code> (all must match) or <code>whenAny</code> (one is enough) plus
									<code>text</code>. keys are <code>morning</code>, <code>next</code>,
									<code>afternoon</code>, <code>evening</code> — values are choice indices (0-based).
								</small>
							</label>
							<label>
								<span>treat emoji per theme (party / mystery / cozy / dream / warm)</span>
								<textarea rows="5" bind:value={themesText} oninput={applyThemes}></textarea>
								<small>one theme per line, as <code>key emoji emoji</code>.</small>
							</label>
						</section>

						<section>
							<h2>all other copy</h2>
							<p class="note">
								every remaining string on the card. <code>{'{name}'}</code> is replaced with the
								person's name.
							</p>
							<div class="grid2">
								{#each autoFields as field (field.path)}
									<label class:span={field.kind === 'lines' || isLong(readField(field.path))}>
										<span>{field.label}</span>
										{#if field.kind === 'number'}
											<input
												type="number"
												value={readField(field.path)}
												oninput={writeField(field.path, 'number')}
											/>
										{:else if field.kind === 'lines'}
											<textarea rows="3" value={readField(field.path)?.join('\n') ?? ''} oninput={writeField(field.path, 'lines')}></textarea>
										{:else if isLong(readField(field.path))}
											<textarea rows="3" value={readField(field.path)} oninput={writeField(field.path, 'text')}></textarea>
										{:else}
											<input value={readField(field.path)} oninput={writeField(field.path, 'text')} />
										{/if}
									</label>
								{/each}
							</div>
						</section>

						{#if problems.length}
							<ul class="problems">
								{#each problems as problem}
									<li>{problem}</li>
								{/each}
							</ul>
						{/if}

						<div class="actions">
							<button class="primary" type="submit" disabled={adminState.saving}>
								{adminState.saving ? 'saving…' : 'save card'}
							</button>
							{#if saved}<span class="saved">saved ✓</span>{/if}
							{#if draft.id}
								<button type="button" class="danger" onclick={remove}>delete card</button>
							{/if}
						</div>
					</form>
				{/if}
			</main>
		</div>
	{/if}

	{#if adminState.error}
		<p class="error">{adminState.error}</p>
	{/if}
	{#if session.error}
		<p class="error">{session.error}</p>
	{/if}
</div>


<style>
	.admin {
		min-height: 100dvh;
		background: #14101a;
		color: #f4ece4;
		font-family: var(--font-body);
		padding: 1.4rem clamp(1rem, 4vw, 2.6rem) 4rem;
		box-sizing: border-box;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid rgba(244, 236, 228, 0.14);
		padding-bottom: 0.9rem;
	}
	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.5rem;
		letter-spacing: 0.02em;
	}
	h2 {
		margin: 0 0 0.7rem;
		font-size: 0.82rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #e9b6c8;
	}
	.head-actions { display: flex; gap: 0.5rem; }

	.shell {
		display: grid;
		grid-template-columns: minmax(210px, 260px) 1fr;
		gap: 1.6rem;
		margin-top: 1.4rem;
		align-items: start;
	}
	@media (max-width: 760px) {
		.shell { grid-template-columns: 1fr; }
	}

	aside {
		position: sticky;
		top: 1.4rem;
		border: 1px solid rgba(244, 236, 228, 0.14);
		border-radius: 12px;
		padding: 0.8rem;
	}
	.aside-head { display: flex; gap: 0.4rem; }
	.rows { list-style: none; margin: 0.7rem 0 0; padding: 0; display: grid; gap: 0.35rem; max-height: 60vh; overflow: auto; }
	.rows li { border: 1px solid transparent; border-radius: 9px; padding: 0.35rem 0.45rem; }
	.rows li.open { border-color: #e9b6c8; background: rgba(233, 182, 200, 0.09); }
	.row-btn { display: grid; background: none; border: 0; color: inherit; cursor: pointer; text-align: left; padding: 0.1rem; }
	.row-name { font-size: 0.95rem; }
	.row-slug { font-size: 0.72rem; opacity: 0.6; }
	.row-tools { display: flex; gap: 0.35rem; margin-bottom: 0.3rem; }

	main { min-width: 0; }
	section {
		border: 1px solid rgba(244, 236, 228, 0.12);
		border-radius: 12px;
		padding: 1rem 1.1rem 1.2rem;
		margin-bottom: 1rem;
	}
	label { display: grid; gap: 0.25rem; margin-bottom: 0.6rem; }
	label > span { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.62; }
	input, textarea, select {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(244, 236, 228, 0.18);
		border-radius: 7px;
		color: inherit;
		font: inherit;
		font-size: 0.92rem;
		padding: 0.45rem 0.55rem;
		width: 100%;
		box-sizing: border-box;
	}
	textarea { resize: vertical; line-height: 1.45; }
	small { font-size: 0.72rem; opacity: 0.6; }
	.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0 0.8rem; }

	.item {
		border: 1px solid rgba(244, 236, 228, 0.1);
		border-radius: 9px;
		padding: 0.7rem 0.8rem;
		margin-bottom: 0.6rem;
		background: rgba(255, 255, 255, 0.02);
	}
	.item-head { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.5rem; }
	.tools { display: flex; gap: 0.25rem; }

	button {
		font: inherit;
		border-radius: 7px;
		border: 1px solid rgba(244, 236, 228, 0.22);
		background: rgba(255, 255, 255, 0.06);
		color: inherit;
		cursor: pointer;
		padding: 0.45rem 0.8rem;
	}
	button:disabled { opacity: 0.4; cursor: not-allowed; }
	.primary { background: #e9b6c8; border-color: #e9b6c8; color: #2a1a24; font-weight: 600; }
	.ghost { background: none; }
	.tiny { padding: 0.2rem 0.45rem; font-size: 0.75rem; }
	.chip {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.6;
		border: 1px solid rgba(244, 236, 228, 0.22);
		border-radius: 999px;
		padding: 0.1rem 0.5rem;
	}
	.choice { display: flex; gap: 0.5rem; align-items: flex-start; margin-bottom: 0.35rem; }
	.choice-idx {
		flex: 0 0 1.1rem;
		text-align: center;
		font-size: 0.72rem;
		opacity: 0.5;
		padding-top: 0.5rem;
	}
	.c-icon { flex: 0 0 2.4rem; text-align: center; }
	.c-body { display: grid; gap: 0.25rem; flex: 1; min-width: 0; }
	.grid2 label.span { grid-column: 1 / -1; }
	.primary-tiny { background: #e9b6c8; border-color: #e9b6c8; color: #2a1a24; font-weight: 600; }
	.danger { border-color: #d4737f; color: #f0a3ab; }
	a.ghost, a.tiny { color: #e9b6c8; text-decoration: none; display: inline-block; padding: 0.45rem 0.8rem; }
	a.tiny { padding: 0.2rem 0.45rem; font-size: 0.75rem; border: 1px solid rgba(244, 236, 228, 0.22); border-radius: 7px; }

	.actions { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
	.saved { color: #9ad6a4; font-size: 0.88rem; }
	.problems { border: 1px solid #d4737f; border-radius: 9px; padding: 0.7rem 1rem; margin: 0 0 1rem; color: #f0a3ab; }
	.note { font-size: 0.82rem; opacity: 0.68; margin: 0.2rem 0 0.6rem; }
	.note-block { max-width: 34rem; margin-top: 2rem; }
	.error { color: #f0a3ab; margin-top: 1rem; }
	.empty { opacity: 0.6; font-size: 0.85rem; }
	.auth { max-width: 20rem; margin-top: 2.4rem; display: grid; gap: 0.2rem; }
	.auth button { margin-top: 0.6rem; }
	.thumb { width: 100%; max-width: 9rem; border-radius: 8px; margin-top: 0.4rem; display: block; background: rgba(255,255,255,0.06); }
	code { background: rgba(255,255,255,0.07); padding: 0.05rem 0.3rem; border-radius: 4px; font-size: 0.82em; }
	.reload { width: 100%; margin-top: 0.5rem; font-size: 0.8rem; }
	.search { flex: 1; }
</style>