# Ejemplos de request/response

Este archivo contiene ejemplos de payloads (JSON) para integrar rápidamente el frontend con el backend. Los campos usan la convención en español definida en las interfaces (`correo_electronico`, `contraseña`, `sede_id`, etc.).

---

## 1) POST /auth/register

Request (ejemplo):

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "celular": "987654321",
  "correo_electronico": "juan.perez@example.com",
  "contraseña": "MiPassSegura123",
  "rol": "USUARIO"
}
```

Response (ejemplo exitoso):

```json
{
  "mensaje": "Usuario creado correctamente",
  "token": "eyJhbGciOiJI...", 
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "correo_electronico": "juan.perez@example.com",
    "rol": "USUARIO",
    "nombre": "Juan",
    "apellido": "Pérez"
  }
}
```

Notas:
- El `token` se debe enviar en futuras peticiones en la cabecera `Authorization: Bearer <token>`.

---

## 2) POST /orders

Request (ejemplo): crear un pedido desde un carrito

```json
{
  "order_number": "ORD-20251121-001",
  "customer_name": "María López",
  "customer_phone": "912345678",
  "customer_address": "Av. Principal 123, Miraflores",
  "order_type": "delivery",
  "sede_id": "sede-lima-centro",
  "items": [
    { "menu_item_id": "m-001", "name": "Hamburguesa clásica", "quantity": 2, "price": 18.5 },
    { "menu_item_id": "m-010", "name": "Papas fritas", "quantity": 1, "price": 6.0 }
  ],
  "total": 43.0,
  "notes": "Sin cebolla, por favor"
}
```

Response (ejemplo exitoso):

```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1234567890ab",
  "order_number": "ORD-20251121-001",
  "status": "pending",
  "created_at": "2025-11-21T12:34:56Z"
}
```

Notas:
- `status` seguirá el enum `OrderStatus` (`pending`, `packaging`, `ready`, `on_the_way`, `delivered`, `cancelled`).
- Para actualizar estado o asignar repartidor usar `PATCH /orders/:id` con body apropiado (por ejemplo `{ "status": "on_the_way", "assigned_driver_id": "driver-123" }`).

---

Si deseas, puedo añadir ejemplos para `GET /orders` (respuesta paginada) y para endpoints del `menu` o `users`.
