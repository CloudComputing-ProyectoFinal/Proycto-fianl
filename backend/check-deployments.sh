#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "        FRIDAYS PERÚ - DEPLOYMENT VERIFICATION REPORT"
echo "═══════════════════════════════════════════════════════════════"
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

echo "✅ DEPLOYED STACKS:"
echo "-----------------------------------"
aws cloudformation list-stacks --region us-east-1 \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query 'StackSummaries[?contains(StackName, `fridays`)].{Service:StackName, Status:StackStatus}' \
  --output table

echo ""
echo "📊 STACK OUTPUTS & ENDPOINTS:"
echo "═══════════════════════════════════════════════════════════════"

for service in "${SERVICES[@]}"; do
  stack_name="fridays-${service}-dev"
  echo ""
  echo "🔹 ${service}:"
  echo "-----------------------------------"
  
  # Obtener outputs del stack
  aws cloudformation describe-stacks \
    --stack-name "$stack_name" \
    --region us-east-1 \
    --query 'Stacks[0].Outputs[?OutputKey==`ServiceEndpoint` || contains(OutputKey, `Url`) || contains(OutputKey, `Endpoint`) || contains(OutputKey, `Arn`)].{Key:OutputKey, Value:OutputValue}' \
    --output table 2>/dev/null || echo "  (Sin outputs HTTP)"
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🔍 API GATEWAY ENDPOINTS:"
echo "═══════════════════════════════════════════════════════════════"

aws apigateway get-rest-apis --region us-east-1 \
  --query 'items[?contains(name, `fridays`) || contains(name, `dev`)].{Name:name, ID:id, Created:createdDate}' \
  --output table

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📝 LAMBDA FUNCTIONS:"
echo "═══════════════════════════════════════════════════════════════"

aws lambda list-functions --region us-east-1 \
  --query 'Functions[?contains(FunctionName, `fridays`)].{Function:FunctionName, Runtime:Runtime, Updated:LastModified}' \
  --output table | head -50

echo ""
echo "✅ Deployment verification complete!"
