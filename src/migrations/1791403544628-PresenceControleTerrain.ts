import { MigrationInterface, QueryRunner } from "typeorm";

export class PresenceControleTerrain1791403544628 implements MigrationInterface {
    name = 'PresenceControleTerrain1791403544628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "presence" ADD "latitude" numeric(12,6)`);
        await queryRunner.query(`ALTER TABLE "presence" ADD "longitude" numeric(12,6)`);
        await queryRunner.query(`ALTER TABLE "presence" ADD "precisionGps" numeric(8,2)`);
        await queryRunner.query(`ALTER TABLE "controle" ADD "latitude" numeric(12,6)`);
        await queryRunner.query(`ALTER TABLE "controle" ADD "longitude" numeric(12,6)`);
        await queryRunner.query(`ALTER TABLE "controle" ADD "precisionGps" numeric(8,2)`);
        await queryRunner.query(`ALTER TABLE "controle" ADD "resultat" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "controle" ADD "comparerPosition" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "presence" ADD CONSTRAINT "CK_presence_source" CHECK ("source" IN ('GPS', 'MANUEL', 'SCAN'))`);
        await queryRunner.query(`ALTER TABLE "controle" ADD CONSTRAINT "CK_controle_resultat" CHECK ("resultat" IS NULL OR "resultat" IN ('CONFORME', 'ANOMALIE', 'HORS_ZONE', 'GPS_INDISPONIBLE', 'FAIBLE_PRECISION', 'SANS_EMPLACEMENT_FIXE', 'CONTROLE_MANUEL'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "controle" DROP CONSTRAINT "CK_controle_resultat"`);
        await queryRunner.query(`ALTER TABLE "presence" DROP CONSTRAINT "CK_presence_source"`);
        await queryRunner.query(`ALTER TABLE "controle" DROP COLUMN "comparerPosition"`);
        await queryRunner.query(`ALTER TABLE "controle" DROP COLUMN "resultat"`);
        await queryRunner.query(`ALTER TABLE "controle" DROP COLUMN "precisionGps"`);
        await queryRunner.query(`ALTER TABLE "controle" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "controle" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "presence" DROP COLUMN "precisionGps"`);
        await queryRunner.query(`ALTER TABLE "presence" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "presence" DROP COLUMN "latitude"`);
    }

}
