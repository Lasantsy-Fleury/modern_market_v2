import { MigrationInterface, QueryRunner } from "typeorm";

export class AuditOperation1791404936354 implements MigrationInterface {
    name = 'AuditOperation1791404936354'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_log" ADD "operation" character varying(30)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_log" DROP COLUMN "operation"`);
    }

}
