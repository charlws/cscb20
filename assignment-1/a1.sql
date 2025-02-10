-- 1
-- Retrieve the names of buildings that have at least one active sensor.
SELECT Buildings.name FROM Buildings 
JOIN Rooms ON Buildings.building_id = Rooms.building_id
JOIN Sensors ON Rooms.room_id = Sensors.room_id
WHERE Sensors.status = 'active';

-- 2
-- Retrieve the IDs of buildings with rooms on every floor between 1 and 10 inclusive.
SELECT Buildings.building_id FROM Buildings
JOIN Rooms ON Buildings.building_id = Rooms.building_id AND Rooms.floor BETWEEN 1 AND 10
GROUP BY Buildings.building_id
HAVING COUNT(DISTINCT Rooms.floor) = 10;

-- 3
-- Retrieve the IDs of buildings with tasks of all priority levels (Assume there are three priority levels: High, Medium, Low).
SELECT building_id FROM Tasks
WHERE priority = 'High' OR priority = 'Medium' OR priority = 'Low'
GROUP BY building_id
HAVING COUNT(DISTINCT priority) = 3;

-- 4
-- Assume there are three buildings with IDs 1, 2, and 3 among other buildings. Find the names of buildings out of the three where every room has at least one sensor installed.
SELECT DISTINCT b.name AS name FROM Buildings b
WHERE building_id BETWEEN 1 AND 3
AND NOT EXISTS (
    SELECT 1 FROM Rooms r
    LEFT JOIN Sensors s ON r.room_id = s.room_id
    WHERE r.building_id = b.building_id
    AND s.sensor_id IS NULL
)

-- 5
-- Retrieve the IDs of suppliers providing resources to every building in Toronto.
SELECT DISTINCT supplier_id FROM Suppliers s
WHERE NOT EXISTS (
    SELECT building_id FROM Buildings b
    WHERE city = 'Toronto' AND NOT EXISTS (
        SELECT 1 FROM Supplies ss
        WHERE ss.supplier_id = s.supplier_id
            AND b.building_id = ss.building_id
    )
)

-- 6
-- Retrieve the names of suppliers who supply resources to all buildings that have high-priority tasks assigned.
SELECT DISTINCT name FROM Suppliers s 
WHERE NOT EXISTS (
    SELECT b.building_id FROM Buildings b 
    JOIN Tasks t ON b.building_id = t.building_id
        AND t.priority = 'High'
    WHERE NOT EXISTS (
        SELECT 1 FROM Supplies ss
        WHERE ss.supplier_id = s.supplier_id
            AND ss.building_id = b.building_id
    )
)

-- 7
-- Retrieve all rooms that have at least two sensors of different types installed.
SELECT room_id
FROM Sensors
GROUP BY room_id
HAVING (COUNT(DISTINCT type)) > 1

-- 8
-- Find all buildings that have both inactive sensors and a scheduled maintenance event in the same month.
SELECT DISTINCT building_id
FROM Maintenance AS M
JOIN Readings AS R
ON R.reading_month=M.maintenance_month
JOIN Sensors AS S
ON S.sensor_id=R.sensor_id
WHERE status='inactive'

-- 9
-- Retrieve the IDs of rooms in Toronto where the total capacity of two rooms exceeds 500. Each pair should have unique rooms.
SELECT DISTINCT R1.room_id, R2.room_id
FROM Rooms AS R1
JOIN Buildings As B
ON B.city='Toronto'
JOIN Rooms AS R2
ON R1.room_id < R2.room_id 
AND (R1.capacity + R2.capacity) > 500

-- 10
-- Retrieve the ID of the tallest building such that sensors installed in rooms on every floor. Assume there is only one tallest building.
SELECT B.building_id
FROM Buildings AS B
JOIN (
    SELECT R.building_id
    FROM Rooms AS R
    JOIN Sensors AS S
    ON R.room_id = S.room_id
    GROUP BY R.building_id
    HAVING COUNT(DISTINCT R.floor) = (
        SELECT COUNT(DISTINCT R2.floor)
        FROM Rooms AS R2
        WHERE R2.building_id = R.building_id
    )
) AS AllCoveredBuildings
ON B.building_id = AllCoveredBuildings.building_id
ORDER BY B.height DESC
LIMIT 1;

-- 11
-- Find the names of personnel responsible for maintenance tasks in buildings where resources were supplied by suppliers located in the same city, and the building has at least one high-priority task assigned.
SELECT DISTINCT name
FROM Personnel AS P
JOIN PersonnelAssignment AS PA
ON P.person_id=PA.person_id
JOIN Maintenance AS M
ON M.maintenance_id=PA.maintenance_id
JOIN (SELECT building_id, city FROM Buildings) AS B
ON B.building_id=M.building_id
JOIN (SELECT DISTINCT building_id, city
			FROM Supplies AS Ss
			JOIN Suppliers AS S
			ON Ss.supplier_id=S.supplier_id) AS SR
ON (SR.building_id=M.building_id AND SR.city=B.city)
JOIN Tasks AS T
ON T.building_id=M.building_id
WHERE T.priority='High'

-- 12
-- Retrieve the IDs of buildings where at least one sensor has recorded a reading above 75 after 23rd October 2024, the buildings have had maintenance tasks in the same period, and they received supplies from suppliers located in a different city.
SELECT DISTINCT B.building_id
FROM Buildings AS B
JOIN Rooms AS R 
ON B.building_id = R.building_id
JOIN Sensors AS S 
ON R.room_id = S.room_id
JOIN Readings AS Rd 
ON S.sensor_id = Rd.sensor_id
JOIN Maintenance AS M 
ON B.building_id = M.building_id
JOIN Supplies AS Sp 
ON B.building_id = Sp.building_id
JOIN Suppliers AS Sup 
ON Sp.supplier_id = Sup.supplier_id
WHERE Rd.value > 75
  AND Rd.timestamp > DATE('2024-10-23')
  AND M.date > DATE('2024-10-23')
  AND B.city <> Sup.city