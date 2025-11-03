# Kubernetes Manifests

Kubernetes deployment configurations for CommunityGaming services.

## Structure

- `base/`: Base resources (namespaces, config maps)
- `apps/`: Application deployments (api-gateway, ws-gateway, services)
- `ingress/`: Ingress controllers and rules

## Deployment

```bash
# Apply base resources
kubectl apply -f base/

# Deploy applications
kubectl apply -f apps/

# Deploy ingress
kubectl apply -f ingress/
```

## HPA (Horizontal Pod Autoscaler)

All critical services have HPA configured:

- API Gateway: 3-10 replicas
- WS Gateway: 3-20 replicas
- Services: 2-8 replicas each

## Resource Requests/Limits

- Requests: Guaranteed resources
- Limits: Maximum resources
