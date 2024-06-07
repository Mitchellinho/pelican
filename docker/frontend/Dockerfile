FROM registry.hda.onl/nabla/containerbase/nginx

# Install curl
RUN apt update \
    && apt install -y curl \
    && rm -rf /var/lib/apt/lists/*

# Check version endpoint
HEALTHCHECK CMD curl --fail http://localhost:8081/favicon.ico || exit 1

COPY dist/ /usr/share/nginx/html
