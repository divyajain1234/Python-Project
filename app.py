from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

players_scores = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/update_score', methods=['POST'])
def update_score():
    data = request.get_json()
    player = data['player']
    score = data['score']
    players_scores[player] = score
    return '', 204

@app.route('/get_scores')
def get_scores():
    return jsonify(players_scores)

if __name__ == '__main__':
    app.run(debug=True)
