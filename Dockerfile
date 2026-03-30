FROM ubuntu:24.04 AS base

ENV TZ=UTC
ARG NODE_VERSION=20.x

# Update and install necessary packages
RUN apt-get clean && \
    apt-get update -o Acquire::CompressionTypes::Order::=gz && \
    apt-get install -y --fix-missing \
    curl wget build-essential clang llvm pkg-config libssl-dev \
    apt-transport-https ca-certificates gnupg software-properties-common

RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs

RUN npm install -g pnpm@latest-10 ic-mops@1.11.1

USER ubuntu
WORKDIR /home/ubuntu
ENV HOME=/home/ubuntu
RUN mkdir -p /home/ubuntu/bin
ENV PATH=/home/ubuntu/.mops/bin:/home/ubuntu/bin:/home/ubuntu/.local/share/dfx/bin:${PATH}

# Optimized PNPM configuration - Fixed the "CAT" and "SET" errors here
RUN mkdir -p /home/ubuntu/.config/pnpm /home/ubuntu/.local/share/pnpm/store /home/ubuntu/.cache/pnpm && \
    echo "nodeLinker=hoisted\nstore-dir=/home/ubuntu/.local/share/pnpm/store\ncache-dir=/home/ubuntu/.cache/pnpm\nprefer-offline=true" > /home/ubuntu/.config/pnpm/rc

ENV PNPM_HOME="/home/ubuntu/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install icp-cli - Combined into one clean RUN to avoid instruction errors
RUN curl --proto '=https' --tlsv1.2 -LsSf https://github.com/dfinity/icp-cli/releases/download/v0.1.0-beta.3/icp-cli-installer.sh | sh && \
    ls -la /home/ubuntu/.cargo/bin/

ENV PATH="/home/ubuntu/.cargo/bin:${PATH}"

# Install Motoko compiler - Architecture-aware clean RUN
RUN export MOTOKO_VERSION=1.2.0 && \
    case ${TARGETARCH:-$(uname -m)} in \
        amd64|x86_64) COMPILER_TARBALL="motoko-Linux-x86_64-${MOTOKO_VERSION}.tar.gz" ;; \
        arm64|aarch64) COMPILER_TARBALL="motoko-Linux-aarch64-${MOTOKO_VERSION}.tar.gz" ;; \
        *) exit 1 ;; \
    esac && \
    mkdir -p "$HOME/.motoko/moc/$MOTOKO_VERSION/bin" && \
    curl -L "https://github.com/caffeinelabs/motoko/releases/download/${MOTOKO_VERSION}/${COMPILER_TARBALL}" | tar -xz -C "$HOME/.motoko/moc/$MOTOKO_VERSION/bin"

# Install Motoko libs
RUN export CORE_LIB_VERSION=moc-1.2.0 && \
    mkdir -p "$HOME/.motoko/core/$CORE_LIB_VERSION" && \
    curl -L "https://github.com/caffeinelabs/motoko-core/archive/refs/tags/${CORE_LIB_VERSION}.tar.gz" | tar -xz --strip-components=2 -C "$HOME/.motoko/core/$CORE_LIB_VERSION" "motoko-core-${CORE_LIB_VERSION}/src"

ENV MOC_PATH="/home/ubuntu/.motoko/moc/1.2.0/bin/moc"
ENV MOTOKO_CORE="/home/ubuntu/.motoko/core/moc-1.2.0"

WORKDIR /workdir
COPY --chown=ubuntu:ubuntu . /workdir/
RUN chmod +x /workdir/deploy.sh

ENTRYPOINT ["/workdir/deploy.sh"]


