import { MigrationInterface, QueryRunner } from "typeorm";

export class PaiementCyclePerception1791404176607 implements MigrationInterface {
    name = 'PaiementCyclePerception1791404176607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paiement" ADD "commercantId" uuid`);
        await queryRunner.query(`ALTER TABLE "paiement" ADD "redevanceId" uuid`);
        await queryRunner.query(`ALTER TABLE "paiement" ADD "source" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "paiement" ADD CONSTRAINT "CK_paiement_source" CHECK ("source" IS NULL OR "source" IN ('TERRAIN', 'BUREAU', 'API_EXTERNE', 'IMPORT_HISTORIQUE'))`);
        await queryRunner.query(`ALTER TABLE "paiement" ADD CONSTRAINT "FK_9f7d65e089fffcd20f83f9c8443" FOREIGN KEY ("commercantId") REFERENCES "commercant"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "paiement" ADD CONSTRAINT "FK_60ea402d4d35a16527861742995" FOREIGN KEY ("redevanceId") REFERENCES "redevance"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paiement" DROP CONSTRAINT "FK_60ea402d4d35a16527861742995"`);
        await queryRunner.query(`ALTER TABLE "paiement" DROP CONSTRAINT "FK_9f7d65e089fffcd20f83f9c8443"`);
        await queryRunner.query(`ALTER TABLE "paiement" DROP CONSTRAINT "CK_paiement_source"`);
        await queryRunner.query(`ALTER TABLE "paiement" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "paiement" DROP COLUMN "redevanceId"`);
        await queryRunner.query(`ALTER TABLE "paiement" DROP COLUMN "commercantId"`);
    }

}
