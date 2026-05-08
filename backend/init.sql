-- WaSaLei fake database seed
-- Database: digital_wardrobe
-- Charset: utf8mb4
-- Login examples:
--   demo@example.com / password123
--   premium@example.com / password123
--   traveler@example.com / password123

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
  `Used_Capacity` int DEFAULT NULL,
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
  CONSTRAINT `item_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`) ON DELETE CASCADE,
  CONSTRAINT `item_ibfk_2` FOREIGN KEY (`Space_ID`) REFERENCES `space` (`Space_ID`) ON DELETE SET NULL,
  CONSTRAINT `item_ibfk_3` FOREIGN KEY (`Type_ID`) REFERENCES `type` (`Type_ID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `item_color` (
  `Item_ID` int NOT NULL,
  `Color_ID` int NOT NULL,
  PRIMARY KEY (`Item_ID`,`Color_ID`),
  KEY `Color_ID` (`Color_ID`),
  CONSTRAINT `item_color_ibfk_1` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE,
  CONSTRAINT `item_color_ibfk_2` FOREIGN KEY (`Color_ID`) REFERENCES `color` (`Color_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `item_season` (
  `Item_ID` int NOT NULL,
  `Season_ID` int NOT NULL,
  PRIMARY KEY (`Item_ID`,`Season_ID`),
  KEY `Season_ID` (`Season_ID`),
  CONSTRAINT `item_season_ibfk_1` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_season_ibfk_2` FOREIGN KEY (`Season_ID`) REFERENCES `season` (`Season_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `item_style` (
  `Item_ID` int NOT NULL,
  `Style_ID` int NOT NULL,
  PRIMARY KEY (`Item_ID`,`Style_ID`),
  KEY `Style_ID` (`Style_ID`),
  CONSTRAINT `item_style_ibfk_1` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE,
  CONSTRAINT `item_style_ibfk_2` FOREIGN KEY (`Style_ID`) REFERENCES `style` (`Style_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `history` (
  `History_ID` int NOT NULL AUTO_INCREMENT,
  `Occasion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `User_ID` int NOT NULL,
  `Note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Time` time DEFAULT NULL,
  PRIMARY KEY (`History_ID`),
  KEY `User_ID` (`User_ID`),
  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `history_outfit` (
  `Outfit_ID` int NOT NULL AUTO_INCREMENT,
  `History_ID` int NOT NULL,
  `Item_ID` int NOT NULL,
  PRIMARY KEY (`Outfit_ID`),
  KEY `History_ID` (`History_ID`),
  KEY `Item_ID` (`Item_ID`),
  CONSTRAINT `history_outfit_ibfk_1` FOREIGN KEY (`History_ID`) REFERENCES `history` (`History_ID`) ON DELETE CASCADE,
  CONSTRAINT `history_outfit_ibfk_2` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users
INSERT INTO `user` (`User_ID`, `User_Name`, `User_Account`, `Password`, `Membership`, `Member_Date`) VALUES
(1, '林小衣', 'demo@example.com', 'password123', 'free', '2026-05-01 09:00:00'),
(2, '陳穿搭', 'premium@example.com', 'password123', 'premium', '2026-05-02 10:30:00'),
(3, '旅行愛好者', 'traveler@example.com', 'password123', 'free', '2026-05-03 14:15:00');

-- Clothing categories
INSERT INTO `type` (`Type_ID`, `Type_Name`) VALUES
(1, '上身長'),
(2, '上身短'),
(3, '下身長'),
(4, '下身短'),
(5, '配件'),
(6, '鞋類'),
(7, '其他');

-- Seasons
INSERT INTO `season` (`Season_ID`, `Season_Name`) VALUES
(1, '春'),
(2, '夏'),
(3, '秋'),
(4, '冬');

-- Styles
INSERT INTO `style` (`Style_ID`, `Style_Name`) VALUES
(1, '運動'),
(2, '正式'),
(3, '社交'),
(4, '日常'),
(5, '其他');

-- Colors supported by backend/color_parsing/services/color_mapper_lab.py
INSERT INTO `color` (`Color_ID`, `Color_Name`) VALUES
(1, '白色'),
(2, '灰色'),
(3, '黑色'),
(4, '紅色'),
(5, '粉紅色'),
(6, '橘色'),
(7, '黃色'),
(8, '米色'),
(9, '卡其色'),
(10, '棕色'),
(11, '綠色'),
(12, '藍綠色'),
(13, '藍色'),
(14, '紫色');

-- Storage spaces
INSERT INTO `space` (`Space_ID`, `Space_Type`, `Space_Name`, `User_ID`, `Capacity`, `Used_Capacity`) VALUES
(1, '衣櫃', '主臥衣櫃', 1, 20, 8),
(2, '衣櫃', '外套與正式服', 1, 10, 3),
(3, '行李箱', '週末小旅行', 1, 8, 2),
(4, '衣櫃', '運動衣物櫃', 2, 15, 3),
(5, '衣櫃', '日常穿搭櫃', 2, 18, 1),
(6, '行李箱', '出差行李箱', 3, 12, 1);

-- Items
INSERT INTO `item` (`Item_ID`, `Name`, `Notes`, `Photo`, `User_ID`, `Space_ID`, `Type_ID`) VALUES
(1, '白色棉質長袖襯衫', '可搭西裝或牛仔褲。', 'uploads/demo_white_shirt.jpg', 1, 1, 1),
(2, '黑色短袖 T 恤', '日常百搭款。', 'uploads/demo_black_tshirt.jpg', 1, 1, 2),
(3, '藍色牛仔長褲', '直筒版型。', 'uploads/demo_blue_jeans.jpg', 1, 1, 3),
(4, '卡其短褲', '夏天與旅行適合。', 'uploads/demo_khaki_shorts.jpg', 1, 1, 4),
(5, '棕色皮帶', '正式與日常皆可用。', 'uploads/demo_brown_belt.jpg', 1, 1, 5),
(6, '白色休閒鞋', '舒適好走。', 'uploads/demo_white_sneakers.jpg', 1, 1, 6),
(7, '灰色連帽外套', '春秋外搭。', 'uploads/demo_gray_hoodie.jpg', 1, 1, 1),
(8, '粉紅色短袖上衣', '明亮社交穿搭。', 'uploads/demo_pink_top.jpg', 1, 1, 2),
(9, '黑色西裝外套', '正式場合使用。', 'uploads/demo_black_blazer.jpg', 1, 2, 1),
(10, '黑色西裝長褲', '搭配西裝外套。', 'uploads/demo_black_slacks.jpg', 1, 2, 3),
(11, '紫色領帶', '正式穿搭點綴。', 'uploads/demo_purple_tie.jpg', 1, 2, 5),
(12, '綠色薄外套', '旅行備用外套。', 'uploads/demo_green_jacket.jpg', 1, 3, 1),
(13, '藍綠色運動短褲', '適合健身與跑步。', 'uploads/demo_teal_sport_shorts.jpg', 1, 3, 4),
(14, '紅色運動背心', '高強度訓練用。', 'uploads/demo_red_tank.jpg', 2, 4, 2),
(15, '黑色運動長褲', '訓練與通勤都可穿。', 'uploads/demo_black_joggers.jpg', 2, 4, 3),
(16, '橘色跑鞋', '跑步日專用。', 'uploads/demo_orange_running_shoes.jpg', 2, 4, 6),
(17, '米色針織衫', '日常溫柔色系。', 'uploads/demo_beige_knit.jpg', 2, 5, 1),
(18, '黃色雨衣', '出差與旅行備用。', 'uploads/demo_yellow_raincoat.jpg', 3, 6, 7);

-- Item colors, including multi-color items
INSERT INTO `item_color` (`Item_ID`, `Color_ID`) VALUES
(1, 1),
(2, 3),
(3, 13),
(4, 9),
(5, 10),
(6, 1), (6, 2),
(7, 2),
(8, 5),
(9, 3),
(10, 3),
(11, 14),
(12, 11),
(13, 12),
(14, 4),
(15, 3),
(16, 6), (16, 3),
(17, 8),
(18, 7);

-- Item seasons, demonstrating multi-select season support
INSERT INTO `item_season` (`Item_ID`, `Season_ID`) VALUES
(1, 1), (1, 3),
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 2), (3, 3), (3, 4),
(4, 2),
(5, 1), (5, 2), (5, 3), (5, 4),
(6, 1), (6, 2), (6, 3),
(7, 1), (7, 3),
(8, 2),
(9, 3), (9, 4),
(10, 3), (10, 4),
(11, 1), (11, 3), (11, 4),
(12, 1), (12, 3),
(13, 2),
(14, 2),
(15, 1), (15, 3), (15, 4),
(16, 1), (16, 2), (16, 3),
(17, 3), (17, 4),
(18, 1), (18, 2), (18, 3);

-- Item styles, also many-to-many
INSERT INTO `item_style` (`Item_ID`, `Style_ID`) VALUES
(1, 2), (1, 4),
(2, 4),
(3, 4),
(4, 4),
(5, 2), (5, 4),
(6, 1), (6, 4),
(7, 1), (7, 4),
(8, 3), (8, 4),
(9, 2),
(10, 2),
(11, 2), (11, 3),
(12, 4),
(13, 1),
(14, 1),
(15, 1), (15, 4),
(16, 1),
(17, 4),
(18, 5);

-- Outfit history records
INSERT INTO `history` (`History_ID`, `Occasion`, `Photo`, `User_ID`, `Note`, `Time`) VALUES
(1, '上班會議', 'uploads/history_work_meeting.jpg', 1, '正式但不要太沉重。', '08:30:00'),
(2, '週末咖啡廳', 'uploads/history_weekend_cafe.jpg', 1, '舒適日常穿搭。', '14:00:00'),
(3, '短途旅行', 'uploads/history_weekend_trip.jpg', 1, '行李箱內的輕便組合。', '09:15:00'),
(4, '健身房', 'uploads/history_gym.jpg', 2, '運動訓練穿搭。', '18:45:00'),
(5, '出差雨天', 'uploads/history_business_rain.jpg', 3, '雨天備用穿搭。', '07:50:00');

-- Outfit items inside each history entry
INSERT INTO `history_outfit` (`Outfit_ID`, `History_ID`, `Item_ID`) VALUES
(1, 1, 1),
(2, 1, 9),
(3, 1, 10),
(4, 1, 11),
(5, 2, 2),
(6, 2, 3),
(7, 2, 6),
(8, 3, 12),
(9, 3, 13),
(10, 3, 6),
(11, 4, 14),
(12, 4, 15),
(13, 4, 16),
(14, 5, 18),
(15, 5, 17);
