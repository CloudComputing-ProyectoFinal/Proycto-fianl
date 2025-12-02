#!/bin/bash

##############################################################################
# Script de Despliegue - Corrección CORS
# Despliega solo los servicios modificados con la configuración CORS actualizada
##############################################################################

set -e  # Salir si hay algún error

# Cambiar al directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR" || exit 1

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo "════════════════════════════════════════════════════════════"
echo "   🚀 Despliegue de Servicios con CORS Corregido"
echo "════════════════════════════════════════════════════════════"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "services" ]; then
    print_error "Este script debe ejecutarse desde el directorio backend/"
    exit 1
fi

# Lista de servicios a desplegar
SERVICES=(
    "ecommerce-service"
    "admin-service"
    "delivery-service"
    "kitchen-service"
    "websocket-service"
)

# Contador de éxitos y fallos
SUCCESS_COUNT=0
FAIL_COUNT=0
FAILED_SERVICES=()

print_info "Servicios a desplegar: ${#SERVICES[@]}"
echo ""

# Desplegar cada servicio
for service in "${SERVICES[@]}"; do
    SERVICE_PATH="services/$service"
    
    if [ ! -d "$SERVICE_PATH" ]; then
        print_warning "Directorio no encontrado: $SERVICE_PATH - Saltando..."
        continue
    fi
    
    print_info "Desplegando: $service"
    echo "────────────────────────────────────────────────────────────"
    
    cd "$SERVICE_PATH"
    
    # Verificar que existe serverless.yml
    if [ ! -f "serverless.yml" ]; then
        print_error "No se encontró serverless.yml en $SERVICE_PATH"
        cd ../..
        ((FAIL_COUNT++))
        FAILED_SERVICES+=("$service")
        continue
    fi
    
    # Desplegar con serverless (usando V3 para evitar problemas de autenticación)
    if npx serverless@3 deploy --verbose 2>&1 | tee "/tmp/deploy-${service}.log"; then
        print_success "$service desplegado exitosamente"
        ((SUCCESS_COUNT++))
    else
        print_error "Fallo al desplegar $service"
        print_info "Revisa el log: /tmp/deploy-${service}.log"
        ((FAIL_COUNT++))
        FAILED_SERVICES+=("$service")
    fi
    
    echo ""
    cd ../..
done

# Resumen final
echo "════════════════════════════════════════════════════════════"
echo "   📊 Resumen de Despliegue"
echo "════════════════════════════════════════════════════════════"
echo ""
print_info "Total de servicios: ${#SERVICES[@]}"
print_success "Desplegados exitosamente: $SUCCESS_COUNT"

if [ $FAIL_COUNT -gt 0 ]; then
    print_error "Fallidos: $FAIL_COUNT"
    echo ""
    print_warning "Servicios que fallaron:"
    for failed in "${FAILED_SERVICES[@]}"; do
        echo "  - $failed"
    done
    echo ""
    print_info "Revisa los logs en /tmp/deploy-*.log para más detalles"
    exit 1
else
    print_success "¡Todos los servicios desplegados exitosamente!"
    echo ""
    print_info "Los cambios de CORS ya están aplicados en AWS"
    print_info "Puedes probar los endpoints desde tu frontend"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
