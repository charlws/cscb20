-- 1
SELECT Buildings.name FROM Buildings 
JOIN Rooms ON Buildings.building_id = Rooms.building_id
JOIN Sensors ON Rooms.room_id = Sensors.room_id
WHERE Sensors.status = 'active';

-- 2
SELECT Buildings.building_id FROM Buildings
JOIN Rooms ON Buildings.building_id = Rooms.building_id AND Rooms.floor BETWEEN 1 AND 10
GROUP BY Buildings.building_id
HAVING COUNT(DISTINCT Rooms.floor) = 10;

-- 3
SELECT building_id FROM Tasks
WHERE priority = 'High' OR priority = 'Medium' OR priority = 'Low'
GROUP BY building_id
HAVING COUNT(DISTINCT priority) = 3;

-- 4
SELECT DISTINCT b.name AS name FROM Buildings b
WHERE building_id BETWEEN 1 AND 3
AND NOT EXISTS (
    SELECT 1 FROM Rooms r
    LEFT JOIN Sensors s ON r.room_id = s.room_id
    WHERE r.building_id = b.building_id
    AND s.sensor_id IS NULL
)

-- 5: there is not a building in toronto
-- that is not covered by the supplier
SELECT DISTINCT supplier_id FROM Suppliers s
WHERE NOT EXISTS (
    SELECT building_id FROM Buildings b
    WHERE city = 'Toronto' AND NOT EXISTS (
        SELECT 1 FROM Supplies ss
        WHERE ss.supplier_id = s.supplier_id
            AND b.building_id = ss.building_id
    )
)

-- 6: there is not a building with high priority tasks
-- that is not covered by the supplier
SELECT DISTINCT name FROM Suppliers s 
WHERE NOT EXISTS (
    SELECT building_id FROM Buildings b 
    JOIN Tasks t WHERE b.building_id = t.building_id
        AND t.priority = 'High'
    WHERE NOT EXISTS (
        SELECT 1 FROM Supplies ss
        WHERE ss.supplier_id = s.supplier_id
            AND ss.building_id = b.building_id
    )
)