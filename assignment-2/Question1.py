from flask import Flask

app = Flask(__name__)

@app.route('/<name>', methods=['GET'])
def getName(name: str):
    name = name.strip()
    if name.isalpha() and name.isupper():
        name = name.lower()
    elif name.isalpha() and name.islower():
        name = name.upper()
    elif name.isalpha():
        name = name.title()
    elif name.isalnum():
        name = ''.join([x for x in name if not x.isdigit()]).upper()
    ispalindrome = name.lower() == name[::-1].lower()
    if ispalindrome:
        return f"Welcome, {name}. Your name is a palindrome!"
    else:
        return f"Welcome, {name}, to my CSCB20 website!"

@app.route('/emoji/<name>', methods=['GET'])
def getEmojiName(name: str):
    MAPPING = {"A": "🔺", "a": "🔺", "E": "🎗", "e": "🎗", \
        "I": "👁", "i": "👁", "O": "🔵", "o": "🔵", "U": "🆙","u": "🆙"}
    name = name.strip()
    for (k, v) in MAPPING.items():
        name = name.replace(k, v)
    return f"Welcome, {name}, to my CSCB20 website!"

if __name__ == '__main__':
    app.run()
    