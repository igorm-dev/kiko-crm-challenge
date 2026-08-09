import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserDisabledAt1786231835906 implements MigrationInterface {
    name = 'UserDisabledAt1786231835906';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "disabled_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE INDEX "idx_users_disabled_at" ON "users" ("disabled_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_users_disabled_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "disabled_at"`);
    }
}
