import PageLayout from '@/components/Site/PageLayout';

export default function CGUPage() {
  return (
    <PageLayout
      title="Conditions générales d'utilisation"
      breadcrumbs={[{ label: 'CGU' }]}
    >
      <div className="prose prose-sm max-w-3xl prose-headings:font-display prose-headings:text-text prose-p:text-muted prose-li:text-muted prose-a:text-blue">

        <p><em>Dernière mise à jour : février 2026</em></p>

        <h2>1. Objet</h2>
        <p>
          Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation
          du site internet <strong>gntc.fr</strong> édité par le Groupement National des Transports Combinés (GNTC).
        </p>
        <p>
          En accédant au site, l'utilisateur accepte sans réserve les présentes CGU.
        </p>

        <h2>2. Accès au site</h2>
        <p>
          Le site est accessible gratuitement à tout utilisateur disposant d'un accès internet.
          Le GNTC se réserve le droit de suspendre ou d'interrompre l'accès au site à tout moment,
          notamment pour des raisons de maintenance, sans préavis ni indemnité.
        </p>

        <h2>3. Services proposés</h2>
        <p>Le site propose les services suivants :</p>
        <ul>
          <li>Information sur le transport combiné en France</li>
          <li>Carte interactive du réseau de transport combiné</li>
          <li>Annuaire des acteurs de la filière</li>
          <li>Calculateur d'empreinte carbone</li>
          <li>Actualités et publications de la filière</li>
          <li>Formulaire de contact</li>
        </ul>

        <h2>4. Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus du site (textes, images, vidéos, graphiques, logos, icônes,
          base de données, logiciels) est protégé par le droit de la propriété intellectuelle.
          Toute reproduction ou représentation, totale ou partielle, est interdite sans
          autorisation préalable du GNTC.
        </p>

        <h2>5. Données cartographiques</h2>
        <p>
          La carte interactive utilise des données de transport combiné fournies par les opérateurs
          adhérents du GNTC. Ces données sont fournies à titre indicatif et ne sauraient engager
          la responsabilité du GNTC en cas d'inexactitude.
        </p>
        <p>
          Les fonds de carte sont fournis par OpenStreetMap sous licence ODbL.
        </p>

        <h2>6. Calculateur CO2</h2>
        <p>
          Le calculateur d'empreinte carbone fournit des estimations basées sur les facteurs
          d'émission de l'ADEME (Base Carbone). Les résultats sont indicatifs et ne constituent
          pas une mesure certifiée des émissions de gaz à effet de serre.
        </p>

        <h2>7. Responsabilité</h2>
        <p>
          Le GNTC s'efforce de fournir des informations exactes et à jour. Toutefois, il ne peut
          garantir l'exactitude, la complétude ou la pertinence des informations mises à disposition.
        </p>
        <p>
          L'utilisateur est seul responsable de l'utilisation qu'il fait des informations
          disponibles sur le site. Le GNTC ne saurait être tenu responsable de tout dommage
          direct ou indirect résultant de l'utilisation du site.
        </p>

        <h2>8. Liens hypertextes</h2>
        <p>
          Le site peut contenir des liens vers des sites tiers. Le GNTC n'exerce aucun contrôle
          sur ces sites et décline toute responsabilité quant à leur contenu et leurs pratiques
          en matière de protection des données personnelles.
        </p>

        <h2>9. Formulaire de contact</h2>
        <p>
          L'utilisation du formulaire de contact implique la communication de données personnelles
          (nom, email, etc.). Ces données sont traitées conformément à notre
          <a href="/politique-confidentialite">politique de confidentialité</a>.
        </p>

        <h2>10. Modification des CGU</h2>
        <p>
          Le GNTC se réserve le droit de modifier les présentes CGU à tout moment. Les modifications
          prennent effet dès leur publication sur le site. L'utilisateur est invité à consulter
          régulièrement cette page.
        </p>

        <h2>11. Droit applicable</h2>
        <p>
          Les présentes CGU sont régies par le droit français. En cas de litige relatif à
          l'interprétation ou à l'exécution des présentes, les tribunaux de Paris seront
          seuls compétents.
        </p>

        <h2>12. Contact</h2>
        <p>
          Pour toute question relative aux présentes CGU, vous pouvez nous contacter à :<br />
          <a href="mailto:secretariat@gntc.fr">secretariat@gntc.fr</a>
        </p>
      </div>
    </PageLayout>
  );
}
