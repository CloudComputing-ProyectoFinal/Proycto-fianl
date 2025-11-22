# Ecommerce Service API — Especificación de Request / Response

Base URL:

```
https://5c5ur3jz42.execute-api.us-east-1.amazonaws.com/dev   #cambiable
```

Resumen
 - Esta especificación describe los endpoints disponibles en el servicio `ecommerce-service`, los cuerpos de request esperados, y los ejemplos de response.
 - Autenticación: la mayoría de los endpoints relacionados con carrito y órdenes requieren un token JWT en el header `Authorization: Bearer <token>` (emitido por `/auth/login` o `/auth/register`).

Formato general
 - Content-Type: `application/json`
 - Todas las respuestas exitosas devuelven JSON y códigos HTTP estándar (`200`, `201`, `204`, `400`, `401`, `404`, `500`).

Variables útiles
```
BASE_URL="https://5c5ur3jz42.execute-api.us-east-1.amazonaws.com/dev"
AUTH_HEADER="Authorization: Bearer <TOKEN>"
```

Endpoints
---------

1) POST /auth/register

 - Descripción: registra un nuevo usuario y devuelve token de sesión.
 - Headers: `Content-Type: application/json`
 - Request body:

```json
{
  "email": "cliente@example.com",
  "password": "Password123!",
  "name": "Juan Perez",
  "phone": "+51987654321"
}
```

 - Response (201 Created):

```json
{
  "user": {
    "id": "uuid-usuario-123",
    "email": "cliente@example.com",
    "name": "Juan Perez",
    "phone": "+51987654321"
  },
  "token": "eyJhbGci...",
  "expiresIn": 3600
}
```

 - Errores comunes:
   - 400 Bad Request — datos faltantes o formato inválido
   - 409 Conflict — email ya registrado

Ejemplo curl:

```bash
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@example.com","password":"Password123!","name":"Juan Perez","phone":"+51987654321"}'
```

2) POST /auth/login

 - Descripción: autentica al usuario y devuelve token JWT.
 - Headers: `Content-Type: application/json`
 - Request body:

```json
{
  "email": "cliente@example.com",
  "password": "Password123!"
}
```

 - Response (200 OK):

```json
{
  "user": {
    "id": "uuid-usuario-123",
    "email": "cliente@example.com",
    "name": "Juan Perez"
  },
  "token": "eyJhbGci...",
  "expiresIn": 3600
}
```

 - Errores:
   - 401 Unauthorized — credenciales inválidas

Ejemplo curl:

```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@example.com","password":"Password123!"}'
```

3) GET /menu

 - Descripción: devuelve la lista completa de productos disponibles.
 - Headers: opcional `Authorization` (si hay filtros por usuario), `Accept: application/json`.
 - Request params: ninguno
 - Response (200 OK):

```json
[
  {
    "id": "prod-1",
    "name": "Hamburguesa Clasica",
    "description": "Carne, queso, lechuga, tomate",
    "price": 12.5,
    "category": "hamburguesas",
    "available": true,
    "imageUrl": "https://.../hamburguesa.jpg"
  },
  {
    "id": "prod-2",
    "name": "Papas Fritas",
    "description": "Papas crocantes",
    "price": 4.0,
    "category": "acompanamientos",
    "available": true
  }
]
```

 - Errores:
   - 500 Internal Server Error — problema en base de datos

Ejemplo curl:

```bash
curl "$BASE_URL/menu"
```

4) GET /menu/{category}

 - Descripción: devuelve los productos filtrados por categoría.
 - Path param: `category` (string)
 - Response (200 OK): arreglo de productos (mismo esquema que `/menu`).

Ejemplo curl:

```bash
curl "$BASE_URL/menu/hamburguesas"
```

5) POST /cart/add

 - Descripción: agrega un ítem al carrito del usuario autenticado.
 - Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
 - Request body:

```json
{
  "productId": "prod-1",
  "quantity": 2,
  "notes": "Sin cebolla"
}
```

 - Response (200 OK): cart actualizado

```json
{
  "cartId": "cart-123",
  "items": [
    {
      "itemId": "item-1",
      "productId": "prod-1",
      "name": "Hamburguesa Clasica",
      "quantity": 2,
      "price": 12.5,
      "notes": "Sin cebolla",
      "subtotal": 25.0
    }
  ],
  "total": 25.0
}
```

 - Errores:
   - 401 Unauthorized — token inválido/ausente
   - 400 Bad Request — productId faltante o cantidad inválida

Ejemplo curl:

```bash
curl -X POST "$BASE_URL/cart/add" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-1","quantity":2,"notes":"Sin cebolla"}'
```

6) GET /cart

 - Descripción: obtiene el carrito del usuario autenticado.
 - Headers: `Authorization: Bearer <token>`
 - Response (200 OK): (mismo esquema que el response de añadir)

Ejemplo curl:

```bash
curl -H "$AUTH_HEADER" "$BASE_URL/cart"
```

7) PUT /cart/update

 - Descripción: actualiza la cantidad o notas de un item del carrito.
 - Headers: `Authorization`, `Content-Type: application/json`
 - Request body:

```json
{
  "itemId": "item-1",
  "quantity": 3,
  "notes": "Con extra queso"
}
```

 - Response (200 OK): cart actualizado (mismo esquema que antes)

Ejemplo curl:

```bash
curl -X PUT "$BASE_URL/cart/update" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"itemId":"item-1","quantity":3,"notes":"Con extra queso"}'
```

8) DELETE /cart/remove/{itemId}

 - Descripción: elimina un item del carrito.
 - Headers: `Authorization`
 - Path param: `itemId`
 - Response (200 OK): cart actualizado o 204 No Content

Ejemplo curl:

```bash
curl -X DELETE -H "$AUTH_HEADER" "$BASE_URL/cart/remove/item-1"
```

9) POST /cart/clear

 - Descripción: limpia todo el carrito del usuario.
 - Headers: `Authorization`
 - Request body: ninguno
 - Response (200 OK): `{ "cartId": "cart-123", "items": [], "total": 0 }`

Ejemplo curl:

```bash
curl -X POST -H "$AUTH_HEADER" "$BASE_URL/cart/clear"
```

10) POST /orders

 - Descripción: crea una nueva orden a partir del contenido del carrito.
 - Headers: `Authorization`, `Content-Type: application/json`
 - Request body (opcionalmente se puede incluir dirección/pago):

```json
{
  "shippingAddress": {
    "street": "Av. Siempre Viva 123",
    "city": "Lima",
    "zip": "15001"
  },
  "paymentMethod": "cash",
  "notes": "Dejar en la puerta"
}
```

 - Response (201 Created):

```json
{
  "orderId": "order-789",
  "status": "pending",
  "total": 37.5,
  "estimatedDeliveryMinutes": 45
}
```

 - Errores:
   - 400 Bad Request — carrito vacío o datos inválidos
   - 401 Unauthorized

Ejemplo curl:

```bash
curl -X POST "$BASE_URL/orders" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress":{"street":"Av. Siempre Viva 123","city":"Lima","zip":"15001"},"paymentMethod":"cash"}'
```

11) GET /orders/{orderId}

 - Descripción: obtiene el detalle y estado de una orden por su id.
 - Headers: `Authorization`
 - Path param: `orderId`
 - Response (200 OK):

```json
{
  "orderId": "order-789",
  "userId": "uuid-usuario-123",
  "items": [
    { "productId": "prod-1", "name": "Hamburguesa Clasica", "quantity": 2, "price": 12.5 }
  ],
  "total": 25.0,
  "status": "preparing",
  "createdAt": "2025-11-21T10:15:00Z"
}
```

Ejemplo curl:

```bash
curl -H "$AUTH_HEADER" "$BASE_URL/orders/order-789"
```

12) GET /users/orders

 - Descripción: lista las órdenes del usuario autenticado.
 - Headers: `Authorization`
 - Response (200 OK): arreglo de órdenes (mismo esquema que GET /orders/{orderId}).

Ejemplo curl:

```bash
curl -H "$AUTH_HEADER" "$BASE_URL/users/orders"
```

Funciones mapeadas
------------------

Estas son las funciones (nombres Lambda) que exponen los endpoints:

- `authorizer`: fridays-ecommerce-service-dev-authorizer
- `register`: fridays-ecommerce-service-dev-register
- `login`: fridays-ecommerce-service-dev-login
- `listProducts`: fridays-ecommerce-service-dev-listProducts
- `getProductsByCategory`: fridays-ecommerce-service-dev-getProductsByCategory
- `addToCart`: fridays-ecommerce-service-dev-addToCart
- `getCart`: fridays-ecommerce-service-dev-getCart
- `updateCart`: fridays-ecommerce-service-dev-updateCart
- `removeFromCart`: fridays-ecommerce-service-dev-removeFromCart
- `clearCart`: fridays-ecommerce-service-dev-clearCart
- `createOrder`: fridays-ecommerce-service-dev-createOrder
- `getOrder`: fridays-ecommerce-service-dev-getOrder
- `getMyOrders`: fridays-ecommerce-service-dev-getMyOrders

Testing rápido
--------------

- Usa Postman o curl con el `BASE_URL` y añade el header `Authorization` después de obtener un token con `/auth/login`.
- Para probar flujos completos: registrar -> login -> addToCart -> GET cart -> POST orders -> GET order.

Notas
-----
- Ajusta los ejemplos al esquema real de tu API si los nombres de campos difieren.
- Si utilizas un authorizer personalizado, asegúrate de enviar el token en el header `Authorization`.

Si quieres, puedo:
- Generar esquemas JSON Schema para cada request/response (útil para validación y tests).
- Crear colecciones Postman / Insomnia con ejemplos listos para importar.
