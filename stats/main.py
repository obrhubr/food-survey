import lib.fetch as fe
import lib.stat as st
from datetime import datetime
import logging
import json
import numpy as np
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import os
import pandas as pd
import copy

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
    iso_date = datetime.now().date().strftime('%Y-%m-%-d')

    # get name of menu
    logging.info(datetime.now().strftime("%Y-%m-%d %H:%M:%S") + ' info: Querying menus to get the name of the menu.')
    conn.collection('menus').document(iso_date).update({"open": False})
    menu = conn.collection('menus').document(iso_date).get().to_dict()
    menu_names = json.loads(menu['menus'])['menus']

    # Get stats for each menu

    df, exists = fe.get_votes_as_df(conn, iso_date)
    if not exists:
        logging.error(datetime.now().strftime("%Y-%m-%d %H:%M:%S") + ' error: No records in database.')
        return jsonify({"error": "No data to analyse"})

    # compute weights for votes
    wdf = st.get_weights(df)

    # sort by menus
    df.sort_values(by='menu', inplace=True)
    df.set_index(keys=['menu'], drop=False, inplace=True)
    wdf.sort_values(by='menu', inplace=True)
    wdf.set_index(keys=['menu'], drop=False, inplace=True)

    print(wdf)

    for m in menu_names:
        filtered_df = copy.deepcopy(df.loc[df.menu == m['uuid']])
        filtered_wdf = copy.deepcopy(wdf.loc[wdf.menu == m['uuid']])

        if(filtered_wdf.shape[0] < 1):
            continue

        stats = st.get_stats_report(filtered_df, filtered_wdf)

        logging.info(datetime.now().strftime("%Y-%m-%d %H:%M:%S") + ' info: Querying database to save statistics.')
        doc = conn.collection('stats').document(iso_date + '-' + m['uuid'])
        doc.set({
            'day': iso_date,
            'name': m["name"],
            'uuid': m["uuid"],
            'jsondata': json.dumps(stats, cls=NpEncoder)
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