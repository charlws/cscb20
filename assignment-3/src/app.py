from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/syllabus')
def syllabus():
    return render_template('syllabus.html')

@app.route('/assignments')
def assignments():
    return render_template('assignments.html')

@app.route('/labs')
def labs():
    return render_template('labs.html')

@app.route('/lecture-notes')
def lecture_notes():
    return render_template('lecture_notes.html')

@app.route('/anonymous-feedback')
def anonymous_feedback():
    return render_template('anonymous_feedback.html')

@app.route('/course-team')
def course_team():
    return render_template('course_team.html')

if __name__ == '__main__':
    app.run(debug=True)