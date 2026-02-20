import PageLayout from '@/components/Site/PageLayout';

export default function MentionsLegalesPage() {
  return (
    <PageLayout
      title="Mentions légales"
      breadcrumbs={[{ label: 'Mentions légales' }]}
    >
      <div className="prose prose-sm max-w-3xl prose-headings:font-display prose-headings:text-text prose-p:text-muted prose-li:text-muted prose-a:text-blue">

        <h2>Éditeur du site</h2>
        <p>
          <strong>Groupement National des Transports Combinés (GNTC)</strong><br />
          Association loi 1901<br />
          58 rue de la Victoire, 75009 Paris<br />
          Téléphone : +33 6.81.84.26.21<br />
          Email : <a href="mailto:secretariat@gntc.fr">secretariat@gntc.fr</a><br />
          Président : Rémy CROCHET
        </p>

        <h2>Hébergement</h2>
        <p>
          Ce site est hébergé par :<br />
          <strong>Vercel Inc.</strong><br />
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
          Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble du contenu de ce site (textes, images, graphiques, logo, icônes, etc.) est la propriété
          exclusive du GNTC ou de ses partenaires et est protégé par les lois françaises et internationales
          relatives à la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication, transmission ou dénaturation,
          totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit, et sur quelque
          support que ce soit est interdite sans l'autorisation écrite préalable du GNTC.
        </p>

        <h2>Crédits</h2>
        <p>
          Conception et développement du site : JC Meilland<br />
          Cartographie interactive : données GNTC, fonds de carte OpenStreetMap<br />
          Photographies : GNTC, droits réservés
        </p>

        <h2>Liens hypertextes</h2>
        <p>
          Le site peut contenir des liens vers d'autres sites internet. Le GNTC n'exerce aucun contrôle
          sur ces sites et décline toute responsabilité quant à leur contenu.
        </p>

        <h2>Limitation de responsabilité</h2>
        <p>
          Les informations contenues sur ce site sont aussi précises que possible. Toutefois, le GNTC
          ne peut garantir l'exactitude, la complétude et l'actualité des informations diffusées.
          Le GNTC se réserve le droit de modifier le contenu du site à tout moment et sans préavis.
        </p>
        <p>
          En conséquence, l'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive.
        </p>

        <h2>Droit applicable</h2>
        <p>
          Le présent site et ses mentions légales sont soumis au droit français. En cas de litige,
          les tribunaux de Paris seront seuls compétents.
        </p>
      </div>
    </PageLayout>
  );
}
