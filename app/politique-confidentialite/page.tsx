import PageLayout from '@/components/Site/PageLayout';

export default function PolitiqueConfidentialitePage() {
  return (
    <PageLayout
      title="Politique de confidentialité"
      subtitle="Comment nous protégeons vos données personnelles."
      breadcrumbs={[{ label: 'Politique de confidentialité' }]}
    >
      <div className="prose prose-sm max-w-3xl prose-headings:font-display prose-headings:text-text prose-p:text-muted prose-li:text-muted prose-a:text-blue">

        <p><em>Dernière mise à jour : février 2026</em></p>

        <h2>1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données personnelles est le
          <strong> Groupement National des Transports Combinés (GNTC)</strong>,
          association loi 1901, dont le siège social est situé au 58 rue de la Victoire, 75009 Paris.
        </p>
        <p>
          Contact : <a href="mailto:secretariat@gntc.fr">secretariat@gntc.fr</a>
        </p>

        <h2>2. Données collectées</h2>
        <p>Nous pouvons collecter les données suivantes :</p>
        <ul>
          <li><strong>Formulaire de contact :</strong> nom, prénom, adresse email, entreprise, message</li>
          <li><strong>Navigation :</strong> données de connexion (adresse IP, navigateur, pages consultées) via des cookies techniques</li>
          <li><strong>Newsletter COMBILETTRE :</strong> adresse email pour l'envoi de la newsletter</li>
        </ul>

        <h2>3. Finalités du traitement</h2>
        <p>Vos données sont collectées pour les finalités suivantes :</p>
        <ul>
          <li>Répondre à vos demandes via le formulaire de contact</li>
          <li>Vous envoyer la newsletter COMBILETTRE si vous y êtes inscrit</li>
          <li>Améliorer le fonctionnement et le contenu du site</li>
          <li>Établir des statistiques de fréquentation anonymes</li>
        </ul>

        <h2>4. Base légale</h2>
        <p>
          Le traitement de vos données repose sur votre <strong>consentement</strong> (formulaire de contact,
          newsletter) et sur notre <strong>intérêt légitime</strong> (statistiques de fréquentation,
          amélioration du site).
        </p>

        <h2>5. Destinataires des données</h2>
        <p>
          Vos données personnelles sont destinées uniquement au personnel habilité du GNTC.
          Elles ne sont en aucun cas cédées ou vendues à des tiers.
        </p>
        <p>
          Nos sous-traitants techniques (hébergeur Vercel) peuvent avoir accès à certaines données
          dans le cadre de leurs prestations, dans le respect du RGPD.
        </p>

        <h2>6. Durée de conservation</h2>
        <ul>
          <li><strong>Formulaire de contact :</strong> les données sont conservées pendant 3 ans à compter du dernier contact</li>
          <li><strong>Newsletter :</strong> les données sont conservées jusqu'à désinscription</li>
          <li><strong>Cookies :</strong> 13 mois maximum</li>
        </ul>

        <h2>7. Vos droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
          Informatique et Libertés, vous disposez des droits suivants :
        </p>
        <ul>
          <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
          <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
          <li><strong>Droit d'effacement :</strong> demander la suppression de vos données</li>
          <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
          <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
          <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à : <a href="mailto:secretariat@gntc.fr">secretariat@gntc.fr</a>
        </p>
        <p>
          Vous pouvez également introduire une réclamation auprès de la
          <strong> CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) :
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
        </p>

        <h2>8. Cookies</h2>
        <p>
          Ce site utilise uniquement des <strong>cookies techniques</strong> nécessaires à son bon
          fonctionnement. Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
        </p>
        <p>
          Les cookies techniques ne nécessitent pas votre consentement préalable conformément
          aux recommandations de la CNIL.
        </p>

        <h2>9. Transfert de données</h2>
        <p>
          L'hébergement du site étant assuré par Vercel Inc. (États-Unis), certaines données
          peuvent être transférées hors de l'Union européenne. Ce transfert est encadré par
          les clauses contractuelles types de la Commission européenne.
        </p>

        <h2>10. Sécurité</h2>
        <p>
          Le GNTC met en œuvre les mesures techniques et organisationnelles appropriées pour
          protéger vos données personnelles contre tout accès non autorisé, modification,
          divulgation ou destruction.
        </p>
        <p>
          Le site est accessible en HTTPS, garantissant le chiffrement des échanges de données.
        </p>
      </div>
    </PageLayout>
  );
}
