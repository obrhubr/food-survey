import pandas as pd
import numpy as np
import json
import logging

# not weighted versions

def guard_against_zero_div(num):
    if num == 0:
        return 1
    else:
        return num

def not_weighted_get_most_positive_ranking(df):
    # get votes where score is higher than 3, so 4s and 5s, ignore 3s
    # because 3 is a neutral and not a positive vote
    positive_votes_count = df.loc[df['score'] > 3].shape[0]
    votes_count = df.shape[0]
    perc = positive_votes_count / guard_against_zero_div(votes_count)

    # get by class
    bc = df.loc[df['score'] < 3].groupby('class').count()['score'].to_frame()
    bc["class_negatives"] = bc["score"]
    bc["class"] = bc.index
    bc = bc[['class', 'class_negatives']]
    bc.index.names = ['index']

    # get total by class
    tc = df.groupby('class').count()
    tc["class"] = tc.index
    tc["class_totals"] = tc["class"]
    tc.index.names = ['index']
    tc = tc[['class_totals', 'class']]


    by_class = pd.merge(df, bc, how="outer")
    by_class = pd.merge(by_class, tc[['class', 'class_totals']], how="inner", on="class")
    by_class = by_class.fillna(0)
    by_class['perc'] = by_class.apply(lambda x: x.class_negatives / guard_against_zero_div(x.class_totals), axis=1)

    # get for each class
    t = by_class[['class', 'perc']].groupby('class').value_counts().to_frame().reset_index(level=['perc'])

    # return % of negative votes
    return {"total": perc, "by_class": json.loads(t[['perc']].to_json())}

def not_weighted_get_least_negative_ranking(df):
    # get votes where score is lower than 3, so 2s and 1s, ignore 3s
    # because 3 is a neutral and not a positive vote
    positive_votes_count = df.loc[df['score'] < 3].shape[0]
    votes_count = df.shape[0]
    perc = positive_votes_count / guard_against_zero_div(votes_count)

    # get by class
    bc = df.loc[df['score'] < 3].groupby('class').count()['score'].to_frame()
    bc["class_negatives"] = bc["score"]
    bc["class"] = bc.index
    bc = bc[['class', 'class_negatives']]
    bc.index.names = ['index']

    # get total by class
    tc = df.groupby('class').count()
    tc["class"] = tc.index
    tc["class_totals"] = tc["class"]
    tc.index.names = ['index']
    tc = tc[['class_totals', 'class']]


    by_class = pd.merge(df, bc, how="outer")
    by_class = pd.merge(by_class, tc[['class', 'class_totals']], how="inner", on="class")
    by_class = by_class.fillna(0)
    by_class['perc'] = by_class.apply(lambda x: x.class_negatives / guard_against_zero_div(x.class_totals), axis=1)

    # get for each class
    t = by_class[['class', 'perc']].groupby('class').value_counts().to_frame().reset_index(level=['perc'])

    # return % of negative votes
    return {"total": perc, "by_class": json.loads(t[['perc']].to_json())}

def not_weighted_get_best_median(df):
    by_class = df[['score', 'class']].groupby('class').median().to_json()
    total = df['score'].median()
    return {"by_class": json.loads(by_class)["score"], "total": total}

def not_weighted_get_best_avg(df):
    by_class = df[['score', 'class']].groupby('class').mean().to_json()
    total = df['score'].mean()
    return {"by_class": json.loads(by_class)["score"], "total": total}

# weighted versions

def get_weights(df):
    # percent per class of total votes: 100%/7classes = 14.2%
    expected = 0.142

    ct = df['class'].value_counts()
    ct = pd.DataFrame(ct)
    ct['class_total'] = ct['class']
    ct['class'] = ct.index

    with_sum = pd.merge(df, ct, on='class')
    # get percentage of class
    with_sum['pc'] = with_sum['class_total'] / guard_against_zero_div(df.shape[0])
    # use soll / ist to get weight of vote
    with_sum['weight'] = expected / with_sum['pc']

    return with_sum

def weighted_get_most_positive_ranking(wdf):
    # get votes where score is higher than 3, so 4s and 5s, ignore 3s
    # because 3 is a neutral and not a positive vote
    positive_votes_count = wdf.loc[wdf['score'] > 3][['weight']].sum()[0]
    votes_count = wdf.shape[0]
    perc = positive_votes_count / guard_against_zero_div(votes_count)
    # return % of positive votes
    return {"total": perc}

def weighted_get_least_negative_ranking(wdf):
    # get votes where score is higher than 3, so 4s and 5s, ignore 3s
    # because 3 is a neutral and not a positive vote
    positive_votes_count = wdf.loc[wdf['score'] < 3][['weight']].sum()[0]
    votes_count = wdf.shape[0]
    perc = positive_votes_count / guard_against_zero_div(votes_count)
    # return % of positive votes
    return {"total": perc}

def weighted_get_best_median(wdf):
    wdf.sort_values('score', inplace=True)
    total_median = wdf.score[wdf.weight.cumsum() >= (wdf.weight.sum() / 2.0)].iloc[0]

    return {"total": total_median}

def weighted_get_best_avg(wdf):
    total = wdf.groupby('day').apply(lambda x: np.average(x.score, weights=x.weight))
    return {"total": total.iloc[0]}
