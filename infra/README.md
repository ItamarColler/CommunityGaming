# Infrastructure

Infrastructure as Code and Kubernetes configurations for CommunityGaming.

## Directory Structure

```
infra/
├── terraform/          # AWS IaC (VPC, EKS, RDS, Redis, CDN)
└── k8s/               # Kubernetes manifests
    ├── base/          # Base resources
    ├── apps/          # Application deployments
    └── ingress/       # Ingress rules
```

## Technologies

- **Terraform**: Infrastructure provisioning
- **Kubernetes**: Container orchestration
- **Helm**: Package management (optional)
- **ArgoCD**: GitOps deployment (future)

## Environments

- Development
- Staging
- Production
