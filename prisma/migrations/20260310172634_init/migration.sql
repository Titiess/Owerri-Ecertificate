-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('CHAIRMAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('STATE_OF_ORIGIN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PAYMENT_PENDING', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "name" TEXT NOT NULL,
    "signatureUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "nativeOf" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "stateOfOrigin" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "motherName" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "certificateType" "CertificateType" NOT NULL DEFAULT 'STATE_OF_ORIGIN',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PAYMENT_PENDING',
    "rejectionReason" TEXT,
    "paymentReference" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "hash" TEXT,
    "certificatePdfUrl" TEXT,
    "approvedById" TEXT,
    "approvalChairmanId" TEXT,
    "approvalSignatureUrl" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_files" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applicants_email_key" ON "applicants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "applications_referenceNo_key" ON "applications"("referenceNo");

-- CreateIndex
CREATE UNIQUE INDEX "applications_hash_key" ON "applications"("hash");

-- CreateIndex
CREATE INDEX "applications_applicantId_idx" ON "applications"("applicantId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_certificateType_idx" ON "applications"("certificateType");

-- CreateIndex
CREATE INDEX "applications_paymentStatus_idx" ON "applications"("paymentStatus");

-- CreateIndex
CREATE INDEX "application_files_applicationId_idx" ON "application_files"("applicationId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_approvalChairmanId_fkey" FOREIGN KEY ("approvalChairmanId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_files" ADD CONSTRAINT "application_files_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
