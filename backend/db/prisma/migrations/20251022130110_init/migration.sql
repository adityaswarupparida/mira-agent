-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('Pending', 'Resolved', 'Unresolved');

-- CreateTable
CREATE TABLE "help_requests" (
    "id" SERIAL NOT NULL,
    "request" TEXT NOT NULL,
    "response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded" BOOLEAN NOT NULL,
    "status" "request_status" NOT NULL,

    CONSTRAINT "help_requests_pkey" PRIMARY KEY ("id")
);
