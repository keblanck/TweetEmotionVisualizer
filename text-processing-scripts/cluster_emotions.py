# This script performs k-means clustering
# to partition tweets into semantically
# and temporally coherent segments.
# We decided to use k-means clustering.

import os
import pandas as pd
import numpy as np
import math
import re
import datetime as dt

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

from sklearn.cluster import KMeans

DATA_PATH = '../data/trump_posts_emotions.csv'
OUTPUT_PATH = '../data/trump_tweet_moods.csv'
df = pd.read_csv(DATA_PATH, error_bad_lines=False, index_col=False)

raw_emotion_matrix = df['emotional_state']
flattened_emotions = []

# Flatten emotion matrix
for emotion in raw_emotion_matrix:
    emotion = emotion[2:-2].split()
    flat = []
    for s in emotion:
        try:
            s = s.strip('[')
            s = s.strip(']')
            # print(s)
            flat.append(float(s))
        except ValueError:
            pass

    flattened_emotions.append(flat)

# Store for later
original_emotions = flattened_emotions

# Standardizing the emotion components
flattened_emotions = StandardScaler().fit_transform(flattened_emotions)

# PCA projection of 32D emotions to 1D
pca = PCA(n_components=1)
principalComponents = pca.fit_transform(flattened_emotions)

# Extract date and calculate duration from now
df['date'] = pd.to_datetime(df['created_at'])
df['duration'] = dt.datetime.now().date() - df['date']
df['duration'] = df['duration'].dt.total_seconds()
durations = df['duration']

# Format x input for clustering
x = []
for d, p in zip(durations, principalComponents):
    x.append([d, p[0]])
x = StandardScaler().fit_transform(x)

# Time constrain before clustering
kmeans_labels = []
batch_no = 0
for i in range(0, len(x) - 1, 50):
    batch_no += 1

    if i == len(x) - 51:
        x_grp = x[i:len(x)]
    else:
        x_grp = x[i:i+50]

    # Cluster using K-means
    kmeans = KMeans(n_clusters=3)
    kmeans.fit(x_grp)

    labels = [int(str(batch_no) + str(l)) for l in kmeans.labels_]
    kmeans_labels += labels
print(len(set(kmeans_labels)))

# Append mood_label and original_emotions to main df
df['mood_label'] = kmeans_labels
df['emotions_vector'] = original_emotions

# Create and format mood df
mood_df = []
for mood, group in df.groupby('mood_label'):

    #print(mood)
    ev_list = []
    tweets = ''

    for index, row in group.iterrows():

        ev_list.append(row['emotions_vector'])
        tweets = tweets + row['text_cleaned']

    # Average emotional components of all tweets in cluster
    ev_list = np.array(ev_list)
    mood_vector = np.mean(ev_list, axis=0)
    mood_matrix = []

    for i in range(0, len(mood_vector)-1, 4):
        mood_matrix.append(mood_vector[i:i+4])

    mood_matrix = np.array([mood_matrix])

    mood_df.append({
        'mood_label': mood,
        'mood_vector': mood_vector,
        'mood_matrix': mood_matrix,
        'tweet_text': tweets
    })

mood_df = pd.DataFrame(mood_df)

# Store all derived data
df.to_csv(DATA_PATH, sep=',', encoding='utf-8', index=False)
mood_df.to_csv(OUTPUT_PATH, sep=',', encoding='utf-8', index=False)
