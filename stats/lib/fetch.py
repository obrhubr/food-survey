import os
import pandas as pd
from datetime import datetime
import logging
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

def init():
    if(os.getenv('ENV') == "PROD"):
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {
            'projectId': 'cantine-rating',
        })
    else:
        cred = credentials.Certificate('./key.json')
        firebase_admin.initialize_app(cred)
    
    return

def create_connection():
    return firestore.client()

def get_votes_as_df(conn, iso_date):
    logging.info(datetime.now().strftime("%Y-%m-%d %H:%M:%S") + ' info: Querying database to get votes.')
    
    votes = list(conn.collection('votes').where('day', '==', iso_date).stream())
    votes_dict = list(map(lambda x: x.to_dict(), votes))
    df = pd.DataFrame(votes_dict)

    if df.shape[0] == 0: return pd.DataFrame, False

    df['score'] = df['vote']

    return df, True