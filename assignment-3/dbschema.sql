CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY AUTOINCREMENT,
        utorId VARCHAR(16) NOT NULL, -- login name
        password VARCHAR(255) NOT NULL, -- bcrypt hashed password
        studentId INTEGER, -- numeric id (can be null for instructors)
        displayName VARCHAR(255) NOT NULL, -- preferred display name
        email VARCHAR(255) NOT NULL,
        accountType CHAR(3) NOT NULL, -- accountType = stu|ins
        createdAt INTEGER NOT NULL); -- UNIX timestamp
-- we use flask session for stateless login and omit a session table
-- this won't support storing session info (e.g. IP) / support server-side revocation
-- but I believe this is enough for this assignment

CREATE TABLE IF NOT EXISTS markGroups (groupId INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL, -- assignment / midterm / final etc
        maxGrade INTEGER NOT NULL, -- full grade
        createdAt INTEGER NOT NULL,
        releasedAt INTEGER NOT NULL); -- when the marks are released
-- we use this markGroups table to categorize marks
-- this could be unnecessary for this assignment but we're just making it more like a real website

CREATE TABLE IF NOT EXISTS marks (markId INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        markGroupId INTEGER NOT NULL,
        grade INTEGER NOT NULL, -- user's grade
        updatedAt INTEGER NOT NULL, -- created / updated date
        FOREIGN KEY (userId) REFERENCES users(userId),
        FOREIGN KEY (markGroupId) REFERENCES markGroups(groupId));

CREATE TABLE IF NOT EXISTS remarkRequests (requestId INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        markGroupId INTEGER NOT NULL,
        markId INTEGER NOT NULL,
        grade INTEGER NOT NULL, -- user's grade on request submission
        reason TEXT NOT NULL,
        status CHAR(1) NOT NULL, -- P: pending, A: accepted, R: rejected
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(userId),
        FOREIGN KEY (markGroupId) REFERENCES markGroups(groupId),
        FOREIGN KEY (markId) REFERENCES marks(markId));

CREATE TABLE IF NOT EXISTS anonymousFeedback (feedbackId INTEGER PRIMARY KEY AUTOINCREMENT,
        instructorId INTEGER NOT NULL, -- userId of instructor
        jsonFeedback TEXT NOT NULL, -- the qa form (we use json rather than separate questions)
        createdAt INTEGER NOT NULL,
        status CHAR(1) NOT NULL,  -- R: read, U: Unread
        FOREIGN KEY (instructorId) REFERENCES users(userId));