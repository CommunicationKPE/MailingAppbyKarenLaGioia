const AFFICHE_URL = "https://communicationkpe.github.io/MailingAppbyKarenLaGioia/assets/InvitationBunkerPaillettes.png";

const EMAIL_TEMPLATES = {
	"Officiels / Programmateurs / Élus": {
		subject: "Invitation personnelle – Soirée de lancement de Katy Perry EXPERIENCE by Karen La Gioia",
		body: "Madame, Monsieur,\n\n" +
			"Nous avons le plaisir de vous inviter à découvrir Katy Perry EXPERIENCE.\n\n" +
			"Nous serions honorés de vous compter parmi nos invités.\n\n" +
			"Le carton d'invitation est à consulter ici :\n" + AFFICHE_URL + "\n\n" +
			"Bien cordialement,\n{responsable}"
	},
	"Partenaires et professionnels": {
		subject: "Invitation à la soirée de lancement du projet: Katy Perry EXPERIENCE by KarenLa Gioia, le 28 novembre 2026",
		body: "Bonjour {prenom} {nom},\n\n" +
			"Tu as suivi le projet de près ou de loin, encouragé notre démarche ou tout simplement cru en nous.\n" +
			"Aujourd'hui, j'ai le plaisir de t'annoncer que cette aventure prend une nouvelle dimension.\n" +
			"Puisque nous présenterons officiellement le projet : « Katy Perry EXPERIENCE by Karen La Gioia, » \n" +
			"lors de sa soirée de lancement, organisée le 28 novembre 2026 au Bunker Paillettes.\n" +			
			"Cette première représentation est importante pour toute l'équipe. \n" +
			"Elle marque le début de la diffusion du spectacle et le commencement d'une nouvelle étape.\n" +
			"Ce serait un réel plaisir de t'avoir parmi nous pour vivre ce moment particulier.\n\n" +
			"Le carton d'invitation est à consulter ici :\n" + AFFICHE_URL + "\n" +
			"L'entrée est gratuite.\n\n" +
			"Au-delà du spectacle, ce sera surtout l'occasion de partager un bon moment.\n" +
			"Merci d'écrire l'histoire avec nous.\n" +
			"À très bientôt !\n" +
			"Musicalement,\n\n{responsable} {responsableNom} \n Pour le projet : Katy Perry EXPERIENCE by Karen La Gioia"
	},
	"Famille, amis et proches": {
		subject: "Invitation - Katy Perry EXPERIENCE by Karen La Gioia",
		body: "Bonjour {prenom},\n\n" +
			"Il y a des projets qui naissent très vite… Et il y en a d'autres qui demandent des mois de travail,\n" +
			"de doutes, de remises en question, mais aussi énormément de passion.\n" +
			"Aujourd'hui, j'ai enfin le bonheur de t'annoncer que l’aventure Katy Perry EXPERIENCE by Karen La Gioia devient réalité.\n" +
			"Puisque le 28 novembre 2026, nous présenterons officiellement lors de notre première au Bunker Paillettes.\n\n" +
			"J'aimerais vraiment que tu sois là toi et tes proches, avec nous.\n" +
			"Parce que cette soirée représente énormément après tout le chemin parcouru.\n" +
			"Et parce que j'ai envie de partager ce moment avec ceux qui nous soutiennent depuis le début.\n\n" +
			"Tu trouveras le carton d'invitation ici :\n" + AFFICHE_URL + "\n" +
			"L'entrée est gratuite.\n\n" +
			"J'espère avoir le plaisir de t’y retrouver le 28 novembre.\n" +			
			"À très bientôt,\n\n{responsable} \n Pour le projet : Katy Perry EXPERIENCE by Karen La Gioia"
	},
	default: {
		subject: "Invitation Katy Perry EXPERIENCE",
		body: "Bonjour {prenom},\n\n" +
			"Nous avons le plaisir de vous inviter...\n\n" +
			"Le carton d'invitation est à consulter ici :\n" + AFFICHE_URL + "\n\n" +
			"Bien cordialement,\n{responsable}"
	}
};