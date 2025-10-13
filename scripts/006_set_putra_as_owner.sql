-- Set Putra as the portal owner
UPDATE friends 
SET is_owner = true 
WHERE LOWER(name) = 'putra';

-- Ensure no other friends are marked as owner
UPDATE friends 
SET is_owner = false 
WHERE LOWER(name) != 'putra';
