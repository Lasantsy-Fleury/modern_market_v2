import { getMetadataArgsStorage } from 'typeorm';
import './affectation.entity';
import './audit_log.entity';
import './commercant.entity';
import './commune.entity';
import './controle.entity';
import './echeance.entity';
import './marche.entity';
import './mode_paiement.entity';
import './paiement_redevance.entity';
import './parametre.entity';
import './periodicite.entity';
import './presence.entity';
import './quittance.entity';
import './recette.entity';
import './redevance.entity';
import './tarif.entity';
import './type_droit.entity';
import './activite_commerciale.entity';
import '../../location/entities/location.entity';
import '../../paiement/entities/paiement.entity';

/**
 * Vérifications structurelles du modèle cible (sans connexion BD) :
 * les métadonnées de décorateurs TypeORM doivent déclarer les contraintes
 * d'intégrité attendues.
 */
describe('Modèle cible — contraintes d\'intégrité déclarées', () => {
  const storage = getMetadataArgsStorage();

  const checksOf = (target: unknown): string[] =>
    storage.checks
      .filter((c) => c.target === target)
      .map((c) => c.name as string);

  const uniquesOf = (target: unknown): string[][] =>
    storage.indices
      .filter((i) => i.target === target && i.unique)
      .map((i) => (i.columns as string[]) ?? []);

  it('echeance : dates cohérentes + statut/source bornés + montant >= 0', () => {
    const { Echeance } = require('./echeance.entity');
    const names = checksOf(Echeance);
    expect(names).toEqual(
      expect.arrayContaining([
        'CK_echeance_dates',
        'CK_echeance_statut',
        'CK_echeance_source',
        'CK_echeance_montant_theorique',
      ]),
    );
  });

  it('redevance : borne montants + dates + statut', () => {
    const { Redevance } = require('./redevance.entity');
    const names = checksOf(Redevance);
    expect(names).toEqual(
      expect.arrayContaining([
        'CK_redevance_montants',
        'CK_redevance_dates',
        'CK_redevance_statut',
      ]),
    );
  });

  it('tarif : montant >= 0, dates cohérentes, portée minimale, toutes dimensions configurables', () => {
    const { Tarif } = require('./tarif.entity');
    const names = checksOf(Tarif);
    expect(names).toEqual(
      expect.arrayContaining([
        'CK_tarif_montant_positif',
        'CK_tarif_dates',
        'CK_tarif_portee',
      ]),
    );
    const cols = storage.columns
      .filter((c) => c.target === Tarif)
      .map((c) => c.propertyName);
    for (const dim of [
      'typeDroitId',
      'periodiciteId',
      'marcheId',
      'zoneId',
      'localId',
      'typelocalId',
      'activiteId',
      'convention',
      'montant',
      'dateDebut',
      'dateFin',
    ]) {
      expect(cols).toContain(dim);
    }
  });

  it('affectation : unicité (commerçant, emplacement, début) + dates + statut + montant', () => {
    const { Affectation } = require('./affectation.entity');
    const names = checksOf(Affectation);
    expect(names).toEqual(
      expect.arrayContaining([
        'CK_affectation_dates',
        'CK_affectation_statut',
        'CK_affectation_montant',
      ]),
    );
    const uniques = uniquesOf(Affectation);
    expect(uniques).toContainEqual(['commercantId', 'localId', 'dateDebut']);
  });

  it('audit_log : action bornée (création / modification / suppression)', () => {
    const { AuditLog } = require('./audit_log.entity');
    expect(checksOf(AuditLog)).toContain('CK_audit_log_action');
  });

  it('periodicite : unité normalisée + nombre d\'unités > 0 (périodicités extensibles hors enum)', () => {
    const { Periodicite } = require('./periodicite.entity');
    const names = checksOf(Periodicite);
    expect(names).toEqual(
      expect.arrayContaining(['CK_periodicite_unite', 'CK_periodicite_unites']),
    );
  });

  it('quittance / controle / redevance : statuts bornés', () => {
    const { Quittance } = require('./quittance.entity');
    const { Controle } = require('./controle.entity');
    expect(checksOf(Quittance)).toEqual(
      expect.arrayContaining(['CK_quittance_statut', 'CK_quittance_montant']),
    );
    expect(checksOf(Controle)).toContain('CK_controle_statut');
  });

  it('location : dates cohérentes ; paiement : montant positif + canal borné', () => {
    const { Location } = require('../../location/entities/location.entity');
    const { Paiement } = require('../../paiement/entities/paiement.entity');
    expect(checksOf(Location)).toContain('CK_location_dates_coherentes');
    expect(checksOf(Paiement)).toEqual(
      expect.arrayContaining(['CK_paiement_montant_positif', 'CK_paiement_canal']),
    );
  });

  it('paiement_redevance : unicité (paiement, redevance) + montant imputé > 0', () => {
    const { PaiementRedevance } = require('./paiement_redevance.entity');
    expect(checksOf(PaiementRedevance)).toContain('CK_paiement_redevance_montant');
    expect(uniquesOf(PaiementRedevance)).toContainEqual(['paiementId', 'redevanceId']);
  });
});
