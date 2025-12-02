#!/bin/bash

###############################################################################
# FRIDAYS PERÚ - DEPLOY REMAINING SERVICES
# Deploya los 5 servicios faltantes usando Serverless v3
###############################################################################

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Servicios a deployar
SERVICES=(
  "ecommerce-service"
  "kitchen-service"
  "delivery-service"
  "admin-service"
  "websocket-service"
)

SUCCESS=0
FAILED=0
START_TIME=$(date +%s)

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║   FRIDAYS PERÚ - DEPLOY SERVICIOS RESTANTES           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

for i in "${!SERVICES[@]}"; do
  INDEX=$((i + 1))
  SERVICE="${SERVICES[$i]}"
  
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}📦 [$INDEX/5] Deploying: $SERVICE${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  cd "services/$SERVICE" || {
    echo -e "${RED}❌ No se pudo acceder a services/$SERVICE${NC}"
    FAILED=$((FAILED + 1))
    continue
  }
  
  # Usar serverless v3 local
  if npx serverless@3 deploy --stage dev 2>&1 | tee "/tmp/deploy-${SERVICE}.log"; then
    echo ""
    echo -e "${GREEN}✅ $SERVICE deployado exitosamente!${NC}"
    SUCCESS=$((SUCCESS + 1))
  else
    echo ""
    echo -e "${RED}❌ Error al deployar $SERVICE${NC}"
    echo -e "${YELLOW}Ver logs en: /tmp/deploy-${SERVICE}.log${NC}"
    FAILED=$((FAILED + 1))
  fi
  
  cd ../..
  
  if [ $INDEX -lt 5 ]; then
    echo ""
    echo -e "${YELLOW}⏳ Esperando 5 segundos...${NC}"
    sleep 5
    echo ""
  fi
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║              DEPLOYMENT SUMMARY                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "📊 ${GREEN}Exitosos:${NC} $SUCCESS/5"

if [ $FAILED -gt 0 ]; then
  echo -e "📊 ${RED}Fallidos:${NC} $FAILED/5"
fi

echo -e "⏱️  Tiempo total: ${MINUTES}m ${SECONDS}s"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ¡Todos los servicios deployados exitosamente!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Algunos servicios fallaron. Revisa los logs.${NC}"
  exit 1
fi
