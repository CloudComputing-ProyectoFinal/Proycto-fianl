#!/bin/bash

echo "==================================="
echo "FRIDAYS PERÚ - DEPLOYED ENDPOINTS"
echo "==================================="
echo ""

SERVICES=(
  "ecommerce-service"
  "kitchen-service"
  "delivery-service"
  "admin-service"
  "websocket-service"
  "stepfunctions-service"
  "workers-service"
)

for service in "${SERVICES[@]}"; do
  echo "🔹 $service:"
  cd "services/$service"
  serverless info --stage dev 2>/dev/null | grep -A 30 "endpoints:" || echo "  (Sin endpoints HTTP)"
  echo ""
  cd ../..
done
