#!/bin/bash
# ==============================================================================
# AWS Free Tier EC2 (Amazon Linux 2023) Auto-Bootstrap & Deployment Script
# 100% Free Tier Eligible (t2.micro / t3.micro in all AWS Regions)
# ==============================================================================

set -e
echo "Starting FSMS AWS Free Tier Setup..."

# 1. Update OS packages
dnf update -y

# 2. Install Docker, Git, and Libs
dnf install -y docker git
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# 3. Install Docker Compose
DOCKER_CONFIG=${DOCKER_CONFIG:-/usr/local/lib/docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
ln -s $DOCKER_CONFIG/cli-plugins/docker-compose /usr/local/bin/docker-compose || true

# 4. Clone Application Repository
DEPLOY_DIR="/home/ec2-user/fsms"
if [ ! -d "$DEPLOY_DIR" ]; then
  git clone https://github.com/your-username/freelancer-skill-management-system.git "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR"

# 5. Build and Launch Containers
docker-compose up -d --build

# 6. Setup automatic iptables redirect (Port 80 -> 5000) as additional fallback
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000 || true

echo "================================================================="
echo "✅ FSMS Freelancer Skill Management System successfully deployed!"
echo "🌐 Access via your EC2 Public IP or Public DNS in your browser"
echo "================================================================="
