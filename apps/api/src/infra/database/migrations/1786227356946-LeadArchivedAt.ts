import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadArchivedAt1786227356946 implements MigrationInterface {
    name = 'LeadArchivedAt1786227356946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" ADD "archived_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE INDEX "idx_leads_archived_at" ON "leads" ("archived_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_leads_archived_at"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "archived_at"`);
    }

}
