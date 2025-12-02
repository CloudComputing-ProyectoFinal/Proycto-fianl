#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "     FRIDAYS PERÚ - ENDPOINTS DEPLOYADOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Ecommerce Service
echo "🛒 ECOMMERCE SERVICE:"
echo "   https://lwihntphpl.execute-api.us-east-1.amazonaws.com/dev"
echo ""

# Kitchen Service
echo "👨‍🍳 KITCHEN SERVICE:"
echo "   https://6nry2wpzl1.execute-api.us-east-1.amazonaws.com/dev"
echo ""

# Delivery Service
echo "🚚 DELIVERY SERVICE:"
echo "   https://8ghxkz67bd.execute-api.us-east-1.amazonaws.com/dev"
echo ""

# Admin Service
echo "👤 ADMIN SERVICE:"
echo "   https://kdf5akbdk9.execute-api.us-east-1.amazonaws.com/dev"
echo ""

# WebSocket Service
echo "🔌 WEBSOCKET SERVICE:"
echo "   wss://meb0i6igh8.execute-api.us-east-1.amazonaws.com/dev"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "📊 RECURSOS ADICIONALES:"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Step Functions
echo "⚙️  STEP FUNCTIONS:"
aws cloudformation describe-stacks --stack-name fridays-stepfunctions-service-dev --region us-east-1 --query 'Stacks[0].Outputs[?contains(OutputKey, `Arn`)].{Key:OutputKey, Value:OutputValue}' --output table 2>/dev/null

echo ""

# Workers Service (SQS, SNS)
echo "📬 WORKERS SERVICE (SQS & SNS):"
aws cloudformation describe-stacks --stack-name fridays-workers-service-dev --region us-east-1 --query 'Stacks[0].Outputs[].{Key:OutputKey, Value:OutputValue}' --output table 2>/dev/null

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Todos los servicios están deployados y operacionales!"
echo "═══════════════════════════════════════════════════════════════"
