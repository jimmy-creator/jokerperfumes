-- Influencer / partner referral program — schema changes to existing tables.
-- New tables (Influencers, Payouts, ReferralClicks) are created automatically
-- by Sequelize sync(). These ALTERs cover the pre-existing tables.
--   Run: mysql -u root jokerperfumes < migrations/2026-07-influencer-program.sql

ALTER TABLE `Orders`
  ADD COLUMN `influencerId` INT NULL,
  ADD COLUMN `referralCode` VARCHAR(255) NULL,
  ADD COLUMN `referralCampaign` VARCHAR(255) NULL,
  ADD COLUMN `commissionRate` DECIMAL(8,2) NULL,
  ADD COLUMN `commissionAmount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN `commissionStatus` ENUM('none','pending','approved','reversed','paid') NOT NULL DEFAULT 'none',
  ADD COLUMN `deliveredAt` DATETIME NULL;

ALTER TABLE `Coupons`
  ADD COLUMN `influencerId` INT NULL;

ALTER TABLE `Users`
  MODIFY COLUMN `role` ENUM('customer','admin','staff','cashier','influencer') DEFAULT 'customer';
