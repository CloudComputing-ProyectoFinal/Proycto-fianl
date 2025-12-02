#!/usr/bin/env python3
"""
Script para actualizar la configuración de CORS en todos los archivos serverless.yml
Reemplaza 'cors: true' con una configuración CORS completa que acepta cualquier origen
"""

import os
import re
import sys

def fix_cors_in_file(filepath):
    """
    Actualiza la configuración de CORS en un archivo serverless.yml
    
    Args:
        filepath: Ruta al archivo serverless.yml
    
    Returns:
        tuple: (modificado, mensaje)
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        original_content = ''.join(lines)
        modified = False
        changes_count = 0
        new_lines = []
        i = 0
        
        while i < len(lines):
            line = lines[i]
            
            # Buscar líneas con 'cors: true'
            if re.match(r'^(\s+)cors:\s*true\s*$', line):
                # Capturar la indentación
                indent_match = re.match(r'^(\s+)', line)
                indent = indent_match.group(1) if indent_match else '          '
                
                # Reemplazar con configuración completa
                new_lines.append(f"{indent}cors:\n")
                new_lines.append(f"{indent}  origin: '*'\n")
                new_lines.append(f"{indent}  headers:\n")
                new_lines.append(f"{indent}    - Content-Type\n")
                new_lines.append(f"{indent}    - X-Amz-Date\n")
                new_lines.append(f"{indent}    - Authorization\n")
                new_lines.append(f"{indent}    - X-Api-Key\n")
                new_lines.append(f"{indent}    - X-Amz-Security-Token\n")
                new_lines.append(f"{indent}    - X-Amz-User-Agent\n")
                new_lines.append(f"{indent}  allowCredentials: true\n")
                
                modified = True
                changes_count += 1
            else:
                new_lines.append(line)
            
            i += 1
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            
            return True, f"✅ Actualizado: {changes_count} endpoints con CORS configurado"
        else:
            return False, "ℹ️  No se encontraron cambios necesarios"
            
    except Exception as e:
        return False, f"❌ Error: {str(e)}"

def main():
    """Función principal"""
    services_dir = os.path.join(os.path.dirname(__file__), '..', 'services')
    
    if not os.path.exists(services_dir):
        print(f"❌ Error: No se encontró el directorio {services_dir}")
        sys.exit(1)
    
    print("🔧 Actualizando configuración de CORS en todos los servicios...\n")
    
    updated_count = 0
    total_count = 0
    
    # Recorrer todos los subdirectorios de servicios
    for service in os.listdir(services_dir):
        service_path = os.path.join(services_dir, service)
        
        if not os.path.isdir(service_path):
            continue
        
        serverless_file = os.path.join(service_path, 'serverless.yml')
        
        if os.path.exists(serverless_file):
            total_count += 1
            print(f"📁 Procesando: {service}/serverless.yml")
            modified, message = fix_cors_in_file(serverless_file)
            print(f"   {message}")
            
            if modified:
                updated_count += 1
            print()
    
    print("=" * 60)
    print(f"✨ Proceso completado:")
    print(f"   - Archivos procesados: {total_count}")
    print(f"   - Archivos actualizados: {updated_count}")
    print(f"   - Sin cambios: {total_count - updated_count}")
    print("=" * 60)
    
    if updated_count > 0:
        print("\n⚠️  IMPORTANTE: Debes redesplegar los servicios para aplicar los cambios")
        print("   Ejecuta: cd backend && ./deploy-all.sh")

if __name__ == '__main__':
    main()
