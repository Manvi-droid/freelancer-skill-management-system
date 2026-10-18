# ☁️ AWS Free Tier Deployment Guide for FSMS
### Freelancer Skill Management System (v1.1)

This application is engineered from the ground up to run **100% within the AWS 12-Month Free Tier** (or Always Free limits) with **$0.00 infrastructure cost**.

---

## 📊 AWS Free Tier Allocation vs. FSMS Resource Consumption

| AWS Service | Free Tier Monthly Allowance | FSMS Application Usage | Net Cost |
| :--- | :--- | :--- | :--- |
| **Amazon EC2** | 750 hours/month of `t2.micro` (or `t3.micro`) | 720 hours (1 instance running 24/7) | **$0.00** |
| **Amazon EBS** | 30 GB General Purpose SSD storage | 15–20 GB root disk & SQLite database | **$0.00** |
| **Amazon S3** | 5 GB Standard Storage, 20,000 GETs, 2,000 PUTs | ~250 MB evidence files, ~500 requests | **$0.00** |
| **AWS CloudWatch** | 10 alarms, 5 GB log ingestion | 1 billing alarm, ~50 MB system logs | **$0.00** |
| **AWS Budgets** | 2 free budgets per AWS account | 1 zero-cost budget alert at \$0.01 threshold | **$0.00** |
| **Data Transfer** | 100 GB outbound to internet per month | ~2–5 GB monthly traffic | **$0.00** |
| **Total Monthly Spend** | — | — | **$0.00 / month** |

---

## 🚀 Deployment Method 1: 1-Click EC2 Launch via AWS Console (Simplest)

### Step 1: Log in to AWS & Launch Instance
1. Open the [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Select your preferred region (e.g., `us-east-1` N. Virginia, `ap-south-1` Mumbai, or `eu-central-1` Frankfurt).
3. Click **"Launch Instance"**.
4. **Name**: `fsms-freelancer-platform`
5. **Application and OS Images (AMI)**: Choose **Amazon Linux 2023 AMI** *(Free Tier eligible)*.
6. **Instance Type**: Select **`t2.micro`** (or `t3.micro` in regions where `t2.micro` is unavailable).

### Step 2: Configure Network & Security Group
1. Under **Network settings**, choose **Create security group**.
2. Ensure the following checkboxes are enabled:
   - [x] **Allow SSH traffic from** (`My IP`)
   - [x] **Allow HTTP traffic from the internet** (`0.0.0.0/0`)
   - [x] Add a custom TCP rule for **Port 5000** (`0.0.0.0/0`)

### Step 3: Configure Storage
1. Keep the default storage at **20 GiB gp3 SSD** *(Free Tier allows up to 30 GiB!)*.

### Step 4: Paste User Data Script
1. Expand **Advanced details** at the bottom of the page.
2. Scroll to the **User data** box and paste the contents of [`deploy/aws-ec2-userdata.sh`](file:///C:/Users/Manvi/.gemini/antigravity/scratch/freelancer-skill-management-system/deploy/aws-ec2-userdata.sh):

```bash
#!/bin/bash
dnf update -y
dnf install -y docker git
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
DOCKER_CONFIG=${DOCKER_CONFIG:-/usr/local/lib/docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
ln -s $DOCKER_CONFIG/cli-plugins/docker-compose /usr/local/bin/docker-compose || true

# Deploy FSMS
cd /home/ec2-user
git clone https://github.com/your-username/freelancer-skill-management-system.git fsms
cd fsms
docker-compose up -d --build
```

3. Click **"Launch Instance"**!
4. In 2–3 minutes, navigate to `http://<YOUR-EC2-PUBLIC-IP>` in your browser to view your live FSMS application!

---

## ⚡ Deployment Method 2: Automated CloudFormation Stack

If you prefer Infrastructure-as-Code (IaC), use the included CloudFormation template [`deploy/cloudformation-freetier.yaml`](file:///C:/Users/Manvi/.gemini/antigravity/scratch/freelancer-skill-management-system/deploy/cloudformation-freetier.yaml).

Run via AWS CLI:
```bash
aws cloudformation create-stack \
  --stack-name fsms-freetier-stack \
  --template-body file://deploy/cloudformation-freetier.yaml \
  --capabilities CAPABILITY_IAM
```
This automatically sets up:
- 1x S3 Free Tier Bucket with automatic lifecycle expiration
- 1x IAM Instance Profile with least-privilege policies
- 1x Security Group with HTTP/HTTPS/SSH
- 1x EC2 `t2.micro` running Docker Compose

---

## 🛡️ Crucial Safety Step: Setting a $0.01 AWS Budget Alert

To ensure you are **never unexpectedly billed**, configure an AWS Budget alert:

1. In the AWS Console, search for **AWS Budgets**.
2. Click **Create budget** -> Choose **Cost budget** -> Click **Next**.
3. Set **Budget name**: `Zero-Cost-Safety-Guardrail`.
4. Set **Period**: Monthly.
5. Set **Budgeted amount**: `$0.01` (One cent).
6. Under **Set alert threshold**:
   - Trigger: `Actual spend > $0.01`
   - Email recipients: Enter your personal email address.
7. Click **Confirm budget**.

> [!NOTE]
> If any service exceeds Free Tier thresholds, AWS will immediately send an email alert before any material charge can accrue.

---

## 📦 How Cloud Evidence Storage Works

FSMS features a dual-mode storage engine:
1. **Local Mode (Default)**: Evidence and certificates are saved inside `./uploads/` with zero AWS dependencies.
2. **AWS S3 Mode**: When you provide `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` in `.env`, files are streamed directly into your AWS S3 Free Tier bucket!
