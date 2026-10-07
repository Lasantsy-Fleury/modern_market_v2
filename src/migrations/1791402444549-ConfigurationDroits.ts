import { MigrationInterface, QueryRunner } from "typeorm";

export class ConfigurationDroits1791402444549 implements MigrationInterface {
    name = 'ConfigurationDroits1791402444549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "periodicite" ADD "actif" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "type_droit" ADD "famille" character varying(10) NOT NULL DEFAULT 'DROIT'`);
        await queryRunner.query(`ALTER TABLE "type_droit" ADD "reglesRenouvellement" jsonb`);
        await queryRunner.query(`ALTER TABLE "type_droit" ADD CONSTRAINT "CK_type_droit_famille" CHECK ("famille" IN ('DROIT', 'TICKET'))`);
        await queryRunner.query(`ALTER TABLE "type_droit" ADD CONSTRAINT "CK_type_droit_portee" CHECK ("portee" IN ('EMPLACEMENT', 'ZONE', 'MARCHE'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "type_droit" DROP CONSTRAINT "CK_type_droit_portee"`);
        await queryRunner.query(`ALTER TABLE "type_droit" DROP CONSTRAINT "CK_type_droit_famille"`);
        await queryRunner.query(`ALTER TABLE "type_droit" DROP COLUMN "reglesRenouvellement"`);
        await queryRunner.query(`ALTER TABLE "type_droit" DROP COLUMN "famille"`);
        await queryRunner.query(`ALTER TABLE "periodicite" DROP COLUMN "actif"`);
    }

}
