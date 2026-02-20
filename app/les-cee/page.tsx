import PageLayout from '@/components/Site/PageLayout';

const STEPS = [
  { num: 1, title: 'Demande de devis', desc: 'Transmettre un devis ou bon de commande non sign\u00e9 de l\'\u00e9quipement envisag\u00e9.' },
  { num: 2, title: '\u00c9valuation de la prime CEE', desc: 'Le GNTC et son partenaire calculent le montant de la prime CEE \u00e0 laquelle vous pouvez pr\u00e9tendre.' },
  { num: 3, title: 'Signature de l\'AIF', desc: 'Signature de l\'Attestation d\'Incitation Financi\u00e8re entre le b\u00e9n\u00e9ficiaire et le d\u00e9l\u00e9gataire.' },
  { num: 4, title: 'R\u00e9alisation de l\'op\u00e9ration', desc: 'Achat et mise en service de l\'\u00e9quipement (d\u00e9lai de 6 \u00e0 12 mois).' },
  { num: 5, title: 'Finalisation', desc: 'V\u00e9rification de la conformit\u00e9 de l\'op\u00e9ration r\u00e9alis\u00e9e.' },
  { num: 6, title: 'Compl\u00e9tion du dossier', desc: 'Fourniture de la facture, documents de location, attestations de trafic, d\u00e9clarations sur l\'honneur.' },
  { num: 7, title: 'Versement de la prime', desc: 'Le montant de la prime CEE est vers\u00e9 au b\u00e9n\u00e9ficiaire.' },
];

const TC_OPERATIONS = [
  { code: 'TRA-EQ-101', desc: 'Unit\u00e9s de transport intermodal (rail-route)' },
  { code: 'TRA-EQ-107', desc: 'Unit\u00e9s intermodales (fleuve-route)' },
  { code: 'TRA-EQ-108', desc: 'Wagons d\'autoroute ferroviaire' },
];

const TRM_OPERATIONS = [
  { code: 'TRA-EQ-103', desc: 'T\u00e9l\u00e9matique de suivi de conduite' },
  { code: 'TRA-EQ-111', desc: 'Groupes frigorifiques \u00e0 haute efficacit\u00e9' },
  { code: 'TRA-EQ-115', desc: 'V\u00e9hicules de fret optimis\u00e9s' },
  { code: 'TRA-SE-101', desc: 'Formation conducteur (\u00e9co-conduite)' },
  { code: 'TRA-SE-105', desc: 'Rechapage de pneus' },
  { code: 'TRA-SE-108', desc: 'Gestion externalis\u00e9e des pneumatiques' },
];

const BATIMENT_OPERATIONS = [
  'Isolation thermique (toitures, murs, planchers, fen\u00eatres, terrasses)',
  '\u00c9clairage ext\u00e9rieur',
  'Syst\u00e8mes CVC (chauffage, ventilation, climatisation)',
  'Variation \u00e9lectronique de vitesse',
  'R\u00e9gulation de la r\u00e9frig\u00e9ration',
  'R\u00e9cup\u00e9ration de chaleur',
];

export default function LesCeePage() {
  return (
    <PageLayout
      title="Les Certificats d'&Eacute;conomie d'&Eacute;nergie (CEE)"
      subtitle="Une vision &agrave; 360&deg; pour vos Certificats d'&Eacute;conomies d'&Eacute;nergie"
      hero
      breadcrumbs={[{ label: 'Les CEE' }]}
    >
      {/* Principe */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-4">Le principe</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Le dispositif des CEE permet aux entreprises de <strong className="text-text">capitaliser sur leurs investissements</strong> en
            &eacute;quipements &eacute;conomes en &eacute;nergie et de r&eacute;duire leur empreinte carbone.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Les fournisseurs d'&eacute;nergie (les &laquo;&nbsp;oblig&eacute;s&nbsp;&raquo;) doivent financer des op&eacute;rations
            d'optimisation &eacute;nerg&eacute;tique aupr&egrave;s des consommateurs. Environ <strong className="text-text">200 op&eacute;rations</strong> sont
            &eacute;ligibles, chacune g&eacute;n&eacute;rant des certificats.
          </p>
          <div className="bg-blue/5 rounded-lg p-4">
            <div className="text-sm font-display font-bold text-text mb-1">Formule</div>
            <p className="text-sm text-muted">
              <strong className="text-blue">1 CEE = 1 kWh</strong> d'&eacute;nergie finale &eacute;conomis&eacute;e, cumul&eacute;e et
              actualis&eacute;e sur la dur&eacute;e de vie du produit.
            </p>
          </div>
          <p className="text-xs text-muted">
            P&eacute;riode actuelle : <strong className="text-text">5&egrave;me p&eacute;riode</strong> (1er janvier 2022 &ndash; 31 d&eacute;cembre 2025, 4 ans).
          </p>
        </div>
      </section>

      {/* Exemples concrets */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-4">Cas concrets de financement</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="text-3xl mb-3">🚛</div>
            <h3 className="font-display font-bold text-text mb-2">Semi-Remorque Mega Liner</h3>
            <div className="space-y-2 text-sm text-muted">
              <div className="flex justify-between">
                <span>Investissement</span>
                <span className="font-bold text-text">26 900 &euro;</span>
              </div>
              <div className="flex justify-between">
                <span>Prime CEE</span>
                <span className="font-bold gntc-gradient">73 % couvert</span>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full gntc-gradient-bg rounded-full" style={{ width: '73%' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-display font-bold text-text mb-2">30 Containers (30' dry bulks)</h3>
            <div className="space-y-2 text-sm text-muted">
              <div className="flex justify-between">
                <span>Investissement</span>
                <span className="font-bold text-text">390 000 &euro;</span>
              </div>
              <div className="flex justify-between">
                <span>Prime CEE</span>
                <span className="font-bold gntc-gradient">100 % couvert</span>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full gntc-gradient-bg rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Proc&eacute;dure */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-4">La proc&eacute;dure &agrave; suivre</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          <strong>Important :</strong> Contactez le GNTC <strong>AVANT</strong> de commander votre &eacute;quipement.
        </div>
        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.num} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full gntc-gradient-bg text-white flex items-center justify-center font-display font-bold text-sm flex-shrink-0">
                {s.num}
              </div>
              <div className="pt-1.5">
                <div className="font-display font-bold text-text text-sm">{s.title}</div>
                <div className="text-sm text-muted mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conditions */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-4">Conditions d'&eacute;ligibilit&eacute;</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-blue mt-0.5 flex-shrink-0">&bull;</span>
              P&eacute;riode de v&eacute;rification du trafic : <strong className="text-text">6 mois maximum</strong>
            </li>
            <li className="flex gap-2">
              <span className="text-blue mt-0.5 flex-shrink-0">&bull;</span>
              Seuls les trajets &agrave; destination ou en provenance de <strong className="text-text">terminaux intermodaux fran&ccedil;ais</strong> sont comptabilis&eacute;s
            </li>
            <li className="flex gap-2">
              <span className="text-blue mt-0.5 flex-shrink-0">&bull;</span>
              Un aller-retour = <strong className="text-text">2 voyages</strong> pour le calcul
            </li>
          </ul>
        </div>
      </section>

      {/* Op&eacute;rations &eacute;ligibles - Transport combin&eacute; */}
      <section className="mb-16">
        <h2 className="text-xl font-display font-bold text-text mb-4">Op&eacute;rations &eacute;ligibles</h2>

        <h3 className="text-lg font-display font-bold text-text mb-3">Transport Combin&eacute;</h3>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-semibold text-text">Code</th>
                <th className="text-left px-6 py-3 font-semibold text-text">Description</th>
              </tr>
            </thead>
            <tbody>
              {TC_OPERATIONS.map((op) => (
                <tr key={op.code} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-3 font-mono text-blue font-medium">{op.code}</td>
                  <td className="px-6 py-3 text-muted">{op.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-display font-bold text-text mb-3">Transport Routier de Marchandises</h3>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-semibold text-text">Code</th>
                <th className="text-left px-6 py-3 font-semibold text-text">Description</th>
              </tr>
            </thead>
            <tbody>
              {TRM_OPERATIONS.map((op) => (
                <tr key={op.code} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-3 font-mono text-blue font-medium">{op.code}</td>
                  <td className="px-6 py-3 text-muted">{op.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-display font-bold text-text mb-3">B&acirc;timents tertiaires</h3>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted">
            {BATIMENT_OPERATIONS.map((op, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-blue mt-0.5 flex-shrink-0">&bull;</span>
                {op}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue/5 to-cyan/5 rounded-2xl p-8">
        <h2 className="text-lg font-display font-bold text-text mb-2">Vous souhaitez b&eacute;n&eacute;ficier des CEE ?</h2>
        <p className="text-sm text-muted mb-4">
          Le GNTC accompagne ses adh&eacute;rents et partenaires dans le montage de leurs dossiers CEE.
          Contactez-nous <strong className="text-text">avant toute commande</strong> pour maximiser votre prime.
        </p>
        <a
          href="mailto:secretariat@gntc.fr"
          className="inline-flex items-center gap-2 gntc-gradient-bg text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Nous contacter
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>
    </PageLayout>
  );
}
