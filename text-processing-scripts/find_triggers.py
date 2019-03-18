# This file assigns tf-idf scores to each unique
# word in the tweets of each mood segment
# Each tweet segment is treated as a "document"

import os
import pandas as pd
import numpy as np
import math
from collections import Counter

MOOD_PATH = '../data/trump_tweet_moods.csv'
OUTPUT_PATH = '../data/trump_trigger_words.csv'
EMOTION_PATH = '../data/NRC-LEX-ENG.csv'
EMOTION_LIST = ['Anger', 'Anticipation', 'Disgust',
                'Fear', 'Joy', 'Sadness',
                'Surprise', 'Trust']

emotion_df = pd.read_csv(EMOTION_PATH, error_bad_lines=False, index_col=False)
mood_df = pd.read_csv(MOOD_PATH, error_bad_lines=False, index_col=False)

# Assign tf scores
tf_scores = []
all_words = set()

for index, row in mood_df.iterrows():

    wrds = row['tweet_text'].split()
    num_words = len(wrds)
    word_freq = Counter(wrds)

    for wrd, freq in word_freq.items():
        all_words.add(wrd)
        tf_scores.append({
            'mood_label': row['mood_label'],
            'word': wrd,
            'tf': freq / num_words
        })

# Find document frequency of words
word_doc_freq = {}
for wrd in all_words:
    word_doc_freq[wrd] = 0

for wrd in all_words:
    for s in tf_scores:
        if s['word'] == wrd:
            word_doc_freq[wrd] += 1

# Assign idf scores
idf_scores = {}
num_moods = len(mood_df)

for wrd in all_words:
    idf_scores[wrd] = math.log(num_moods/word_doc_freq[wrd])

tf_idf_scores = []
for s in tf_scores:


    # query lexicon for emotion type
    emo = None
    e_data = emotion_df[emotion_df['English (en)'] == s['word']]
    if len(e_data):
        for e in EMOTION_LIST:
            if e_data.iloc[0][e] == 1:
                emo = e
    if emo:
        tf_idf_scores.append({
            'mood_label': s['mood_label'],
            'word': s['word'],
            'tf-idf': s['tf'] * idf_scores[s['word']],
            'emotion': emo
        })

# Store all results
tf_idf_df = pd.DataFrame(tf_idf_scores)
tf_idf_df.to_csv(OUTPUT_PATH, sep=',', encoding='utf-8', index=False)
