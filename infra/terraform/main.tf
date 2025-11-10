terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.20"
    }
  }

  backend "s3" {
    # Configure S3 backend for state
    # bucket = "community-gaming-terraform-state"
    # key    = "prod/terraform.tfstate"
    # region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

# EKS Cluster
module "eks" {
  source = "./modules/eks"

  environment     = var.environment
  cluster_version = var.eks_cluster_version
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
}

# RDS PostgreSQL
module "rds" {
  source = "./modules/rds"

  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.database_subnet_ids
  instance_class    = var.rds_instance_class
  allocated_storage = var.rds_allocated_storage
}

# ElastiCache Redis
module "redis" {
  source = "./modules/redis"

  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.cache_subnet_ids
  node_type      = var.redis_node_type
}

# S3 and CloudFront for static assets
module "cdn" {
  source = "./modules/cdn"

  environment = var.environment
  domain_name = var.domain_name
}
