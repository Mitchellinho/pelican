FROM registry.hda.onl/nabla/containerbase/jre-11

# Install curl
RUN apt update \
    && apt install -y curl \
    && rm -rf /var/lib/apt/lists/*


ENV PELICAN_SERVER_PORT=8080
# For example: http://localhost:8081
# For example: https://nabla.algo.informatik.tu-darmstadt.de
# For example: https://alpha.e-learning.tu-darmstadt.de
ENV CASSANDRA_NODE=""
ENV CASSANDRA_DATACENTER=""
ENV SERVICENAME_CASSANDRA_KEYSPACE="pelican"
ENV ELASTICSEARCH_NODE=$CASSANDRA_NODE
# Please Change this
ENV TOKEN_SECRET="123456"

# Copy backend
COPY pelican-all.jar /opt/backend/pelican.jar

EXPOSE $PELICAN_SERVER_PORT

# Check version endpoint
HEALTHCHECK CMD curl --fail http://localhost:$PELICAN_SERVER_PORT/backend/version || exit 1

CMD ["java", "-jar", "/opt/backend/pelican.jar"]
