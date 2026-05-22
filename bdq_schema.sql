-- ============================================================
-- BDQ SYSTEM - MySQL Database Schema
-- Barangay Health Center Child Health Monitoring System
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- ============================================================
-- 1. USER
-- ============================================================
CREATE TABLE IF NOT EXISTS `user` (
  `user_id`          BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `first_name`       VARCHAR(50)        NOT NULL,
  `middle_name`      VARCHAR(50)        DEFAULT NULL,
  `last_name`        VARCHAR(50)        NOT NULL,
  `date_of_birth`    DATE               DEFAULT NULL,
  `role`             ENUM('Nurse','Midwife','Admin','Assistant') NOT NULL,
  `username`         VARCHAR(30)        NOT NULL UNIQUE,
  `password_hash`    VARCHAR(255)       NOT NULL,
  `contact_number`   VARCHAR(15)        DEFAULT NULL,
  `email`            VARCHAR(50)        DEFAULT NULL,
  `account_status`   ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at`       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS `audit_log` (
  `log_id`            BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`           BIGINT UNSIGNED    NOT NULL,
  `action_performed`  VARCHAR(50)        NOT NULL,
  `target_table`      VARCHAR(50)        NOT NULL,
  `target_record_id`  BIGINT UNSIGNED    DEFAULT NULL,
  `action_timestamp`  DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description`       VARCHAR(255)       DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_timestamp` (`action_timestamp`),
  CONSTRAINT `fk_audit_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. CHILD PATIENT
-- ============================================================
CREATE TABLE IF NOT EXISTS `child_patient` (
  `child_id`                          BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `registered_by_user_id`             BIGINT UNSIGNED    NOT NULL,
  `date_of_registration`              DATE               NOT NULL,
  `family_serial_number`              VARCHAR(20)        NOT NULL,
  `first_name`                        VARCHAR(50)        NOT NULL,
  `middle_initial`                    VARCHAR(5)         DEFAULT NULL,
  `last_name`                         VARCHAR(50)        NOT NULL,
  `sex`                               ENUM('M','F')      NOT NULL,
  `date_of_birth`                     DATE               NOT NULL,
  `mother_complete_name`              VARCHAR(100)       NOT NULL,
  `complete_address`                  VARCHAR(100)       NOT NULL,
  `contact_number`                    VARCHAR(20)        DEFAULT NULL,
  `se_status`                         ENUM('NHTS','Non-NHTS') NOT NULL,
  `length_at_birth_cm`               DECIMAL(5,2)       NOT NULL,
  `weight_at_birth_kg`               DECIMAL(5,2)       NOT NULL,
  `birth_weight_status`              ENUM('Low','Normal','Unknown') NOT NULL,
  -- Breastfeeding summary fields (from paper form, filled at registration)
  `initiated_breastfeeding_date`     DATE               DEFAULT NULL,
  `exclusively_breastfed_6_months`   ENUM('Yes','No')   DEFAULT NULL,
  `intro_complementary_foods`        ENUM('Yes','No')   DEFAULT NULL,
  -- Immunization completion dates (manually entered, nullable until confirmed)
  `fic_date`                         DATE               DEFAULT NULL,
  `cic_date`                         DATE               DEFAULT NULL,
  `remarks`                          VARCHAR(255)       DEFAULT NULL,
  `created_at`                       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`child_id`),
  KEY `idx_child_name` (`last_name`, `first_name`),
  KEY `idx_child_fsn` (`family_serial_number`),
  KEY `idx_child_registered_by` (`registered_by_user_id`),
  CONSTRAINT `fk_child_registered_by`
    FOREIGN KEY (`registered_by_user_id`) REFERENCES `user` (`user_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. CHILD IMMUNIZATION RECORD
-- (Many records per child — one row per vaccine dose given)
-- ============================================================
CREATE TABLE IF NOT EXISTS `child_immunization_record` (
  `immunization_id`        BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `child_id`               BIGINT UNSIGNED    NOT NULL,
  `vaccine_type`           VARCHAR(50)        NOT NULL,
  `dose_number`            TINYINT UNSIGNED   NOT NULL,   -- 1–10
  `date_administered`      DATE               NOT NULL,
  `administered_by_user_id` BIGINT UNSIGNED   NOT NULL,
  `remarks`                VARCHAR(255)       DEFAULT NULL,
  `created_at`             DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`immunization_id`),
  KEY `idx_imm_child` (`child_id`),
  CONSTRAINT `fk_imm_child`
    FOREIGN KEY (`child_id`) REFERENCES `child_patient` (`child_id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_imm_user`
    FOREIGN KEY (`administered_by_user_id`) REFERENCES `user` (`user_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. NUTRITIONAL ASSESSMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS `nutritional_assessment` (
  `assessment_id`              BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `child_id`                   BIGINT UNSIGNED    NOT NULL,
  `assessment_period`          ENUM('1-3 months','6-11 months','12 months') NOT NULL,
  `age_in_months_at_assessment` TINYINT UNSIGNED  NOT NULL,  -- 0–60
  `length_cm`                  DECIMAL(5,2)       NOT NULL,
  `length_date_taken`          DATE               NOT NULL,
  `weight_kg`                  DECIMAL(5,2)       NOT NULL,
  `weight_date_taken`          DATE               NOT NULL,
  `nutritional_status`         ENUM('Underweight','Stunted','Wasted','Obese','Normal') NOT NULL,
  `assessed_by_user_id`        BIGINT UNSIGNED    NOT NULL,
  `remarks`                    VARCHAR(255)       DEFAULT NULL,
  `created_at`                 DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                 DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assessment_id`),
  KEY `idx_assessment_child` (`child_id`),
  CONSTRAINT `fk_assessment_child`
    FOREIGN KEY (`child_id`) REFERENCES `child_patient` (`child_id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_assessment_user`
    FOREIGN KEY (`assessed_by_user_id`) REFERENCES `user` (`user_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. SUPPLEMENTATION RECORD
-- ============================================================
CREATE TABLE IF NOT EXISTS `supplementation_record` (
  `supplement_id`          BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `child_id`               BIGINT UNSIGNED    NOT NULL,
  `supplement_type`        ENUM('Iron','Vitamin A','MNP') NOT NULL,
  `target_age_months`      TINYINT UNSIGNED   NOT NULL,  -- 0–60
  `date_given`             DATE               NOT NULL,
  `administered_by_user_id` BIGINT UNSIGNED   NOT NULL,
  `remarks`                VARCHAR(255)       DEFAULT NULL,
  `created_at`             DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`supplement_id`),
  KEY `idx_supplement_child` (`child_id`),
  CONSTRAINT `fk_supplement_child`
    FOREIGN KEY (`child_id`) REFERENCES `child_patient` (`child_id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_supplement_user`
    FOREIGN KEY (`administered_by_user_id`) REFERENCES `user` (`user_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. BREASTFEEDING CHECKPOINT
-- ============================================================
CREATE TABLE IF NOT EXISTS `breastfeeding_checkpoint` (
  `checkpoint_id`          BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `child_id`               BIGINT UNSIGNED    NOT NULL,
  `age_month_target`       TINYINT UNSIGNED   NOT NULL,  -- 0–24
  `is_exclusively_breastfed` ENUM('Yes','No') NOT NULL,
  `check_date`             DATE               NOT NULL,
  `recorded_by_user_id`    BIGINT UNSIGNED    NOT NULL,
  `remarks`                VARCHAR(255)       DEFAULT NULL,
  `created_at`             DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`checkpoint_id`),
  KEY `idx_bf_child` (`child_id`),
  CONSTRAINT `fk_bf_child`
    FOREIGN KEY (`child_id`) REFERENCES `child_patient` (`child_id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_bf_user`
    FOREIGN KEY (`recorded_by_user_id`) REFERENCES `user` (`user_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. MEDICINE
-- ============================================================
CREATE TABLE IF NOT EXISTS `medicine` (
  `medicine_id`        BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `medicine_name`      VARCHAR(100)       NOT NULL,
  `generic_name`       VARCHAR(100)       NOT NULL,
  `medicine_category`  ENUM('Tablet','Syrup','Capsule','Injection','Nebule','Sachet','Drops','Ointment') NOT NULL,
  `unit_of_measure`    VARCHAR(20)        NOT NULL,
  `description`        VARCHAR(255)       DEFAULT NULL,
  `reorder_level`      SMALLINT UNSIGNED  NOT NULL DEFAULT 0,  -- 0–1000, triggers low stock alert
  `created_by_user_id` BIGINT UNSIGNED    NOT NULL,
  `created_at`         DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`medicine_id`),
  KEY `idx_medicine_name` (`medicine_name`),
  CONSTRAINT `fk_medicine_user`
    FOREIGN KEY (`created_by_user_id`) REFERENCES `user` (`user_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. INVENTORY
-- (Per batch tracking with expiry date)
-- ============================================================
CREATE TABLE IF NOT EXISTS `inventory` (
  `inventory_id`      BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `medicine_id`       BIGINT UNSIGNED    NOT NULL,
  `batch_number`      VARCHAR(20)        NOT NULL,
  `quantity_in_stock` SMALLINT UNSIGNED  NOT NULL DEFAULT 0,  -- 0–10000
  `expiration_date`   DATE               NOT NULL,
  `date_received`     DATE               NOT NULL,
  `supplier_name`     VARCHAR(50)        NOT NULL,
  `storage_location`  VARCHAR(50)        DEFAULT NULL,
  `created_at`        DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated`      DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`inventory_id`),
  KEY `idx_inventory_medicine` (`medicine_id`),
  KEY `idx_inventory_expiry` (`expiration_date`),
  CONSTRAINT `fk_inventory_medicine`
    FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. DISPENSING TRANSACTION
-- (Child patients only)
-- ============================================================
CREATE TABLE IF NOT EXISTS `dispensing_transaction` (
  `transaction_id`    BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`           BIGINT UNSIGNED    NOT NULL,
  `child_id`          BIGINT UNSIGNED    NOT NULL,
  `transaction_date`  DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes`             VARCHAR(255)       DEFAULT NULL,
  `created_at`        DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_txn_child` (`child_id`),
  KEY `idx_txn_user` (`user_id`),
  KEY `idx_txn_date` (`transaction_date`),
  CONSTRAINT `fk_txn_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_txn_child`
    FOREIGN KEY (`child_id`) REFERENCES `child_patient` (`child_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. DISPENSED MEDICINE
-- (Line items per dispensing transaction)
-- ============================================================
CREATE TABLE IF NOT EXISTS `dispensed_medicine` (
  `dispensed_medicine_id` BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `transaction_id`        BIGINT UNSIGNED  NOT NULL,
  `medicine_id`           BIGINT UNSIGNED  NOT NULL,
  `quantity_dispensed`    SMALLINT UNSIGNED NOT NULL,   -- 1–1000
  `dosage_instruction`    VARCHAR(100)     NOT NULL,
  `duration_days`         SMALLINT UNSIGNED NOT NULL,   -- 1–365
  `remarks`               VARCHAR(255)     DEFAULT NULL,
  PRIMARY KEY (`dispensed_medicine_id`),
  KEY `idx_disp_transaction` (`transaction_id`),
  KEY `idx_disp_medicine` (`medicine_id`),
  CONSTRAINT `fk_disp_transaction`
    FOREIGN KEY (`transaction_id`) REFERENCES `dispensing_transaction` (`transaction_id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_disp_medicine`
    FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SCHEMA
-- Tables created (in dependency order):
--   1.  user
--   2.  audit_log
--   3.  child_patient
--   5.  child_immunization_record
--   6.  nutritional_assessment
--   7.  supplementation_record
--   8.  breastfeeding_checkpoint
--   9.  medicine
--   10. inventory
--   11. dispensing_transaction
--   12. dispensed_medicine
-- ============================================================
