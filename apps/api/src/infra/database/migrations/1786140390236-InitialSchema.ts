import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786140390236 implements MigrationInterface {
    name = 'InitialSchema1786140390236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role" AS ENUM('admin', 'seller')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."user_role" NOT NULL, "job_title" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_users_email" ON "users" ("email") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE TYPE "public"."lead_source" AS ENUM('inbound', 'outbound', 'referral', 'event', 'social_media', 'other')`);
        await queryRunner.query(`CREATE TABLE "leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "company_name" character varying(255) NOT NULL, "role_title" character varying(255) NOT NULL, "source" "public"."lead_source" NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(32) NOT NULL, "seller_id" uuid NOT NULL, "observation" text, "last_interaction" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_leads_seller_id" ON "leads" ("seller_id") `);
        await queryRunner.query(`CREATE TYPE "public"."deal_status" AS ENUM('new', 'in_progress', 'won', 'lost')`);
        await queryRunner.query(`CREATE TABLE "deals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(32) NOT NULL, "name" character varying(255) NOT NULL, "lead_id" uuid NOT NULL, "seller_id" uuid NOT NULL, "estimated_value" numeric(14,2) NOT NULL, "expected_close_date" date, "description" text, "status" "public"."deal_status" NOT NULL DEFAULT 'new', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8c66f03b250f613ff8615940b4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_deals_code" ON "deals" ("code") `);
        await queryRunner.query(`CREATE INDEX "idx_deals_lead_id" ON "deals" ("lead_id") `);
        await queryRunner.query(`CREATE INDEX "idx_deals_seller_id" ON "deals" ("seller_id") `);
        await queryRunner.query(`CREATE INDEX "idx_deals_status" ON "deals" ("status") `);
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "author_id" uuid NOT NULL, "lead_id" uuid, "deal_id" uuid, "is_system_event" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "chk_comments_single_target" CHECK (("lead_id" IS NULL) <> ("deal_id" IS NULL)), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_comments_lead_id" ON "comments" ("lead_id") `);
        await queryRunner.query(`CREATE INDEX "idx_comments_deal_id" ON "comments" ("deal_id") `);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_40e52735bdf001b2e19968b7cf7" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deals" ADD CONSTRAINT "FK_96b51475f76f01c135ecdc968dc" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deals" ADD CONSTRAINT "FK_5a0726b1c4db7f2ddb57b441f71" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_e6d38899c31997c45d128a8973b" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_948c02b0d060ca84229ead46576" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_3e34e99678ae0ead92a4a31f866" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_3e34e99678ae0ead92a4a31f866"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_948c02b0d060ca84229ead46576"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_e6d38899c31997c45d128a8973b"`);
        await queryRunner.query(`ALTER TABLE "deals" DROP CONSTRAINT "FK_5a0726b1c4db7f2ddb57b441f71"`);
        await queryRunner.query(`ALTER TABLE "deals" DROP CONSTRAINT "FK_96b51475f76f01c135ecdc968dc"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_40e52735bdf001b2e19968b7cf7"`);
        await queryRunner.query(`DROP INDEX "public"."idx_comments_deal_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_comments_lead_id"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP INDEX "public"."idx_deals_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_deals_seller_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_deals_lead_id"`);
        await queryRunner.query(`DROP INDEX "public"."uq_deals_code"`);
        await queryRunner.query(`DROP TABLE "deals"`);
        await queryRunner.query(`DROP TYPE "public"."deal_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_leads_seller_id"`);
        await queryRunner.query(`DROP TABLE "leads"`);
        await queryRunner.query(`DROP TYPE "public"."lead_source"`);
        await queryRunner.query(`DROP INDEX "public"."uq_users_email"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_role"`);
    }

}
