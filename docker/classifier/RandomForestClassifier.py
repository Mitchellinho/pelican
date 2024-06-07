# Import necessary libraries
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import balanced_accuracy_score, confusion_matrix
from sklearn import preprocessing, pipeline
from sklearn.preprocessing import OrdinalEncoder, MinMaxScaler
import pandas as pd
import numpy as np
from flask import Flask, request
from flask_cors import CORS
import os
import uuid

# Docker commands for building and running the classifier
# docker build -t classifier-image .
# docker run -p 8000:8000 -v /Users/lauritzrasbach/Documents/MA/data/:/app/data/. --name classifier-container classifier-image

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Function to calculate weights for each semester
def calculate_weights(semester_data):
    return np.array(semester_data.map(lambda s: sum([int(n) for n in s[:4]]) + (0.5 if s[-4:]=='WiSe' else 0)))

# Function to train the classifier
def train_classifier(X, y, weights, balanced, max_depth, min_samples_leaf):
    clf = RandomForestClassifier(class_weight=balanced, max_depth=max_depth, min_samples_leaf=min_samples_leaf)
    clf.fit(X, y, sample_weight=weights)

# Function to calculate scores for the classifier
def calculate_scores(clf, X_test, y_test):
    y_pred = clf.predict(X_test)
    score = clf.score(X_test, y_test)
    balanced_score = balanced_accuracy_score(y_test, y_pred)
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred, labels=[0, 1]).ravel()
    return score, balanced_score, tn, fp, fn, tp

# Function to remove a directory tree
def remove_directory_tree(start_directory: str):
    for name in os.listdir(start_directory):
        path = os.path.join(start_directory, name)
        if os.path.isfile(path):
            os.remove(path)
        else:
            remove_directory_tree(path)
    os.rmdir(start_directory)

# Route for training the classifier
@app.route('/train', methods=['POST'])
def train():
    id = str(uuid.uuid4())
    data = pd.json_normalize(request.json, max_level=0)
    multi_label = pd.json_normalize([x['multiLabel'] for x in request.json])
    weights = calculate_weights(data['semester'])
    regulation = data['regulation'][0]
    single_label = data['singleLabel'].map(lambda x: 1 if x == 'accepted' else 0)
    balanced = 'balanced' if data['balanced'][0] else None
    max_depth = int(data['maxDepth'][0])
    min_samples_leaf = data['minSamplesLeaf'][0]
    os.makedirs(regulation + "/" + id, exist_ok=True)
    X = data.drop(['regulation', 'singleLabel','multiLabel', 'maxDepth', 'balanced', 'minSamplesLeaf', 'semester'], axis=1)
    cols = list(X.columns)
    cols.remove('qs')


    pipe_single = pipeline.Pipeline([('encoder', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)), ('scaler', MinMaxScaler()), ('classifier', RandomForestClassifier(class_weight=balanced, max_depth=max_depth, min_samples_leaf=min_samples_leaf))])
    pipe_multi = pipeline.Pipeline([('encoder', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)), ('scaler', MinMaxScaler()), ('classifier', RandomForestClassifier(class_weight=balanced, max_depth=max_depth, min_samples_leaf=min_samples_leaf))])
    X_train, X_test, y_train, y_test, sample_weight, _ = train_test_split(X, single_label, weights, test_size=0.25, shuffle=True)

    pipe_single.fit(X_train, y_train, **{'classifier__sample_weight':sample_weight})
    score, balanced_score, tn, fp, fn, tp = calculate_scores(pipe_single, X_test, y_test)
    joblib.dump(pipe_single, "{}/{}/single.joblib".format(regulation, id))

    X_train, X_test, y_train, y_test, sample_weight, _ = train_test_split(X, multi_label, weights, test_size=0.25, shuffle=True)
    pipe_multi.fit(X_train, y_train, **{'classifier__sample_weight':sample_weight})
    score_multi = pipe_multi.score(X, multi_label)
    joblib.dump(pipe_multi, "{}/{}/multi.joblib".format(regulation, id))

    return {'score_single': score, 'balanced_accuracy_score':balanced_score, 'score_multi':score_multi, 'truePositives': float(tp), 'falsePositives': float(fp), 'trueNegatives': float(tn), 'falseNegatives': float(fn), 'uuid': id}

# Route for removing a classifier
@app.route('/remove', methods=['POST'])
def delete():
    data = pd.json_normalize(request.json, max_level=0)
    clf = data['clf']
    regulation = data['regulation']
    try:
        remove_directory_tree(regulation + "/" + clf)
    except:
        print('Unable to delete classifier')
    return {200}

# Route for classifying data
@app.route('/classify', methods=['POST'])
def classify():
    df = pd.DataFrame()
    data = pd.json_normalize(request.json)
    regulation = data['regulation'][0]
    classifier = data['classifier'][0]
    df['qs'] = data['qs']
    df['alreadyApplied'] = data['alreadyApplied']
    df['degree'] = data['degree']
    df['university'] = data['university']
    cols = list(df.columns)
    cols.remove('qs')

    clf = joblib.load("{}/{}/single.joblib".format(regulation, classifier))
    clf_multi = joblib.load("{}/{}/multi.joblib".format(regulation, classifier))
    results = clf.predict(df.values)
    results_multi = clf_multi.predict(df.values)
    return {'results': results.tolist(), 'results_multi':results_multi.tolist()} 

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
