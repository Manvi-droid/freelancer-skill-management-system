#!/bin/bash
# ==============================================================================
# AWS EC2 User Data Script (Instance Launch Script)
# Freelancer Skill Management System (FSMS v1.1) - IEEE 830 Architecture
# Paste this entire script into:
# AWS EC2 Console -> Launch Instance -> Advanced Details -> User data
# Compatible with: Ubuntu 22.04/24.04 LTS & Amazon Linux 2023 (Free Tier t2.micro / t3.micro)
# ==============================================================================

set -e
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=========================================================="
echo "🚀 Starting FSMS Automated Deployment on AWS EC2..."
echo "=========================================================="

# 1. Detect OS & Install Prerequisites (Git, Build Tools, Node.js 20 LTS)
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS="unknown"
fi

echo "📦 Detected Operating System: $OS"

if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y curl git build-essential python3 iptables
    # Install Node.js 20.x LTS from NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
elif [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
    dnf update -y || yum update -y
    dnf groupinstall "Development Tools" -y || yum groupinstall "Development Tools" -y
    dnf install -y git python3 iptables || yum install -y git python3 iptables
    # Install Node.js 20
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs || yum install -y nodejs
fi

echo "✅ Node version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# 2. Setup Application Directory & Clone Repository
APP_DIR="/var/www/fsms"
rm -rf $APP_DIR
mkdir -p /var/www
git clone https://github.com/Manvi-droid/freelancer-skill-management-system.git $APP_DIR

cd $APP_DIR

# 3. Create Production Environment Configuration (.env)
cat << 'EOF' > .env
PORT=5000
NODE_ENV=production
JWT_SECRET=fsms_production_secret_key_2026_vit_bce_manvi
DATA_DIR=/var/www/fsms/data
UPLOAD_DIR=/var/www/fsms/uploads
EOF

mkdir -p data uploads

# 4. Install Dependencies & Build Frontend Client
echo "📦 Installing root backend dependencies..."
npm install --omit=dev

echo "📦 Installing frontend dependencies and building production client..."
cd client
npm install
npm run build
cd ..

# 5. Setup Port 80 -> 5000 Forwarding (Access site directly on port 80 without :5000)
echo "🌐 Configuring port forwarding (80 -> 5000)..."
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000 || true

# 6. Configure systemd Service for 24/7 Daemon Management
echo "⚙️ Creating systemd service for FSMS..."
cat << 'EOF' > /etc/systemd/system/fsms.service
[Unit]
Description=Freelancer Skill Management System (FSMS)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/fsms
EnvironmentFile=/var/www/fsms/.env
ExecStart=/usr/bin/node server/server.js
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=fsms

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable fsms
systemctl restart fsms

echo "=========================================================="
echo "🎉 FSMS Deployment Complete!"
echo "Server status: $(systemctl is-active fsms)"
echo "Access the app in your browser at: http://<EC2-PUBLIC-IP>"
echo "Default page is configured as: Dual-Portal Login Page"
echo "=========================================================="
