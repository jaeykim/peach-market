-- AlterTable
ALTER TABLE "Deal" ADD COLUMN "landlordApprovalStatus" TEXT;
ALTER TABLE "Deal" ADD COLUMN "landlordApprovedAt" DATETIME;
ALTER TABLE "Deal" ADD COLUMN "landlordRejectReason" TEXT;
