-- Chạy file này nếu database đã tồn tại từ trước khi chưa có cột password
ALTER TABLE `users`
  ADD COLUMN `password` varchar(255) NOT NULL DEFAULT '' AFTER `email`;
