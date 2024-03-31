-- CreateTable
CREATE TABLE "PasswordResets" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResets_email_key" ON "PasswordResets"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResets_code_key" ON "PasswordResets"("code");
