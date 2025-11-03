# Terraform Infrastructure

Infrastructure as Code for CommunityGaming platform.

## Modules

- **VPC**: Networking, subnets, NAT gateways
- **EKS**: Kubernetes cluster with node groups
- **RDS**: PostgreSQL database
- **Redis**: ElastiCache for caching and sessions
- **CDN**: S3 + CloudFront for static assets

## Usage

```bash
# Initialize
terraform init

# Plan
terraform plan -var-file="environments/prod.tfvars"

# Apply
terraform apply -var-file="environments/prod.tfvars"
```

## Environments

- `dev.tfvars`: Development environment
- `staging.tfvars`: Staging environment
- `prod.tfvars`: Production environment
