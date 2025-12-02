#!/bin/bash

##############################################################################
# Script de Verificación CORS
# Verifica que los endpoints tengan CORS configurado correctamente
##############################################################################

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "════════════════════════════════════════════════════════════"
echo "   🔍 Verificación de Configuración CORS"
echo "════════════════════════════════════════════════════════════"
echo ""

# Verificar archivos serverless.yml
SERVICES=(
    "services/ecommerce-service"
    "services/admin-service"
    "services/delivery-service"
    "services/kitchen-service"
    "services/websocket-service"
)

TOTAL_CORS=0
CORRECT_CORS=0
INCORRECT_CORS=0

for service in "${SERVICES[@]}"; do
    serverless_file="$service/serverless.yml"
    
    if [ ! -f "$serverless_file" ]; then
        print_error "No se encontró: $serverless_file"
        continue
    fi
    
    print_info "Verificando: $service"
    
    # Contar configuraciones de CORS
    cors_count=$(grep -c "cors:" "$serverless_file" || true)
    TOTAL_CORS=$((TOTAL_CORS + cors_count))
    
    # Verificar que tengan origin: '*'
    cors_with_origin=$(grep -A 1 "cors:" "$serverless_file" | grep -c "origin: '\*'" || true)
    
    if [ $cors_with_origin -gt 0 ]; then
        print_success "$service: $cors_with_origin endpoints con CORS configurado correctamente"
        CORRECT_CORS=$((CORRECT_CORS + cors_with_origin))
    else
        # Verificar si hay cors: true sin configurar
        cors_true=$(grep -c "cors: true" "$serverless_file" || true)
        if [ $cors_true -gt 0 ]; then
            print_error "$service: $cors_true endpoints con 'cors: true' (debe actualizarse)"
            INCORRECT_CORS=$((INCORRECT_CORS + cors_true))
        else
            print_info "$service: Sin endpoints con CORS"
        fi
    fi
done

echo ""
echo "════════════════════════════════════════════════════════════"
echo "   📊 Resumen"
echo "════════════════════════════════════════════════════════════"
echo ""
print_info "Total de configuraciones CORS encontradas: $TOTAL_CORS"
print_success "Correctamente configurados: $CORRECT_CORS"

if [ $INCORRECT_CORS -gt 0 ]; then
    print_error "Requieren actualización: $INCORRECT_CORS"
    echo ""
    print_info "Ejecuta el script de corrección: python3 scripts/fix-cors-v2.py"
    exit 1
else
    print_success "¡Todas las configuraciones CORS son correctas!"
    echo ""
    print_info "Ahora puedes desplegar con: ./deploy-cors-fix.sh"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
