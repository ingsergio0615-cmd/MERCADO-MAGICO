# Security Specification - Mercado de Fracciones

## Data Invariants
- Un usuario solo puede acceder y modificar su propio documento de progreso (`/users/{userId}`).
- El campo `name` no puede exceder los 50 caracteres.
- `completedLevels` debe ser una lista.
- `levelStars` debe ser un mapa.

## The "Dirty Dozen" Payloads
1. **Identidad**: Intentar leer el progreso de otro usuario (`/users/someone_else`).
2. **Identidad**: Intentar crear/actualizar el progreso con un `userId` que no coincide con el `auth.uid`.
3. **Integridad**: Intentar guardar un nombre de 1MB.
4. **Integridad**: Intentar guardar `completedLevels` como un string en lugar de lista.
5. **Estado**: Intentar inyectar campos fantasma (`isVerified: true`).
6. **Poisoning**: Intentar usar un ID de proyecto gigante (aunque aquí es solo userId).
7. **PII**: Intentar leer correos electrónicos si se agregaran (aquí no hay).
8. **Query Scraping**: Intentar listar todos los usuarios.
9. **Admin Spoofing**: Intentar setearse como admin (no hay rol admin en este app).
10. **Resource Exhaustion**: Intentar mandar arrays gigantes en `completedLevels`.
11. **Type Mismatch**: Mandar un numero donde se espera un mapa en `levelStars`.
12. **Missing Fields**: Crear un documento sin el campo obligatorio `name`.

## Test Cases (Conceptual)
- `GET /users/another_uid` -> DENIED
- `CREATE /users/my_uid` with valid data -> ALLOWED
- `UPDATE /users/my_uid` adding `admin: true` -> DENIED (via strict schema)
