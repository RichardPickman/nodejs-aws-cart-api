
/* CARTS Table */
INSERT INTO "carts"("id","user_id","created_at","updated_at","status")
VALUES('a8739ff6-49e9-465e-adc0-52843cec821f','721a7a30-4433-442b-a7e6-7e9851833fec','2024-07-18','2024-07-18','OPEN');
INSERT INTO "carts"("id","user_id","created_at","updated_at","status")
VALUES('e74e7975-c852-4d68-b4c4-32580280a5c6','5ce1a40c-2f11-4615-8a51-08030f0c214d','2024-07-18','2024-07-18','OPEN');
INSERT INTO "carts"("id","user_id","created_at","updated_at","status")
VALUES('08d9c581-7bc1-4bb5-b788-834777ef320a','227f6633-afd8-47ae-8179-19101fb23b28','2024-07-18','2024-07-18','ORDERED');

/* CART_ITEMS Table */
INSERT INTO "cart_items"("cart_id","product_id","count") VALUES('a8739ff6-49e9-465e-adc0-52843cec821f','7f82311d-f5e2-4593-a4c2-85c868172499',5);
INSERT INTO "cart_items"("cart_id","product_id","count") VALUES('e74e7975-c852-4d68-b4c4-32580280a5c6','7f82311d-f5e2-4593-a4c2-85c868172499',5);
INSERT INTO "cart_items"("cart_id","product_id","count") VALUES('08d9c581-7bc1-4bb5-b788-834777ef320a','7f82311d-f5e2-4593-a4c2-85c868172499',5);