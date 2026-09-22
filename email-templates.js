const EMAIL_TEMPLATES = {
	"Officiels / Programmateurs / Élus": {
		subject: "Invitation officielle élus - Katy Perry EXPERIENCE",
		body: "Madame, Monsieur,\n\n" +
			"Nous avons le plaisir de vous inviter à découvrir Katy Perry EXPERIENCE.\n\n" +
			"Nous serions honorés de vous compter parmi nos invités.\n\n" +
			"Bien cordialement,\n{responsable}"
	},
	"Partenaires et professionnels": {
		subject: "Invitation professionnelle - Katy Perry EXPERIENCE",
		body: "Bonjour {prenom},\n\n" +
			"Nous avons le plaisir de vous inviter à Katy Perry EXPERIENCE.\n\n" +
			"Ce serait un plaisir de vous retrouver à cette occasion et d'échanger autour du projet.\n\n" +
			"Bien cordialement,\n{responsable}"
	},
	"Famille, amis et proches": {
		subject: "Invitation amicale - Katy Perry EXPERIENCE",
		body: "Bonjour {prenom},\n\n" +
			"Nous serions très heureux de t'inviter à Katy Perry EXPERIENCE.\n\n" +
			"Nous espérons te compter parmi nous pour partager ce beau moment.\n\n" +
			"À très bientôt,\n{responsable}"
	},
	default: {
		subject: "Invitation Katy Perry EXPERIENCE",
		body: "Bonjour {prenom},\n\n" +
			"Nous avons le plaisir de vous inviter...\n\n" +
			"Bien cordialement,\n{responsable}"
	}
};