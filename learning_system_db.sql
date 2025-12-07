-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 06, 2025 at 02:10 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `learning_system_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `activity_type` enum('visual','auditory','tactile') NOT NULL,
  `difficulty_level` int(11) DEFAULT 1,
  `duration_minutes` int(11) DEFAULT 10,
  `icon` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `name`, `description`, `activity_type`, `difficulty_level`, `duration_minutes`, `icon`, `created_at`, `updated_at`) VALUES
(1, 'Color Matching', 'Match colors with visual cues and patterns', 'visual', 1, 10, '🎨', '2025-11-11 14:00:23', '2025-11-11 14:00:23'),
(2, 'Sound Recognition', 'Identify different sounds and musical notes', 'auditory', 1, 8, '🎵', '2025-11-11 14:00:23', '2025-11-11 14:00:23'),
(3, 'Texture Learning', 'Explore tactile learning with different textures', 'tactile', 1, 12, '✋', '2025-11-11 14:00:23', '2025-11-11 14:00:23'),
(4, 'Shape Learning', 'Learn geometric shapes visually', 'visual', 2, 15, '⬛', '2025-11-11 14:00:23', '2025-11-11 14:00:23'),
(5, 'Music Therapy', 'Therapeutic music listening and interaction', 'auditory', 2, 20, '🎶', '2025-11-11 14:00:23', '2025-11-11 14:00:23'),
(6, 'Object Recognition', 'Identify common objects through touch', 'tactile', 2, 15, '🎁', '2025-11-11 14:00:23', '2025-11-11 14:00:23'),
(7, 'Pattern Recognition', 'Identify visual patterns and sequences', 'visual', 2, 12, '🔷', '2025-11-11 14:00:23', '2025-11-11 14:00:23'),
(8, 'Rhythm Training', 'Learn rhythmic patterns through sound', 'auditory', 2, 15, '🥁', '2025-11-11 14:00:23', '2025-11-11 14:00:23');

-- --------------------------------------------------------

--
-- Table structure for table `engagement_logs`
--

CREATE TABLE `engagement_logs` (
  `id` int(11) NOT NULL,
  `learner_id` int(11) DEFAULT NULL,
  `activity_id` int(11) NOT NULL,
  `engagement_level` decimal(5,2) DEFAULT NULL,
  `duration_completed` int(11) DEFAULT NULL,
  `performance_score` decimal(5,2) DEFAULT NULL,
  `feedback_sentiment` varchar(50) DEFAULT NULL,
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `engagement_logs`
--

INSERT INTO `engagement_logs` (`id`, `learner_id`, `activity_id`, `engagement_level`, `duration_completed`, `performance_score`, `feedback_sentiment`, `completed_at`) VALUES
(11, 3, 1, NULL, NULL, 20.00, NULL, '2025-11-29 20:47:06'),
(12, 4, 1, NULL, NULL, 30.00, NULL, '2025-11-29 20:49:16'),
(13, 3, 1, NULL, NULL, 30.00, NULL, '2025-11-29 20:49:29');

-- --------------------------------------------------------

--
-- Table structure for table `learners`
--

CREATE TABLE `learners` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `age` int(11) DEFAULT NULL,
  `diagnosis` varchar(200) DEFAULT NULL,
  `learning_style` enum('visual','auditory','tactile') DEFAULT 'visual',
  `progress_score` decimal(5,2) DEFAULT 0.00,
  `engagement_score` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `learners`
--

INSERT INTO `learners` (`id`, `user_id`, `full_name`, `gender`, `age`, `diagnosis`, `learning_style`, `progress_score`, `engagement_score`, `created_at`, `updated_at`) VALUES
(3, NULL, 'Johnny Test', 'male', 7, 'Autism Spectrum Disorder', 'visual', 0.00, 0.00, '2025-11-29 20:45:48', '2025-11-29 20:45:48'),
(4, NULL, 'Sarah Sample', 'female', 6, 'ADHD', 'auditory', 0.00, 0.00, '2025-11-29 20:45:48', '2025-11-29 21:28:13');

-- --------------------------------------------------------

--
-- Table structure for table `therapist_assignments`
--

CREATE TABLE `therapist_assignments` (
  `id` int(11) NOT NULL,
  `therapist_id` int(11) NOT NULL,
  `learner_id` int(11) DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('patient','therapist','admin') NOT NULL DEFAULT 'patient',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES
(1, 'therapist1', 'therapist1@sensorypalette.com', 'therapist1', 'therapist', '2025-11-11 14:00:23', '2025-11-22 04:35:27'),
(2, 'admin1', 'admin1@sensorypalette.com', 'admin1', 'admin', '2025-11-11 14:00:23', '2025-11-22 04:35:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `engagement_logs`
--
ALTER TABLE `engagement_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`learner_id`),
  ADD KEY `activity_id` (`activity_id`);

--
-- Indexes for table `learners`
--
ALTER TABLE `learners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `therapist_assignments`
--
ALTER TABLE `therapist_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`therapist_id`,`learner_id`),
  ADD KEY `patient_id` (`learner_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `engagement_logs`
--
ALTER TABLE `engagement_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `learners`
--
ALTER TABLE `learners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `therapist_assignments`
--
ALTER TABLE `therapist_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `engagement_logs`
--
ALTER TABLE `engagement_logs`
  ADD CONSTRAINT `engagement_logs_ibfk_1` FOREIGN KEY (`learner_id`) REFERENCES `learners` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `engagement_logs_ibfk_2` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learners`
--
ALTER TABLE `learners`
  ADD CONSTRAINT `learners_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `therapist_assignments`
--
ALTER TABLE `therapist_assignments`
  ADD CONSTRAINT `therapist_assignments_ibfk_1` FOREIGN KEY (`therapist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `therapist_assignments_ibfk_2` FOREIGN KEY (`learner_id`) REFERENCES `learners` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
