/*
  Warnings:

  - A unique constraint covering the columns `[deadPersonSlug]` on the table `BiographyDraft` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `BiographyDraft_deadPersonSlug_key` ON `BiographyDraft`(`deadPersonSlug`);
