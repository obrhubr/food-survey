import lib.fetch as fe
import lib.stat as st
from datetime import datetime
import logging
import json
import numpy as np
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import os

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)
    
def run():
    # create connection
    conn = fe.create_connection()
    iso_date = datetime.now().date().strftime('%Y-%m-%d')

    df, exists = fe.get_votes_as_df(conn, iso_date)
    if not exists:
        logging.error(datetime.now().strftime("%Y-%m-%d %H:%M:%S") + ' error: No records in database.')
        return jsonify({"error": "No data to analyse"})

    # get name of menu
    logging.info(datetime.now().strftime("%Y-%m-%d %H:%M:%S") + ' info: Querying menus to get the name of the menu.')
    conn.collection('menus').document(iso_date).update({"open": False})
    menu = conn.collection('menus').document(iso_date).get().to_dict()
    menu_vegetarien = menu['name']
    menu_name = menu['vegetarian']

    # compute weights for votes
    wdf = st.get_weights(df)

    json_data = {
        "nw_most_positive": st.not_weighted_get_most_positive_ranking(df),
        "nw_least_negative": st.not_weighted_get_least_negative_ranking(df),
        "nw_median": st.not_weighted_get_best_median(df),
        "nw_avg": st.not_weighted_get_best_avg(df),

        "w_most_positive": st.weighted_get_most_positive_ranking(wdf),
        "w_least_negative": st.weighted_get_least_negative_ranking(wdf),
        "w_median": st.weighted_get_best_median(wdf),
        "w_avg": st.weighted_get_best_avg(wdf)
    }

    logging.info(datetime.now().strftime("%Y-%m-%d %H:%M:%S") + ' info: Querying database to save statistics.')
    doc = conn.collection('stats').document(iso_date)
    doc.set({
        'day': iso_date,
        'vegetarian': menu_vegetarian
        'name': menu_name,
        'jsondata': json.dumps(json_data, cls=NpEncoder)
    })
    return jsonify({"success": "Created stats."})

app = Flask(__name__)

@app.route('/stats', methods=['POST']) 
def foo():
    data = request.json
    if data['token'] == (os.getenv('SECRET') or False):
        return run()
    else:
        return jsonify({ "error": "Not the right token, please don't spam this endpoint, dear whitehat hacker... :)"})

if __name__ == "__main__":
    # initialise app
    load_dotenv()
    #logging.basicConfig(filename='/var/log/all.log', level=logging.INFO)
    logging.info(datetime.now().strftime("%Y-%m-%d %H:%M:%S") + ' info: Connected to database.')
    fe.init()
    
    is_prod = not (os.getenv('ENV') == "PROD")
    app.run(debug=is_prod, port=os.getenv('PORT'), host='0.0.0.0')