# Verwenden des Python-Basisimage
FROM python:3.9

# Setzen des Arbeitsverzeichnises im Container
WORKDIR /app

# Kopieren Sie die Anforderungen in den Container
COPY requirements.txt .

# Installieren der erforderlichen Pakete
RUN pip install --no-cache-dir -r requirements.txt

# Kopieren des RandomForestClassifier-Codes in den Container
COPY RandomForestClassifier.py .


# RandomForestClassifier ausführen
CMD ["python", "RandomForestClassifier.py"]