import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadRoleTitleNullable1786221597093 implements MigrationInterface {
    name = 'LeadRoleTitleNullable1786221597093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" ALTER COLUMN "role_title" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" ALTER COLUMN "role_title" SET NOT NULL`);
    }

}
