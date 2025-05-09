import base64
import os
import time

from flask import Flask, redirect, render_template, request, session, url_for
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
bcrypt = Bcrypt(app)

app.config['SECRET_KEY']='94a86159af9971e2f7978bed5d3ddd2992609807e6e45cb503f096a633a8c81b'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assignment3.db')
db = SQLAlchemy(app)

TIMEZONE_OFFSET = -4 * 3600 # EDT

class User(db.Model):
    __tablename__ = 'users'
    userId = db.Column(db.Integer, primary_key=True)
    utorId = db.Column(db.String(16), nullable=False) # should be 8 though
    password = db.Column(db.String(255), nullable=False)
    studentId = db.Column(db.Integer, nullable=True)
    displayName = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    accountType = db.Column(db.String(3), nullable=False)  # stu|ins
    createdAt = db.Column(db.Integer, nullable=False)

    marks = db.relationship('Mark', backref='user', lazy=True)
    remark_requests = db.relationship('RemarkRequest', backref='user', lazy=True)

    def __repr__(self):
        return f"User({self.userId}, '{self.utorId}', '{self.displayName}', '{self.email}')"

class MarkGroup(db.Model):
    __tablename__ = 'markGroups'
    groupId = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    maxGrade = db.Column(db.Integer, nullable=False)
    createdAt = db.Column(db.Integer, nullable=False)
    releasedAt = db.Column(db.Integer, nullable=False)

    marks = db.relationship('Mark', backref='mark_group', lazy=True)
    remark_requests = db.relationship('RemarkRequest', backref='mark_group', lazy=True)

    def __repr__(self):
        return f"MarkGroup({self.groupId}, '{self.title}', {self.maxGrade})"

class Mark(db.Model):
    __tablename__ = 'marks'
    markId = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.userId', ondelete='CASCADE'), nullable=False)
    markGroupId = db.Column(db.Integer, db.ForeignKey('markGroups.groupId', ondelete='CASCADE'), nullable=False)
    grade = db.Column(db.Integer, nullable=False)
    updatedAt = db.Column(db.Integer, nullable=False)

    remark_requests = db.relationship('RemarkRequest', backref='mark', lazy=True)

    def __repr__(self):
        return f"Mark({self.markId}, {self.userId}, {self.grade})"

class RemarkRequest(db.Model):
    __tablename__ = 'remarkRequests'
    requestId = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.userId', ondelete='CASCADE'), nullable=False)
    markGroupId = db.Column(db.Integer, db.ForeignKey('markGroups.groupId', ondelete='CASCADE'), nullable=False)
    markId = db.Column(db.Integer, db.ForeignKey('marks.markId', ondelete='CASCADE'), nullable=False)
    grade = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(10), nullable=False) # Pending / Approved / Rejected
    createdAt = db.Column(db.Integer, nullable=False)
    updatedAt = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"RemarkRequest({self.requestId}, {self.userId}, {self.markGroupId}, {self.grade}, '{self.reason}', '{self.status}')"

class AnonymousFeedback(db.Model):
    __tablename__ = 'anonymousFeedback'
    feedbackId = db.Column(db.Integer, primary_key=True)
    instructorId = db.Column(db.Integer, db.ForeignKey('users.userId', ondelete='CASCADE'), nullable=False)
    jsonFeedback = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(10), nullable=False) # Unread / Read
    createdAt = db.Column(db.Integer, nullable=False)
    updatedAt = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"AnonymousFeedback({self.feedbackId}, {self.instructorId})"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/grades')
def grades():
    if 'userId' not in session:
        return redirect(url_for('login', message="Please login to access the grades."))
    current_user_id = session.get('userId')
    current_time = int(time.time())
    if session.get('userInfo', {}).get('accountType') == 'stu':
        student_marks = db.session.query(Mark, MarkGroup, RemarkRequest)\
                            .join(MarkGroup, Mark.markGroupId == MarkGroup.groupId)\
                            .outerjoin(RemarkRequest, Mark.markId == RemarkRequest.markId)\
                            .filter(Mark.userId == current_user_id)\
                            .all()
        return render_template('grades_student.html', student_marks = student_marks, current_time = current_time)
    elif session.get('userInfo', {}).get('accountType') == 'ins':
        all_mark_groups = MarkGroup.query.all()
        all_students = User.query.filter_by(accountType='stu').all()

        instructor_marks = db.session.query(User, MarkGroup, Mark, RemarkRequest)\
                                .join(Mark, User.userId == Mark.userId)\
                                .join(MarkGroup, Mark.markGroupId == MarkGroup.groupId)\
                                .outerjoin(RemarkRequest, Mark.markId == RemarkRequest.markId)\
                                .filter(MarkGroup.groupId.in_(
                                    db.session.query(MarkGroup.groupId)
                                ))\
                                .order_by(MarkGroup.groupId.desc(), Mark.grade.desc())\
                                .all()
        return render_template('grades_instructor.html', instructor_marks = instructor_marks, all_mark_groups = all_mark_groups, all_students = all_students,  current_time = current_time)

@app.route('/grades/remark')
def grades_remark():
    if 'userId' not in session:
        return redirect(url_for('login', message="Please login to access the grades."))
    current_time = int(time.time())
    if session.get('userInfo', {}).get('accountType') == 'ins':
        all_mark_groups = MarkGroup.query.all()

        instructor_marks = db.session.query(User, MarkGroup, Mark, RemarkRequest)\
                                .join(Mark, User.userId == Mark.userId)\
                                .join(MarkGroup, Mark.markGroupId == MarkGroup.groupId)\
                                .outerjoin(RemarkRequest, Mark.markId == RemarkRequest.markId)\
                                .filter(MarkGroup.groupId.in_(
                                    db.session.query(MarkGroup.groupId)
                                ))\
                                .order_by(MarkGroup.groupId.desc(), Mark.grade.desc())\
                                .all()
        return render_template('grades_remark.html', instructor_marks = instructor_marks, all_mark_groups = all_mark_groups,current_time = current_time, regrades_only = True)
    else:
        return redirect(url_for('grades'))

@app.route('/syllabus')
def syllabus():
    if 'userId' not in session:
        return redirect(url_for('login', message="Please login to access the syllabus."))
    return render_template('syllabus.html')

@app.route('/assignments')
def assignments():
    if 'userId' not in session:
        return redirect(url_for('login', message="Please login to access the assignments."))
    return render_template('assignments.html')

@app.route('/labs')
def labs():
    if 'userId' not in session:
        return redirect(url_for('login', message="Please login to access information about labs."))
    return render_template('labs.html')

@app.route('/lecture-notes')
def lecture_notes():
    if 'userId' not in session:
        return redirect(url_for('login', message="Please login to access the lecture notes."))
    return render_template('lecture_notes.html')

@app.route('/anonymous-feedback')
def anonymous_feedback():
    if 'userId' not in session:
        return redirect(url_for('login', message="Please login to use the anonymous feedback."))
    
    if session.get('userInfo', {}).get('accountType') == 'stu':
        allInstructors = User.query.filter_by(accountType='ins').all()
        return render_template('anonymous_feedback.html', all_instructors = allInstructors)
    
    else:
        instructor_id = session['userInfo']['userId']
        feedback_list = AnonymousFeedback.query.filter_by(instructorId=instructor_id).all()
        for feedback in feedback_list:
            # we have to process some data
            # this is not ideal approach because this makes data format inconsistent
            feedback.jsonFeedback = base64.b64encode(feedback.jsonFeedback.encode()).decode('utf-8')
            feedback.createdAt = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(feedback.createdAt + TIMEZONE_OFFSET))
        return render_template('feedback_received.html', feedback_list=feedback_list)

@app.route('/course-team')
def course_team():
    if 'userId' not in session:
        return redirect(url_for('login', message="Please login to view information about the course team."))
    return render_template('course_team.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.json

    userObj = User(utorId=data['utorId'], password=bcrypt.generate_password_hash(data['password']).decode('utf-8'), displayName=data['displayName'], email=data['email'], accountType=data['accountType'], createdAt=int(time.time()))
    if data['accountType'] == 'stu':
        userObj.studentId = data['studentId']
        if not data['studentId'].isnumeric():
            return {'error': 'Invalid student ID'}, 400
    elif data['accountType'] != 'ins':
        return {'error': 'Invalid account type'}, 400
    if not data['email'].endswith('utoronto.ca'):
        return {'error': 'Invalid email address'}, 400
    
    if User.query.filter((User.utorId == data['utorId']) | (User.email == data['email'])).first():
        return {'error': 'User already exists'}, 400
    
    if data['accountType'] == 'stu':
        userObj.studentId = data['studentId']
        if User.query.filter_by(studentId=data['studentId']).first():
            return {'error': 'User already exists'}, 400
        
    session['userId'] = userObj.userId
    session['userInfo'] = {'userId': userObj.userId, 'utorId': userObj.utorId, 'displayName': userObj.displayName, 'email': userObj.email, 'accountType': userObj.accountType}
    
    db.session.add(userObj)
    db.session.commit()
    return {'message': 'User created successfully'}, 201

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json

    userObj = User.query.filter_by(utorId=data['utorId']).first()
    if not userObj or not bcrypt.check_password_hash(userObj.password, data['password']):
        return {'error': 'Invalid username or password'}, 400
    
    session['userId'] = userObj.userId
    session['userInfo'] = {'userId': userObj.userId, 'utorId': userObj.utorId, 'displayName': userObj.displayName, 'email': userObj.email, 'accountType': userObj.accountType}
    return {'message': 'Login successful'}, 200

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('userId', None)
    session.pop('userInfo', None)
    return {'message': 'Logout successful'}, 200

@app.route('/api/regrade-request', methods=['PUT', 'PATCH'])
def api_regrade_request():
    data = request.json

    if not session.get('userId'):
        return {'error': 'User not logged in'}, 401

    if request.method == 'PUT':
        if session['userInfo']['accountType'] != 'stu':
            return {'error': 'Only students can submit regrade requests'}, 403

        markObj = Mark.query.filter_by(markId=data['markId']).first()
        if not markObj or markObj.userId != session['userId']:
            return {'error': 'Invalid mark ID'}, 400
        existingRemarkRequest = RemarkRequest.query.filter_by(markId=data['markId'], userId=session['userId']).first()
        if existingRemarkRequest:
            return {'error': 'Regrade request already submitted'}, 400
        
        remarkRequestObj = RemarkRequest(userId=session['userId'], markGroupId=markObj.markGroupId, markId=data['markId'], grade=markObj.grade, reason=data['reason'], status='Pending', createdAt=int(time.time()), updatedAt=int(time.time()))
        
        db.session.add(remarkRequestObj)
        db.session.commit()
        return {'message': 'Regrade request submitted successfully'}, 201
    
    elif request.method == 'PATCH':
        if session['userInfo']['accountType'] != 'ins':
            return {'error': 'Only instructors can process regrade requests'}, 403
        
        remarkRequest = RemarkRequest.query.filter_by(requestId=data['requestId']).first()
        if not remarkRequest:
            return {'error': 'Invalid remark request ID'}, 400
        
        newStatus = data['status']
        if newStatus not in ['Pending', 'Approved', 'Rejected']:
            return {'error': 'Invalid status'}, 400
        
        remarkRequest.status = newStatus
        remarkRequest.updatedAt = int(time.time())

        markObj = Mark.query.filter_by(markId=remarkRequest.markId).first()
        markObj.grade = data['newGrade']

        db.session.commit()
        return {'message': 'Regrade request status updated successfully'}, 200

@app.route('/api/mark', methods=['PUT', 'PATCH', 'DELETE'])
def api_mark():
    data = request.json

    if not session.get('userId'):
        return {'error': 'User not logged in'}, 401
    
    if session['userInfo']['accountType'] != 'ins':
        return {'error': 'Only instructors can update marks'}, 403

    if request.method == 'PUT':
        existingMark = Mark.query.filter_by(markGroupId=data['markGroupId'], userId=data['userId']).first()
        if existingMark:
            return {'error': 'Mark already exists for this student'}, 400

        markObj = Mark(userId=data['userId'], markGroupId=data['markGroupId'], grade=data['grade'], updatedAt=int(time.time()))

        db.session.add(markObj)
        db.session.commit()
        return {'message': 'Marks updated successfully', 'markId': markObj.markId}, 201
        # message format as requested by question statement
    
    elif request.method == 'PATCH':
        markObj = Mark.query.filter_by(markId=data['markId']).first()
        if not markObj:
            return {'error': 'Invalid mark ID'}, 400
        
        markObj.grade = data['newGrade']
        markObj.updatedAt = int(time.time())

        db.session.commit()
        return {'message': 'Marks updated successfully'}, 200
    
    elif request.method == 'DELETE':
        markObj = Mark.query.filter_by(markId=data['markId']).first()
        if not markObj:
            return {'error': 'Invalid mark ID'}, 400
        
        db.session.delete(markObj)
        db.session.commit()
        return {'message': 'Marks updated successfully'}, 200

@app.route('/api/feedback', methods=['PUT', 'PATCH'])
def api_feedback():
    data = request.json

    if not session.get('userId'):
        return {'error': 'User not logged in'}, 401
    if request.method == 'PUT':
        if session['userInfo']['accountType'] != 'stu':
            return {'error': 'Only students can submit feedback'}, 403

        feedbackObj = AnonymousFeedback(
            instructorId=data['instructorId'],
            jsonFeedback=data['jsonFeedback'],
            status='Unread',
            createdAt=int(time.time()),
            updatedAt=int(time.time())
        )
        db.session.add(feedbackObj)
        db.session.commit()
        return {'message': 'Feedback submitted successfully'}, 201

    elif request.method == 'PATCH':
        if session['userInfo']['accountType'] != 'ins':
            return {'error': 'Only instructors can update feedback status'}, 403
        
        feedback = AnonymousFeedback.query.filter_by(feedbackId=data['feedbackId']).first()
        if not feedback:
            return {'error': 'Invalid feedback ID'}, 400
        
        newStatus = data['status']
        if newStatus not in ['Read', 'Unread']:
            return {'error': 'Invalid status'}, 400
        
        feedback.status = newStatus
        feedback.updatedAt = int(time.time())

        db.session.commit()
        return {'message': 'Feedback status updated successfully'}, 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # actually, the utorId for instructors shouldn't work bcz utorId should always be 8-length
        stu1 = User(utorId='student1', password=bcrypt.generate_password_hash('student1').decode('utf-8'), studentId=1000000001, displayName='Student1', email='student1@mail.utoronto.ca', accountType='stu', createdAt=int(time.time()))
        stu2 = User(utorId='student2', password=bcrypt.generate_password_hash('student2').decode('utf-8'), studentId=1000000002, displayName='Student2', email='student2@mail.utoronto.ca', accountType='stu', createdAt=int(time.time()))
        ins1 = User(utorId='instructor1', password=bcrypt.generate_password_hash('instructor1').decode('utf-8'), displayName='Instructor1', email='instructor1@mail.utoronto.ca', accountType='ins', createdAt=int(time.time()))
        ins2 = User(utorId='instructor2', password=bcrypt.generate_password_hash('instructor2').decode('utf-8'), displayName='Instructor2', email='instructor2@mail.utoronto.ca', accountType='ins', createdAt=int(time.time()))
        if not User.query.first():
            db.session.add_all([stu1, stu2, ins1, ins2])
            db.session.commit()
        
        if not MarkGroup.query.first():
            assignment1 = MarkGroup(title='Assignment 1', maxGrade=100, 
                                  createdAt=int(time.time()), 
                                  releasedAt=int(time.time()) - 86400 * 3)
            assignment2 = MarkGroup(title='Assignment 2', maxGrade=100, 
                                  createdAt=int(time.time()), 
                                  releasedAt=int(time.time()) - 86400 * 3)
            assignment3 = MarkGroup(title='Assignment 3', maxGrade=100, 
                                  createdAt=int(time.time()), 
                                  releasedAt=int(time.time()) + 86400 * 3)
            tutorial1 = MarkGroup(title='Tutorial 1', maxGrade=10, 
                                  createdAt=int(time.time()), 
                                  releasedAt=int(time.time()) - 86400 * 3)
            tutorial2 = MarkGroup(title='Tutorial 2', maxGrade=10, 
                                  createdAt=int(time.time()), 
                                  releasedAt=int(time.time()) - 86400 * 3)
            tutorial3 = MarkGroup(title='Tutorial 3', maxGrade=10, 
                                  createdAt=int(time.time()), 
                                  releasedAt=int(time.time()) - 86400 * 3)
            tutorial4 = MarkGroup(title='Tutorial 4', maxGrade=10, 
                                  createdAt=int(time.time()), 
                                  releasedAt=int(time.time()) - 86400 * 3)
            midterm = MarkGroup(title='Midterm', maxGrade=50, 
                               createdAt=int(time.time()), 
                               releasedAt=int(time.time()) - 86400 * 2)
            final = MarkGroup(title='Final Exam', maxGrade=80, 
                             createdAt=int(time.time()), 
                             releasedAt=int(time.time()) + 86400)
            db.session.add_all([
                assignment1, assignment2, assignment3,
                tutorial1, tutorial2, tutorial3, tutorial4,
                midterm, final
            ])
            db.session.commit()

        if not Mark.query.first():
            stu1_assignment1 = Mark(userId=1, markGroupId=1, grade=97,
                                  updatedAt=int(time.time()))
            stu1_tutorial1 = Mark(userId=1, markGroupId=4, grade=10,
                                  updatedAt=int(time.time()))
            stu1_midterm = Mark(userId=1, markGroupId=8, grade=46,
                               updatedAt=int(time.time()))
            stu1_final = Mark(userId=1, markGroupId=9, grade=70, 
                            updatedAt=int(time.time()))
            
            
            stu2_assignment1 = Mark(userId=2, markGroupId=1, grade=98,
                                   updatedAt=int(time.time()))
            stu2_tutorial1 = Mark(userId=2, markGroupId=4, grade=10,
                                      updatedAt=int(time.time()))
            stu2_midterm = Mark(userId=2, markGroupId=8, grade=37,
                              updatedAt=int(time.time()))
            stu2_final = Mark(userId=2, markGroupId=9, grade=75,
                            updatedAt=int(time.time()))
            
            db.session.add_all([
                stu1_assignment1, stu1_tutorial1, stu1_midterm, stu1_final,
                stu2_assignment1, stu2_tutorial1, stu2_midterm, stu2_final
            ])
            db.session.commit()

            

        db.session.close()

    app.run(debug=True)