# 📦 AWS Academy - Guía de Configuración Paso a Paso

## 🎓 Configurar AWS Academy Learner Lab

### Paso 1: Acceder a AWS Academy

1. Ve a [AWS Academy](https://awsacademy.instructure.com)
2. Inicia sesión con tu cuenta de estudiante
3. Entra a tu curso de Cloud Computing
4. Click en **"Modules"** → **"Learner Lab"**
5. Click en **"Start Lab"** (espera ~2 minutos a que el círculo se ponga verde 🟢)

---

### Paso 2: Obtener Credenciales AWS (Método Único para Todos)

**⚠️ IMPORTANTE:** AWS Academy NO permite crear IAM Users. Todos usarán credenciales temporales.

#### Procedimiento Estándar (Todos los miembros del equipo)

1. En Learner Lab, click en **"AWS Details"**
2. Click en **"Show"** en AWS CLI credentials
3. **AWS Academy te da las credenciales como `[default]`:**

```bash
[default]
aws_access_key_id=ASIAXXX...
aws_secret_access_key=abc123...
aws_session_token=IQoJb3JpZ2luX2VjE...
```

4. Copiar TODO el contenido

5. Crear/editar archivo de credenciales:

```bash
# Linux/Mac
nano ~/.aws/credentials

# Windows
notepad %USERPROFILE%\.aws\credentials
```

6. **IMPORTANTE:** Cambiar `[default]` por `[fridays-dev]` al pegar:

```bash
# ❌ NO pegues así (como viene de AWS Academy):
[default]
aws_access_key_id=ASIAXXX...
aws_secret_access_key=abc123...
aws_session_token=IQoJb3JpZ2luX2VjE...

# ✅ PEGA así (cambia [default] por [fridays-dev]):
[fridays-dev]
aws_access_key_id=ASIAXXX...
aws_secret_access_key=abc123...
aws_session_token=IQoJb3JpZ2luX2VjE...
```

**¿Por qué cambiar `[default]` a `[fridays-dev]`?**
- ✅ Evitas conflictos con otras cuentas AWS personales
- ✅ Todo el equipo usa el mismo nombre de perfil
- ✅ Los comandos son idénticos para todos

**Si prefieres usar `[default]`:** También funciona, pero tendrás que modificar los comandos:
```bash
# Con [fridays-dev] (recomendado):
serverless deploy --stage dev --aws-profile fridays-dev

# Con [default] (alternativa):
serverless deploy --stage dev --aws-profile default
# O simplemente:
serverless deploy --stage dev
```

7. Guardar archivo: `Ctrl + O`, `Enter`, `Ctrl + X`

⚠️ **IMPORTANTE:** Estas credenciales expiran cada 4 horas. Debes renovarlas.

---

### Paso 3: Verificar Configuración

```bash
# Listar perfiles configurados
aws configure list-profiles

# TODOS deben ver: fridays-dev

# Probar conexión (TODOS usan el mismo comando)
aws sts get-caller-identity --profile fridays-dev

# Deberías ver:
# {
#   "UserId": "AIDAXXX:usuario",
#   "Account": "123456789012",
#   "Arn": "arn:aws:sts::123456789012:assumed-role/LabRole/usuario"
# }
```

---

### Paso 4: Configurar Variables de Entorno

**TODOS crean el mismo archivo `.env` en cada servicio:**

```bash
# services/delivery-service/.env
# services/admin-service/.env
# services/ecommerce-service/.env
# services/kitchen-service/.env

STAGE=dev
AWS_PROFILE=fridays-dev
AWS_REGION=us-east-1
JWT_SECRET=fridays-secret-key-2025-proyectofinal
```

**👉 IMPORTANTE: Todos usan `STAGE=dev` y `AWS_PROFILE=fridays-dev`**

---

## 🔄 Renovar Credenciales de AWS Academy

**Cada 4 horas debes:**

1. Ir a Learner Lab
2. Click en **"AWS Details"** → **"Show"**
3. Copiar nuevas credenciales
4. Actualizar `~/.aws/credentials`

**⚠️ IMPORTANTE: Mantener el mismo nombre de perfil `fridays-dev`**

O usar este script:

```bash
# scripts/update-credentials.sh
#!/bin/bash

echo "Paste AWS credentials (Ctrl+D when done):"
cat > ~/.aws/credentials << 'EOF'
[fridays-dev]
EOF
cat >> ~/.aws/credentials
echo "✅ Credentials updated!"
echo "Verify with: aws sts get-caller-identity --profile fridays-dev"
```

---

## 🚀 Instalar Serverless Framework

```bash
# Instalar Serverless globalmente
npm install -g serverless

# Verificar instalación
serverless --version

# Configurar Serverless con tu perfil AWS
serverless config credentials \
  --provider aws \
  --key ASIAXXX... \
  --secret abc123... \
  --profile dev-nayeli
```

---

## 📝 Configurar serverless.yml para AWS Academy

**⚠️ TODOS usan la MISMA configuración:**

```yaml
# services/delivery-service/serverless.yml
# (Lo mismo para todos los servicios)

service: fridays-delivery-service

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  stage: ${opt:stage, 'dev'}           # <-- TODOS usan 'dev'
  region: us-east-1
  profile: ${opt:profile, 'fridays-dev'}  # <-- TODOS usan 'fridays-dev'
  
  environment:
    STAGE: ${self:provider.stage}
    JWT_SECRET: fridays-secret-key-2025-proyectofinal  # <-- MISMO secret
  
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:*
          Resource:
            - arn:aws:dynamodb:${self:provider.region}:*:table/*-${self:provider.stage}
            - arn:aws:dynamodb:${self:provider.region}:*:table/*-${self:provider.stage}/index/*
        - Effect: Allow
          Action:
            - logs:*
          Resource: '*'
        - Effect: Allow
          Action:
            - execute-api:ManageConnections
          Resource: '*'

functions:
  # Tus funciones aquí
  
resources:
  Resources:
    # IMPORTANTE: Nombres de tablas siguen formato: {Tabla}-${self:provider.stage}
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: Users-${self:provider.stage}  # = Users-dev
        # ...
```

---

## 🧪 Primer Deploy de Prueba

**⚠️ TODOS ejecutan el mismo comando:**

```bash
# Ir a tu servicio
cd services/delivery-service

# Instalar dependencias
npm install

# Deploy - TODOS usan estos mismos parámetros
serverless deploy --stage dev --aws-profile fridays-dev --verbose

# Si funciona, verás:
# ✔ Service deployed to stack fridays-delivery-service-dev
# endpoints:
#   POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/api/delivery/...
# functions:
#   assignDriver: fridays-delivery-service-dev-assignDriver
# ...
```

**✅ Verificar que las tablas se crearon:**

```bash
# TODOS pueden ver las mismas tablas
aws dynamodb list-tables --profile fridays-dev

# Deberías ver:
# - Users-dev
# - Orders-dev
# - Products-dev
# - Tenants-dev
# etc.
```

---

## 🗑️ Limpiar Recursos (Importante para no consumir créditos)

**⚠️ COORDINARSE con el equipo antes de eliminar recursos compartidos**

```bash
# Eliminar solo TU servicio
serverless remove --stage dev --aws-profile fridays-dev

# ⚠️ CUIDADO: Esto NO elimina las tablas DynamoDB si otros servicios las crearon
# Solo elimina las funciones Lambda de TU servicio

# Ver stacks activos (TODOS pueden ver los mismos)
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --profile fridays-dev

# Ver funciones Lambda desplegadas
aws lambda list-functions --profile fridays-dev | grep fridays
```

**💡 Tip:** Como todos trabajan en la MISMA cuenta (cada uno en su AWS Academy), las tablas son compartidas. Si alguien las elimina, afecta a todos.

---

## 💰 Monitorear Recursos Desplegados

**TODOS pueden ver los MISMOS recursos:**

```bash
# Ver todos los stacks de CloudFormation
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --profile fridays-dev \
  --query "StackSummaries[?contains(StackName, 'fridays')].StackName"

# Ver todas las funciones Lambda del proyecto
aws lambda list-functions --profile fridays-dev \
  --query "Functions[?contains(FunctionName, 'fridays')].FunctionName"

# Ver todas las tablas DynamoDB
aws dynamodb list-tables --profile fridays-dev

# Ver qué servicios están desplegados
# - fridays-ecommerce-service-dev (Leonardo)
# - fridays-kitchen-service-dev (Luis)
# - fridays-delivery-service-dev (Nayeli)
# - fridays-admin-service-dev (Nayeli)
```

**En la consola AWS:**
1. **CloudFormation** → Ver todos los stacks con "fridays" en el nombre
2. **Lambda** → Ver todas las funciones desplegadas
3. **DynamoDB** → Ver tablas: `Users-dev`, `Orders-dev`, etc.

---

## ⚠️ Limitaciones de AWS Academy

- ❌ No puedes crear algunos recursos (ej: VPC custom)
- ❌ Credenciales expiran cada 4 horas
- ❌ Máximo $100 de créditos
- ✅ Puedes usar: Lambda, DynamoDB, API Gateway, S3, CloudWatch
- ✅ Suficiente para desarrollo y pruebas

---

## 🆘 Troubleshooting

### Error: "The security token included in the request is expired"

```bash
# Solución: Renovar credenciales
# Ir a Learner Lab → AWS Details → Show → Copiar nuevas credenciales
```

### Error: "User is not authorized to perform: iam:CreateRole"

```bash
# Solución: Serverless Framework intenta crear roles IAM
# Agregar en serverless.yml:

provider:
  iam:
    role:
      name: DeliveryServiceRole-${self:provider.stage}
      # Si sigue fallando, pedir al profesor acceso IAM
```

### Error: "Rate exceeded"

```bash
# Esperar 1 minuto y reintentar
# AWS Academy tiene rate limits bajos
```

---

## 📚 Recursos Útiles

- [AWS Academy Learner Lab Guide](https://awsacademy.instructure.com/courses/your-course-id/modules)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/)
- [DynamoDB Local Setup](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)

---

## ✅ Checklist Final

- [ ] AWS Academy Lab iniciado (círculo verde 🟢)
- [ ] Credenciales copiadas a `~/.aws/credentials`
- [ ] AWS CLI instalado y configurado
- [ ] Serverless Framework instalado
- [ ] Deploy de prueba exitoso
- [ ] Recursos eliminados después de probar
