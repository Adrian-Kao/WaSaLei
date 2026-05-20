-- WaSaLei schema-only database initialization
-- Database: digital_wardrobe
-- Charset: utf8mb4
-- This file creates tables, constraints, and indexes only. It inserts no seed data.

CREATE DATABASE IF NOT EXISTS `digital_wardrobe`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `digital_wardrobe`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `history_outfit`;
DROP TABLE IF EXISTS `history`;
DROP TABLE IF EXISTS `item_style`;
DROP TABLE IF EXISTS `item_season`;
DROP TABLE IF EXISTS `item_color`;
DROP TABLE IF EXISTS `item`;
DROP TABLE IF EXISTS `space`;
DROP TABLE IF EXISTS `style`;
DROP TABLE IF EXISTS `season`;
DROP TABLE IF EXISTS `color`;
DROP TABLE IF EXISTS `type`;
DROP TABLE IF EXISTS `user`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `user` (
  `User_ID` int NOT NULL AUTO_INCREMENT,
  `User_Name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `User_Account` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Membership` enum('free','premium') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `Member_Date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`User_ID`),
  UNIQUE KEY `User_Account` (`User_Account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `type` (
  `Type_ID` int NOT NULL AUTO_INCREMENT,
  `Type_Name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Type_ID`),
  UNIQUE KEY `Type_Name` (`Type_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `color` (
  `Color_ID` int NOT NULL AUTO_INCREMENT,
  `Color_Name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Color_ID`),
  UNIQUE KEY `Color_Name` (`Color_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `season` (
  `Season_ID` int NOT NULL AUTO_INCREMENT,
  `Season_Name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Season_ID`),
  UNIQUE KEY `Season_Name` (`Season_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `style` (
  `Style_ID` int NOT NULL AUTO_INCREMENT,
  `Style_Name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Style_ID`),
  UNIQUE KEY `Style_Name` (`Style_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `space` (
  `Space_ID` int NOT NULL AUTO_INCREMENT,
  `Space_Type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Space_Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `User_ID` int NOT NULL,
  `Capacity` int DEFAULT NULL,
  `Used_Capacity` int DEFAULT 0,
  PRIMARY KEY (`Space_ID`),
  KEY `User_ID` (`User_ID`),
  CONSTRAINT `space_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `item` (
  `Item_ID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `User_ID` int NOT NULL,
  `Space_ID` int DEFAULT NULL,
  `Type_ID` int DEFAULT NULL,
  PRIMARY KEY (`Item_ID`),
  KEY `User_ID` (`User_ID`),
  KEY `Space_ID` (`Space_ID`),
  KEY `Type_ID` (`Type_ID`),
  KEY `idx_item_user_space` (`User_ID`, `Space_ID`),
  KEY `idx_item_user_type` (`User_ID`, `Type_ID`),
  KEY `idx_item_name` (`Name`),
  CONSTRAINT `item_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`) ON DELETE CASCADE,
  CONSTRAINT `item_ibfk_2` FOREIGN KEY (`Space_ID`) REFERENCES `space` (`Space_ID`) ON DELETE SET NULL,
  CONSTRAINT `item_ibfk_3` FOREIGN KEY (`Type_ID`) REFERENCES `type` (`Type_ID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `item_color` (
  `Item_ID` int NOT NULL,
  `Color_ID` int NOT NULL,
  PRIMARY KEY (`Item_ID`, `Color_ID`),
  KEY `Color_ID` (`Color_ID`),
  KEY `idx_item_color_color_item` (`Color_ID`, `Item_ID`),
  CONSTRAINT `item_color_ibfk_1` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE,
  CONSTRAINT `item_color_ibfk_2` FOREIGN KEY (`Color_ID`) REFERENCES `color` (`Color_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `item_season` (
  `Item_ID` int NOT NULL,
  `Season_ID` int NOT NULL,
  PRIMARY KEY (`Item_ID`, `Season_ID`),
  KEY `Season_ID` (`Season_ID`),
  KEY `idx_item_season_season_item` (`Season_ID`, `Item_ID`),
  CONSTRAINT `item_season_ibfk_1` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_season_ibfk_2` FOREIGN KEY (`Season_ID`) REFERENCES `season` (`Season_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `item_style` (
  `Item_ID` int NOT NULL,
  `Style_ID` int NOT NULL,
  PRIMARY KEY (`Item_ID`, `Style_ID`),
  KEY `Style_ID` (`Style_ID`),
  KEY `idx_item_style_style_item` (`Style_ID`, `Item_ID`),
  CONSTRAINT `item_style_ibfk_1` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE,
  CONSTRAINT `item_style_ibfk_2` FOREIGN KEY (`Style_ID`) REFERENCES `style` (`Style_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `history` (
  `History_ID` int NOT NULL AUTO_INCREMENT,
  `Occasion` enum('日常','上班','正式','社交','運動','旅行','其他') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '其他',
  `Photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `User_ID` int NOT NULL,
  `Note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Worn_Date` date DEFAULT NULL,
  PRIMARY KEY (`History_ID`),
  KEY `User_ID` (`User_ID`),
  KEY `idx_history_user_occasion` (`User_ID`, `Occasion`),
  KEY `idx_history_user_date` (`User_ID`, `Worn_Date`),
  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `history_outfit` (
  `Outfit_ID` int NOT NULL AUTO_INCREMENT,
  `History_ID` int NOT NULL,
  `Item_ID` int NOT NULL,
  PRIMARY KEY (`Outfit_ID`),
  KEY `History_ID` (`History_ID`),
  KEY `Item_ID` (`Item_ID`),
  KEY `idx_history_outfit_item_history` (`Item_ID`, `History_ID`),
  KEY `idx_history_outfit_history_item` (`History_ID`, `Item_ID`),
  CONSTRAINT `history_outfit_ibfk_1` FOREIGN KEY (`History_ID`) REFERENCES `history` (`History_ID`) ON DELETE CASCADE,
  CONSTRAINT `history_outfit_ibfk_2` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;