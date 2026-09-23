const EMAIL_TEMPLATES = {
	"Officiels / Programmateurs / Élus": {
		subject: "Invitation personnelle – Soirée de lancement de Katy Perry EXPERIENCE by Karen La Gioia",
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
		subject: "Invitation - Katy Perry EXPERIENCE by Karen La Gioia",
		body: "Bonjour {prenom},\n\n" +
			"Il y a des projets qui naissent très vite… Et il y en a d'autres qui demandent des mois de travail,\n" +
			"de doutes, de remises en question, mais aussi énormément de passion.\n" +
			"Aujourd'hui, j'ai enfin le bonheur de t'annoncer que l’aventure Katy Perry EXPERIENCE by Karen La Gioia devient réalité.\n" +
			"Puisque le 28 novembre 2026, nous présenterons officiellement lors de notre première au Bunker Paillettes.\n\n" +
			"J'aimerais vraiment que tu sois là, avec nous.\n" +
			"Parce que cette soirée représente énormément après tout le chemin parcouru.\n" +
			"Et parce que j'ai envie de partager ce moment avec ceux qui nous soutiennent depuis le début.\n\n" +
			"Tu trouveras en pièce jointe un carton d'invitation.\n" +
			"L'entrée est gratuite.\n\n" +
			"J'espère avoir le plaisir de t’y retrouver le 28 novembre.\n" +			
			"À très bientôt,\n\n{responsable} \n Pour le projet : Katy Perry EXPERIENCE by Karen La Gioia"
	},
	default: {
		subject: "Invitation Katy Perry EXPERIENCE",
		body: "Bonjour {prenom},\n\n" +
			"Nous avons le plaisir de vous inviter...\n\n" +
			"Bien cordialement,\n{responsable}"
	}
};