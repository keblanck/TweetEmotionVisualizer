# This script cleans the raw data using the following steps:
#     - Removes invalid rows
#     - Removes rows with invalid data (like bad timestamp etc:-)
#     - Removes stop words from posts (i, you, am, etc:-)
#     - Lowercase all words
#     - Stem words
# Result is saved to data/trump_posts_cleaned.csv

import os
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords

STOP_WORDS = set(stopwords.words('english'))


def remove_special_chars(text):
    return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)", " ", text).split())

# Define relevant paths
DATA_PATH = '../data/trump_posts.csv'
CLEAN_DATA_PATH = '../data/trump_posts_cleaned.csv'

# Import data pandas (ignore bad lines)
df = pd.read_csv(DATA_PATH, error_bad_lines=False, index_col=False)
df = df.dropna(subset=['text', 'created_at'])

# lowercase + eliminate stop words & special characters
df['text_cleaned'] = df['text'].apply(lambda x: remove_special_chars(x))
df['text_cleaned'] = df['text_cleaned'].str.lower().str.split()
df['text_cleaned'] = df['text_cleaned'].apply(lambda x: [item for item in x if item not in STOP_WORDS])
df['text_cleaned'] = df['text_cleaned'].apply(lambda x: ' '.join(x))

# TODO: Stem words to better map to lexicons

print(df)

df.to_csv(CLEAN_DATA_PATH, sep=',', encoding='utf-8', index=False)