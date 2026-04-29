-- MySQL dump 10.13  Distrib 8.0.18, for Win64 (x86_64)
--
-- Host: localhost    Database: digital_wardrobe
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `color`
--

DROP TABLE IF EXISTS `color`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `color` (
  `Color_ID` int NOT NULL AUTO_INCREMENT,
  `Color_Name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Color_ID`),
  UNIQUE KEY `Color_Name` (`Color_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `color`
--

LOCK TABLES `color` WRITE;
/*!40000 ALTER TABLE `color` DISABLE KEYS */;
INSERT INTO `color` VALUES (9,'卡其色'),(10,'棕色'),(6,'橘色'),(2,'灰色'),(1,'白色'),(8,'米色'),(5,'粉紅色'),(4,'紅色'),(14,'紫色'),(11,'綠色'),(12,'藍綠色'),(13,'藍色'),(7,'黃色'),(3,'黑色');
/*!40000 ALTER TABLE `color` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history` (
  `History_ID` int NOT NULL AUTO_INCREMENT,
  `Occasion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `User_ID` int NOT NULL,
  PRIMARY KEY (`History_ID`),
  KEY `User_ID` (`User_ID`),
  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history`
--

LOCK TABLES `history` WRITE;
/*!40000 ALTER TABLE `history` DISABLE KEYS */;
/*!40000 ALTER TABLE `history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history_outfit`
--

DROP TABLE IF EXISTS `history_outfit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history_outfit`
--

LOCK TABLES `history_outfit` WRITE;
/*!40000 ALTER TABLE `history_outfit` DISABLE KEYS */;
/*!40000 ALTER TABLE `history_outfit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item`
--

DROP TABLE IF EXISTS `item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item`
--

LOCK TABLES `item` WRITE;
/*!40000 ALTER TABLE `item` DISABLE KEYS */;
INSERT INTO `item` VALUES (1,'純白短袖T恤','容易髒要注意',NULL,1,1,1),(2,'深藍色直筒牛仔褲','微彈性很舒服',NULL,1,1,2),(3,'黑色西裝外套','面試與正式場合穿',NULL,1,1,3),(4,'灰色百褶裙','材質偏厚',NULL,1,1,4),(5,'白色基本款帆布鞋','底有點硬',NULL,1,1,5),(6,'紅色保暖毛帽','去雪地玩買的',NULL,1,1,6),(7,'黃色碎花洋裝','去海邊度假穿',NULL,1,2,4),(8,'軍綠色多口袋工裝褲','',NULL,1,2,2),(9,'黑色高領羊毛衣','很保暖但需乾洗',NULL,1,1,1),(10,'卡其色防風風衣','防潑水材質',NULL,1,1,3),(11,'深灰寬鬆運動棉褲','當睡褲很舒服',NULL,1,1,2),(12,'白色長袖抗皺襯衫','上班必備',NULL,1,1,1),(13,'黑色亮面皮鞋','搭配西裝',NULL,1,1,5),(14,'藍白紅格紋法蘭絨襯衫','休閒百搭',NULL,1,2,1),(15,'黑色真皮皮帶','五金容易刮傷',NULL,1,1,6),(16,'粉色柔軟針織衫','洗過有點縮水',NULL,1,1,1),(17,'淺藍色牛仔短褲','超級涼爽',NULL,1,2,2),(18,'黑色長版連帽羽絨外套','寒流來才穿得到',NULL,1,1,3),(19,'白色運動長襪','消耗品',NULL,1,1,6),(20,'黑色漆皮包鞋','跟高5公分',NULL,1,1,5),(21,'防潑水機能衝鋒衣',NULL,'uploads/f7f7cadfc5e94490a0ea9963a4954e05.jpg',1,1,2);
/*!40000 ALTER TABLE `item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_color`
--

DROP TABLE IF EXISTS `item_color`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_color` (
  `Item_ID` int NOT NULL,
  `Color_ID` int NOT NULL,
  PRIMARY KEY (`Item_ID`,`Color_ID`),
  KEY `Color_ID` (`Color_ID`),
  CONSTRAINT `item_color_ibfk_1` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE,
  CONSTRAINT `item_color_ibfk_2` FOREIGN KEY (`Color_ID`) REFERENCES `color` (`Color_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_color`
--

LOCK TABLES `item_color` WRITE;
/*!40000 ALTER TABLE `item_color` DISABLE KEYS */;
/*!40000 ALTER TABLE `item_color` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_season`
--

DROP TABLE IF EXISTS `item_season`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_season` (
  `Item_ID` int NOT NULL,
  `Season_ID` int NOT NULL,
  PRIMARY KEY (`Item_ID`,`Season_ID`),
  KEY `Season_ID` (`Season_ID`),
  CONSTRAINT `item_season_ibfk_1` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_season_ibfk_2` FOREIGN KEY (`Season_ID`) REFERENCES `season` (`Season_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_season`
--

LOCK TABLES `item_season` WRITE;
/*!40000 ALTER TABLE `item_season` DISABLE KEYS */;
/*!40000 ALTER TABLE `item_season` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_style`
--

DROP TABLE IF EXISTS `item_style`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_style` (
  `Item_ID` int NOT NULL,
  `Style_ID` int NOT NULL,
  PRIMARY KEY (`Item_ID`,`Style_ID`),
  KEY `Style_ID` (`Style_ID`),
  CONSTRAINT `item_style_ibfk_1` FOREIGN KEY (`Item_ID`) REFERENCES `item` (`Item_ID`) ON DELETE CASCADE,
  CONSTRAINT `item_style_ibfk_2` FOREIGN KEY (`Style_ID`) REFERENCES `style` (`Style_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_style`
--

LOCK TABLES `item_style` WRITE;
/*!40000 ALTER TABLE `item_style` DISABLE KEYS */;
INSERT INTO `item_style` VALUES (1,1),(11,1),(14,1),(3,2),(21,2),(11,3),(1,4),(11,4),(21,4);
/*!40000 ALTER TABLE `item_style` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `season`
--

DROP TABLE IF EXISTS `season`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `season` (
  `Season_ID` int NOT NULL AUTO_INCREMENT,
  `Season_Name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Season_ID`),
  UNIQUE KEY `Season_Name` (`Season_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `season`
--

LOCK TABLES `season` WRITE;
/*!40000 ALTER TABLE `season` DISABLE KEYS */;
INSERT INTO `season` VALUES (4,'冬季'),(5,'四季皆宜'),(2,'夏季'),(1,'春季'),(3,'秋季');
/*!40000 ALTER TABLE `season` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `space`
--

DROP TABLE IF EXISTS `space`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `space` (
  `Space_ID` int NOT NULL AUTO_INCREMENT,
  `Space_Type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Capacity` int DEFAULT NULL,
  `User_ID` int NOT NULL,
  PRIMARY KEY (`Space_ID`),
  KEY `User_ID` (`User_ID`),
  CONSTRAINT `space_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `space`
--

LOCK TABLES `space` WRITE;
/*!40000 ALTER TABLE `space` DISABLE KEYS */;
INSERT INTO `space` VALUES (1,'衣櫃',20,1),(2,'行李箱',40,1),(3,'衣櫃',20,1),(4,'行李箱',40,1),(5,'衣櫃',20,1),(6,'行李箱',40,1),(7,'衣櫃',20,1),(8,'行李箱',40,1),(9,'衣櫃',20,1),(10,'行李箱',40,1),(11,'衣櫃',20,1),(12,'行李箱',40,1),(13,'衣櫃',20,1),(14,'行李箱',40,1);
/*!40000 ALTER TABLE `space` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `style`
--

DROP TABLE IF EXISTS `style`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `style` (
  `Style_ID` int NOT NULL AUTO_INCREMENT,
  `Style_Name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Style_ID`),
  UNIQUE KEY `Style_Name` (`Style_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `style`
--

LOCK TABLES `style` WRITE;
/*!40000 ALTER TABLE `style` DISABLE KEYS */;
INSERT INTO `style` VALUES (1,'休閒'),(4,'居家'),(2,'正式'),(5,'派對'),(3,'運動');
/*!40000 ALTER TABLE `style` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `type`
--

DROP TABLE IF EXISTS `type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `type` (
  `Type_ID` int NOT NULL AUTO_INCREMENT,
  `Type_Name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Type_ID`),
  UNIQUE KEY `Type_Name` (`Type_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `type`
--

LOCK TABLES `type` WRITE;
/*!40000 ALTER TABLE `type` DISABLE KEYS */;
INSERT INTO `type` VALUES (1,'上衣'),(3,'外套'),(4,'裙子'),(2,'褲子'),(6,'配件'),(5,'鞋子');
/*!40000 ALTER TABLE `type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `User_ID` int NOT NULL AUTO_INCREMENT,
  `User_Name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `User_Account` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Membership` enum('free','premium') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `Member_Date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`User_ID`),
  UNIQUE KEY `User_Account` (`User_Account`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'測試','test@example.com','123456','free','2026-04-09 11:07:36');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'digital_wardrobe'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-29 20:10:25
