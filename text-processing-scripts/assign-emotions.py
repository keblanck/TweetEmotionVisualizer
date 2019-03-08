# This script assigns an 8-by-4 matrix to each tweet based on:
#     - NRC basic emotion lexicon
#     - VAD emotion lexicon
# The first column contains vector of mean basic emotions
# The other columns contain mean VAD scores associated with
# the corresponding emotion

import os
import pandas as pd
import numpy as np
import math

# Define relevant paths
DATA_PATH = '../data/trump_posts_cleaned_subset.csv'
EMOTION_PATH = '../data/NRC-LEX-ENG.csv'
V_PATH = '../data/NRC-VAD/v-scores.csv'
A_PATH = '../data/NRC-VAD/a-scores.csv'
D_PATH = '../data/NRC-VAD/d-scores.csv'

OUTPUT_PATH = '../data/trump_posts_emotions.csv'

# Import data into pandas
data_df = pd.read_csv(DATA_PATH, error_bad_lines=False, index_col=False)
emotion_df = pd.read_csv(EMOTION_PATH, error_bad_lines=False, index_col=False)
v_df = pd.read_csv(V_PATH, error_bad_lines=False, index_col=False)
a_df = pd.read_csv(A_PATH, error_bad_lines=False, index_col=False)
d_df = pd.read_csv(D_PATH, error_bad_lines=False, index_col=False)

data_df = data_df.dropna(subset=['text_cleaned'])

# Set column to store emotional states into
data_df['emotional_state'] = np.nan
data_df['emotional_state'] = data_df['emotional_state'].astype(object)

print("len df: {}".format(len(data_df)))


# For each tweet
for index, row in data_df.iterrows():

    # total emotional word count
    emotional_word_count = 0

    # keep track of 8 emotional words stats (name, count, list of VAD scores)

    emotion_stats = {
        'Anger': {
            'count': 0,
            'v-scores': [],
            'a-scores': [],
            'd-scores': []
        },
        'Anticipation': {
            'count': 0,
            'v-scores': [],
            'a-scores': [],
            'd-scores': []
        },
        'Disgust': {
            'count': 0,
            'v-scores': [],
            'a-scores': [],
            'd-scores': []
        },
        'Fear': {
            'count': 0,
            'v-scores': [],
            'a-scores': [],
            'd-scores': []
        },
        'Joy': {
            'count': 0,
            'v-scores': [],
            'a-scores': [],
            'd-scores': []
        },
        'Sadness': {
            'count': 0,
            'v-scores': [],
            'a-scores': [],
            'd-scores': []
        },
        'Surprise': {
            'count': 0,
            'v-scores': [],
            'a-scores': [],
            'd-scores': []
        },
        'Trust': {
            'count': 0,
            'v-scores': [],
            'a-scores': [],
            'd-scores': []
        }
    }

    post = row['text_cleaned'].split()

    def is_emotional(d):
        for k in emotion_stats.keys():
            if d.iloc[0][k] == 1:
                return True

    # For each word
    for w in post:

        #print("WORD: {}".format(w))

        # query lexicon for emotion type and VAD scores
        e_data = emotion_df[emotion_df['English (en)'] == w]
        if len(e_data) and is_emotional(e_data):

            #print("e_data: {}".format(e_data.iloc[0]))

            v_data = v_df[v_df['word'] == w]
            a_data = a_df[a_df['word'] == w]
            d_data = d_df[d_df['word'] == w]

            if len(v_data) and len(a_data) and len(d_data):

                #print("v_data: {}".format(v_data.iloc[0]))
                #print("a_data: {}".format(a_data.iloc[0]))
                #print("d_data: {}".format(d_data.iloc[0]))

                # update stats
                emotional_word_count += 1
                for k in emotion_stats.keys():
                    if e_data.iloc[0][k] == 1:
                        #print(emotion_stats[k])
                        emotion_stats[k]['count'] += 1

                        emotion_stats[k]['v-scores'].append(v_data.iloc[0]['v-score'])
                        emotion_stats[k]['a-scores'].append(a_data.iloc[0]['a-score'])
                        emotion_stats[k]['d-scores'].append(d_data.iloc[0]['d-score'])

    # format data as 8-by-4 matrix
    # print(emotion_stats)
    matrix = []
    for k in emotion_stats.keys():

        try:
            e_score = emotion_stats[k]['count'] / emotional_word_count
            v_score = np.mean(emotion_stats[k]['v-scores'])
            a_score = np.mean(emotion_stats[k]['a-scores'])
            d_score = np.mean(emotion_stats[k]['d-scores'])
            aggr = [e_score, v_score, a_score, d_score]
            matrix.append([0 if math.isnan(s) else s for s in aggr])

        except ZeroDivisionError:
            print("no emotional words")
            matrix.append([0,0,0,0])

    matrix = np.array([matrix])
    #print(matrix)

    try:
        #print("emotional_state_index: {}".format(data_df.iloc[index]))
        data_df.at[index, 'emotional_state'] = matrix
        print("matrix in df: {}".format(data_df.iloc[index]['emotional_state']))

    except IndexError as e:
        print(e)


data_df.to_csv(OUTPUT_PATH, sep=',', encoding='utf-8', index=False)

