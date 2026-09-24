 (function () {
	"use strict";
	const $ = (id) => document.getElementById(id);
	let data = [];
	let editingId = null;
	let currentUser = null;
	let currentRole = "editor";
	let authMode = "sign-in";

	/* ---------- Utilitaires ---------- */
	const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
		({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
	const today = () => new Date().toISOString().slice(0, 10);
	const fr = (iso) => iso ? iso.split("-").reverse().join("/") : "—";
	function toast(msg) {
		const t = $("toast"); t.textContent = msg; t.classList.add("show");
		clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2200);
	}
	function showDatabaseError(error) {
		console.error(error);
		alert("Impossible d'enregistrer la modification : " +
			(error.message || "vérifiez la table contacts et ses règles d'accès."));
	}

	function showAuthMessage(message, isSuccess) {
		const target = $("auth-message");
		target.textContent = message;
		target.classList.toggle("success", !!isSuccess);
	}

	function setAuthMode(mode) {
		authMode = mode;
		const signUp = mode === "sign-up";
		$("sign-in-tab").classList.toggle("active", !signUp);
		$("sign-up-tab").classList.toggle("active", signUp);
		$("sign-in-tab").setAttribute("aria-selected", String(!signUp));
		$("sign-up-tab").setAttribute("aria-selected", String(signUp));
		$("auth-title").textContent = signUp ? "Créer un compte" : "Connexion";
		$("auth-description").textContent = signUp
			? "Créez votre accès à la base de contacts."
			: "Accédez à la base de contacts.";
		$("display-name-field").hidden = !signUp;
		$("auth-display-name").required = signUp;
		$("auth-first-name").required = signUp;
		$("auth-password").autocomplete = signUp ? "new-password" : "current-password";
		$("auth-submit").textContent = signUp ? "Créer mon compte" : "Se connecter";
		showAuthMessage("");
	}

	async function showApplication(user) {
		currentUser = user;
		const fullName = [user.user_metadata.first_name, user.user_metadata.display_name]
			.filter(Boolean).join(" ") || user.email;
		$("welcome-message").textContent = "Bienvenue, " + fullName;
		$("welcome-message").hidden = false;
		$("auth-view").hidden = true;
		$("app-view").hidden = false;
		$("app-footer").hidden = false;
		$("sign-out-btn").hidden = false;
		try {
			await Promise.all([loadUserRole(), loadResponsibles(), loadContacts()]);
			render();
			resetForm();
		} catch (error) {
			showDatabaseError(error);
		}
	}

	function showAuthentication() {
		currentUser = null;
		currentRole = "editor";
		data = [];
		$("auth-view").hidden = false;
		$("app-view").hidden = true;
		$("app-footer").hidden = true;
		$("welcome-message").textContent = "";
		$("welcome-message").hidden = true;
		$("sign-out-btn").hidden = true;
		$("auth-password").value = "";
	}

	async function loadUserRole() {
		const { data: profile, error } = await supabaseClient
			.from("profiles")
			.select("role")
			.eq("id", currentUser.id)
			.maybeSingle();
		if (error) throw error;
		currentRole = profile && profile.role === "admin" ? "admin" : "editor";
	}

	const isAdmin = () => currentRole === "admin";

	function toRecord(row) {
		return {
			id: row.id,
			nom: row.nom,
			prenom: row.prenom,
			genre: row.genre === "F" ? "F" : "M",
			email: row.email,
			qualite: row.qualite,
			responsable: row.responsable,
			envoye: row.envoye,
			dateEnvoi: row.date_envoi,
			createdAt: row.created_at,
			userId: row.user_id
		};
	}

	function toDatabaseRow(record) {
		const row = {
			nom: record.nom,
			prenom: record.prenom,
			genre: record.genre === "F" ? "F" : "M",
			email: record.email,
			qualite: record.qualite,
			responsable: record.responsable,
			envoye: record.envoye,
			date_envoi: record.dateEnvoi || null
		};
		if (record.userId) row.user_id = record.userId;
		return row;
	}

	async function loadContacts() {
		const { data: rows, error } = await supabaseClient
			.from("contacts")
			.select("*")
			.order("nom")
			.order("prenom");
		if (error) throw error;
		data = rows.map(toRecord);
	}

	/* ---------- Rendu ---------- */
	function filtered() {
		const q = $("search").value.trim().toLowerCase();
		const fq = $("f-qualite").value, frs = $("f-resp").value, fe = $("f-envoye").value;
		return data.filter((r) => {
			const hay = [r.nom, r.prenom, r.email, r.qualite, r.responsable].join(" ").toLowerCase();
			if (q && !hay.includes(q)) return false;
			if (fq && r.qualite !== fq) return false;
			if (frs && r.responsable !== frs) return false;
			if (fe === "1" && !r.envoye) return false;
			if (fe === "0" && r.envoye) return false;
			return true;
		}).sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom, "fr"));
	}

	function fillSelect(sel, values) {
		const cur = sel.value, first = sel.options[0].outerHTML;
		sel.innerHTML = first + values.map((v) => '<option>' + esc(v) + '</option>').join("");
		if (values.includes(cur)) sel.value = cur;
	}

	const responsibleLastNames = new Map();
	let profiles = [];

	async function loadResponsibles() {
		const { data: loadedProfiles, error } = await supabaseClient
			.from("profiles")
			.select("id, first_name, display_name")
			.order("first_name");
		if (error) throw error;
		profiles = loadedProfiles;
		responsibleLastNames.clear();
		profiles.forEach((profile) => {
			if (profile.first_name) responsibleLastNames.set(profile.first_name, profile.display_name || "");
		});
		fillSelect($("responsable"), [...responsibleLastNames.keys()]);
	}

	function getMailTemplate(contact) {
		const template = EMAIL_TEMPLATES[contact.qualite] || EMAIL_TEMPLATES.default;
		const feminin = contact.genre === "F";
		const replaceVariables = (value) => value
			.replaceAll("{prenom}", contact.prenom)
			.replaceAll("{nom}", contact.nom)
			.replaceAll("{civilite}", feminin ? "Madame" : "Monsieur")
			.replaceAll("{cher}", feminin ? "Chère" : "Cher")
			.replaceAll("{e}", feminin ? "e" : "")
			.replaceAll("{responsableNom}", responsibleLastNames.get(contact.responsable) || "")
			.replaceAll("{responsable}", contact.responsable);
		return {
			subject: replaceVariables(template.subject),
			body: replaceVariables(template.body)
		};
	}

	function render() {
		const rows = filtered();
		const displayName = currentUser.user_metadata.first_name || currentUser.email;
		$("tbody").innerHTML = rows.map((r) =>
			(() => {
				const mail = getMailTemplate(r);
				const isLinkClickable = r.responsable === displayName;
				const email = isLinkClickable
					? '<a href="mailto:' + encodeURIComponent(r.email) +
						'?subject=' + encodeURIComponent(mail.subject) +
						'&body=' + encodeURIComponent(mail.body) + '">' + esc(r.email) + '</a>'
					: esc(r.email);
				const toggleBtn = isLinkClickable
					? '<button class="btn-mini' + (r.envoye ? "" : " btn-to-send") + '" data-act="toggle" data-id="' + r.id + '">' + (r.envoye ? "↩︎ Non envoyé" : "✓ Envoyé") + '</button> '
					: "";
				const ownerActions = isAdmin() || r.userId === currentUser.id
					? '<button class="btn-mini" data-act="edit" data-id="' + r.id + '">Modifier</button> ' +
						'<button class="btn-mini btn-danger" data-act="del" data-id="' + r.id + '">Suppr.</button>'
					: "";
				const actions = toggleBtn + ownerActions;
				return '<tr>' +
			'<td><strong>' + esc(r.nom) + '</strong></td>' +
			'<td>' + esc(r.prenom) + '</td>' +
			'<td class="genre"><abbr title="' + (r.genre === "F" ? "Féminin" : "Masculin") + '">' + (r.genre === "F" ? "♀" : "♂") + '</abbr></td>' +
			'<td>' + email + '</td>' +
			'<td><span class="tag">' + esc(r.qualite) + '</span></td>' +
			'<td>' + esc(r.responsable) + '</td>' +
			'<td><span class="tag ' + (r.envoye ? 'yes' : 'no') + '">' + (r.envoye ? 'Oui' : 'Non') + '</span></td>' +
			'<td>' + fr(r.dateEnvoi) + '</td>' +
			'<td class="no-print" style="white-space:nowrap">' +
			actions +
			'</td></tr>';
			})()).join("");
		$("empty").style.display = rows.length ? "none" : "block";

		const sent = data.filter((r) => r.envoye).length;
		$("s-total").textContent = data.length;
		$("s-sent").textContent = sent;
		$("s-todo").textContent = data.length - sent;
		$("s-rate").textContent = (data.length ? Math.round(sent * 100 / data.length) : 0) + " %";

		const resp = [...new Set(data.map((r) => r.responsable).filter(Boolean))].sort();
		fillSelect($("f-resp"), resp);
		fillSelect($("f-qualite"), [...new Set(data.map((r) => r.qualite).filter(Boolean))].sort());

		const contactUserIds = [...new Set(data.map((contact) => contact.userId).filter(Boolean))];
		const currentDeleteUserId = $("wipe-user").value;
		const deleteUsers = profiles.filter((profile) => contactUserIds.includes(profile.id));
		$("wipe-user").innerHTML = '<option value="">Choisir un utilisateur</option>' + deleteUsers.map((profile) =>
			'<option value="' + esc(profile.id) + '">' + esc(getProfileLabel(profile)) + '</option>'
		).join("");
		if (deleteUsers.some((profile) => profile.id === currentDeleteUserId)) $("wipe-user").value = currentDeleteUserId;
		$("wipe-user").hidden = !isAdmin();
		$("wipe-btn").hidden = !isAdmin();
		$("wipe-btn").disabled = !$("wipe-user").value;
		$("wipe-btn").textContent = $("wipe-user").value
			? "Supprimer les contacts de " + getProfileLabel(deleteUsers.find((profile) => profile.id === $("wipe-user").value))
			: "Supprimer les contacts";
		["csv-btn", "json-btn", "import-json-btn", "print-btn"].forEach((id) => { $(id).hidden = !isAdmin(); });
	}

	function getProfileLabel(profile) {
		if (!profile) return "l'utilisateur sélectionné";
		return [profile.first_name, profile.display_name].filter(Boolean).join(" ") || "Utilisateur";
	}

	function normalizePrenom(value) {
		return value.trim().toLocaleLowerCase("fr-FR").split(/([-\s]+)/).map((part) =>
			/^[-\s]+$/.test(part) || !part ? part : part.charAt(0).toLocaleUpperCase("fr-FR") + part.slice(1)
		).join("");
	}

	function isValidEmail(value) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
	}

	/* ---------- Formulaire ---------- */
	const FORM_FIELDS = ["nom", "prenom", "email", "qualite", "responsable", "envoye"];
	const getGenre = () => ($("genre-f").checked ? "F" : "M");
	const setGenre = (value) => { $(value === "F" ? "genre-f" : "genre-m").checked = true; };
	let formSnapshot = null;
	function getFormSnapshot() {
		const snap = {};
		FORM_FIELDS.forEach((id) => { const el = $(id); snap[id] = el.type === "checkbox" ? el.checked : el.value; });
		snap.genre = getGenre();
		return snap;
	}
	function updateSubmitButtonState() {
		const dirty = !!formSnapshot && (formSnapshot.genre !== getGenre() || FORM_FIELDS.some((id) => $(id).type === "checkbox"
			? $(id).checked !== formSnapshot[id]
			: $(id).value !== formSnapshot[id]));
		const valid = $("contact-form").checkValidity() && isValidEmail($("email").value.trim());
		$("submit-btn").classList.toggle("dirty", dirty && valid);
	}
	function updateResetButtonState() {
		const filled = FORM_FIELDS.some((id) => $(id).type === "checkbox" ? $(id).checked : $(id).value !== "");
		$("reset-btn").classList.toggle("filled", filled);
	}

	function resetForm() {
		editingId = null;
		$("contact-form").reset(); $("id").value = "";
		$("form-title").textContent = "Ajouter un contact";
		$("submit-btn").textContent = "Enregistrer";
		formSnapshot = getFormSnapshot();
		updateSubmitButtonState();
		updateResetButtonState();
	}
	$("contact-form").addEventListener("input", updateSubmitButtonState);
	$("contact-form").addEventListener("change", updateSubmitButtonState);
	$("contact-form").addEventListener("input", updateResetButtonState);
	$("contact-form").addEventListener("change", updateResetButtonState);

	$("contact-form").addEventListener("submit", async function (e) {
		e.preventDefault();
		const email = $("email").value.trim().toLowerCase();
		if (!isValidEmail(email)) {
			alert("Veuillez saisir une adresse e-mail valide, par exemple nom@domaine.fr.");
			$("email").focus();
			return;
		}
		const rec = {
			nom: $("nom").value.trim().toUpperCase(),
			prenom: normalizePrenom($("prenom").value),
			genre: getGenre(),
			email: email,
			qualite: $("qualite").value,
			responsable: $("responsable").value.trim(),
			envoye: $("envoye").checked
		};
		const dup = data.find((r) => r.email === rec.email && r.id !== editingId);
		if (dup) {
			alert("Cet e-mail existe déjà (" + dup.nom + " " + dup.prenom + ").");
			return;
		}

		if (editingId) {
			const r = data.find((x) => x.id === editingId);
			const wasSent = r.envoye;
			Object.assign(r, rec);
			r.dateEnvoi = rec.envoye ? (wasSent && r.dateEnvoi ? r.dateEnvoi : today()) : "";
			const { error } = await supabaseClient.from("contacts")
				.update(toDatabaseRow(r)).eq("id", editingId);
			if (error) { showDatabaseError(error); return; }
			toast("Contact mis à jour");
		} else {
			const record = Object.assign({ dateEnvoi: rec.envoye ? today() : "", userId: currentUser.id }, rec);
			const { data: inserted, error } = await supabaseClient.from("contacts")
				.insert(toDatabaseRow(record)).select().single();
			if (error) { showDatabaseError(error); return; }
			data.push(toRecord(inserted));
			toast("Contact enregistré");
		}
		resetForm(); render();
	});

	$("reset-btn").addEventListener("click", resetForm);

	$("tbody").addEventListener("click", async function (e) {
		const btn = e.target.closest("button[data-act]"); if (!btn) return;
		const r = data.find((x) => x.id === btn.dataset.id); if (!r) return;
		if (btn.dataset.act === "toggle") {
			r.envoye = !r.envoye; r.dateEnvoi = r.envoye ? today() : "";
			const { error } = await supabaseClient.from("contacts")
				.update(toDatabaseRow(r)).eq("id", r.id);
			if (error) { r.envoye = !r.envoye; r.dateEnvoi = r.envoye ? today() : ""; showDatabaseError(error); return; }
			render(); toast(r.envoye ? "Marqué comme envoyé" : "Marqué comme non envoyé");
		} else if (btn.dataset.act === "edit") {
			editingId = r.id;
			$("nom").value = r.nom; $("prenom").value = r.prenom; $("email").value = r.email;
			setGenre(r.genre);
			$("qualite").value = r.qualite; $("responsable").value = r.responsable; $("envoye").checked = !!r.envoye;
			$("form-title").textContent = "Modifier : " + r.prenom + " " + r.nom;
			$("submit-btn").textContent = "Mettre à jour";
			formSnapshot = getFormSnapshot();
			updateSubmitButtonState();
			updateResetButtonState();
			window.scrollTo({ top: 0, behavior: "smooth" });
		} else if (btn.dataset.act === "del") {
			if (!confirm("Supprimer " + r.prenom + " " + r.nom + " ?")) return;
			const { error } = await supabaseClient.from("contacts").delete().eq("id", r.id);
			if (error) { showDatabaseError(error); return; }
			data = data.filter((x) => x.id !== r.id); render(); toast("Contact supprimé");
		}
	});

	["search", "f-qualite", "f-resp", "f-envoye"].forEach((id) =>
		$(id).addEventListener("input", render));

	/* ---------- Export / import ---------- */
	function download(name, content, type) {
		const a = document.createElement("a");
		a.href = URL.createObjectURL(new Blob([content], { type: type }));
		a.download = name; a.click(); URL.revokeObjectURL(a.href);
	}

	function importedRecord(value) {
		if (!value || typeof value !== "object") return null;
		const email = String(value.email || "").trim().toLowerCase();
		const nom = String(value.nom || "").trim().toUpperCase();
		const prenom = String(value.prenom || "").trim();
		if (!nom || !prenom || !isValidEmail(email)) return null;
		return {
			nom: nom,
			prenom: prenom,
			genre: value.genre === "F" ? "F" : "M",
			email: email,
			qualite: String(value.qualite || "").trim(),
			responsable: String(value.responsable || "").trim(),
			envoye: value.envoye === true,
			dateEnvoi: value.envoye === true && /^\d{4}-\d{2}-\d{2}$/.test(value.dateEnvoi || "")
				? value.dateEnvoi : "",
			userId: currentUser.id
		};
	}

	$("csv-btn").addEventListener("click", function () {
		const head = ["Nom", "Prénom", "Genre", "E-mail", "Qualité", "Chargé(e) de l'envoi", "Mail envoyé", "Date d'envoi"];
		const cell = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
		const csv = [head.join(";")].concat(filtered().map((r) =>
			[r.nom, r.prenom, r.genre === "F" ? "Féminin" : "Masculin", r.email, r.qualite, r.responsable, r.envoye ? "Oui" : "Non", fr(r.dateEnvoi)]
				.map(cell).join(";"))).join("\r\n");
		download("kpe-contacts-" + today() + ".csv", "\uFEFF" + csv, "text/csv;charset=utf-8");
	});

	$("json-btn").addEventListener("click", function () {
		download("kpe-contacts-" + today() + ".json", JSON.stringify(data, null, 2), "application/json");
	});

	$("import-json-btn").addEventListener("click", () => $("import-json-input").click());
	$("import-json-input").addEventListener("change", async function () {
		const file = this.files[0];
		this.value = "";
		if (!file) return;
		try {
			const parsed = JSON.parse(await file.text());
			const records = Array.isArray(parsed) ? parsed : parsed.contacts;
			if (!Array.isArray(records)) throw new Error("Le fichier doit contenir une liste de contacts.");
			const existingEmails = new Set(data.map((record) => record.email.toLowerCase()));
			const imported = [];
			let invalid = 0, duplicates = 0;
			records.forEach((value) => {
				const record = importedRecord(value);
				if (!record) { invalid++; return; }
				if (existingEmails.has(record.email)) { duplicates++; return; }
				existingEmails.add(record.email);
				imported.push(record);
			});
			if (!imported.length) {
				alert("Aucun nouveau contact valide à importer." + (duplicates ? " Les doublons ont été ignorés." : ""));
				return;
			}
			const { data: inserted, error } = await supabaseClient.from("contacts")
				.insert(imported.map(toDatabaseRow)).select();
			if (error) throw error;
			data.push(...inserted.map(toRecord));
			render();
			toast(imported.length + " contact" + (imported.length > 1 ? "s" : "") + " importé" + (imported.length > 1 ? "s" : ""));
			const details = [];
			if (duplicates) details.push(duplicates + " doublon" + (duplicates > 1 ? "s" : "") + " ignoré" + (duplicates > 1 ? "s" : ""));
			if (invalid) details.push(invalid + " ligne" + (invalid > 1 ? "s" : "") + " invalide" + (invalid > 1 ? "s" : ""));
			if (details.length) alert("Import terminé. " + details.join(" et ") + ".");
		} catch (error) {
			console.error(error);
			alert("Impossible d'importer ce fichier JSON : " + (error.message || "format invalide."));
		}
	});

	$("wipe-user").addEventListener("change", render);
	$("wipe-btn").addEventListener("click", async function () {
		if (!isAdmin()) return;
		const userId = $("wipe-user").value;
		if (!userId) return;
		const profile = profiles.find((item) => item.id === userId);
		const label = getProfileLabel(profile);
		if (!confirm("ATTENTION ! Vous allez supprimer définitivement tous les contacts de " + label + ". Cette action est irréversible.")) return;
		const { error } = await supabaseClient.from("contacts").delete().eq("user_id", userId);
		if (error) { showDatabaseError(error); return; }
		data = data.filter((contact) => contact.userId !== userId);
		render(); toast("Les contacts de " + label + " ont été supprimés");
	});

	/* ---------- Authentification ---------- */
	$("sign-in-tab").addEventListener("click", () => setAuthMode("sign-in"));
	$("sign-up-tab").addEventListener("click", () => setAuthMode("sign-up"));
	$("auth-form").addEventListener("submit", async function (e) {
		e.preventDefault();
		const email = $("auth-email").value.trim();
		const displayName = $("auth-display-name").value.trim().toLocaleUpperCase("fr-FR");
		const firstName = normalizePrenom($("auth-first-name").value).replace(/\s+/g, "-");
		const password = $("auth-password").value;
		const button = $("auth-submit");
		button.disabled = true;
		showAuthMessage("");
		try {
			if (authMode === "sign-up") {
				const { data: signUpData, error } = await supabaseClient.auth.signUp({
					email: email,
					password: password,
					options: { data: { display_name: displayName, first_name: firstName } }
				});
				if (error) throw error;
				if (signUpData.session) await showApplication(signUpData.user);
				else showAuthMessage("Compte créé. Consultez votre e-mail pour confirmer votre inscription.", true);
			} else {
				const { data: signInData, error } = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
				if (error) throw error;
				await showApplication(signInData.user);
			}
		} catch (error) {
			showAuthMessage(error.message || "Une erreur est survenue.");
		} finally {
			button.disabled = false;
		}
	});

	$("sign-out-btn").addEventListener("click", async function () {
		const { error } = await supabaseClient.auth.signOut();
		if (error) { showAuthMessage(error.message); return; }
		showAuthentication();
	});

	/* ---------- Démarrage ---------- */
	supabaseClient.auth.getSession().then(({ data: sessionData }) => {
		if (sessionData.session) showApplication(sessionData.session.user);
		else showAuthentication();
	});
	supabaseClient.auth.onAuthStateChange(function (_event, session) {
		if (!session) showAuthentication();
	});
})();
