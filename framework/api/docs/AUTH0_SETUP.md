# Auth0 setup for Synapse Framework API

The API uses Auth0 for JWT authentication and **RBAC** (Role-Based Access Control) via **permissions** in the access token. Configure the following in your Auth0 tenant.

## 1. API already created

You created an API with identifier:

- **Identifier (Audience):** `https://api.synapse-framework.com`

Use this value as `AUTH0_AUDIENCE` in your `.env`.

## 2. Add permissions to the API

In Auth0 Dashboard → **Applications** → **APIs** → select your API (e.g. "Synapse Framework API"):

1. Open the **Permissions** tab.
2. Add these **Permission (Scope)** values exactly (they are validated by the backend):

| Permission        | Description                          |
|-------------------|--------------------------------------|
| `read:frameworks` | List frameworks and get active one  |
| `create:frameworks` | Create a new framework version    |
| `update:frameworks` | Update an existing framework      |
| `delete:frameworks` | Delete a framework version        |
| `activate:frameworks` | Set a framework as active        |

3. Save.

## 3. Enable RBAC and add roles

1. In the same API, open **Settings**.
2. Enable **RBAC** (Role-Based Access Control).
3. Enable **Add Permissions in the Access Token** (so the token includes the `permissions` array).
4. Save.

Then create **Roles** and assign permissions. Names are tailored for HR staff using the wellbeing framework:

- **Framework Viewer**  
  - Permissions: `read:frameworks`  
  - Use for: HR staff who only need to view or reference the framework (e.g. for audits, reporting, or policy reference). Read-only.

- **Framework Publisher**  
  - Permissions: `read:frameworks`, `create:frameworks`  
  - Use for: HR staff who publish new framework *iterations* (new versions). They can view and submit a full new version; they cannot edit or delete existing versions.

- **Framework Administrator**  
  - Permissions: `read:frameworks`, `create:frameworks`, `update:frameworks`, `delete:frameworks`, `activate:frameworks`  
  - Use for: HR staff with full control—edit existing frameworks, delete versions, and set which version is active.

Create these roles under **User Management** → **Roles** → **Create Role**, then in each role assign the API and the permissions above.

## 4. Assign roles to users

In **User Management** → **Users** → select a user → **Role** tab → **Assign Roles** and assign **Framework Viewer**, **Framework Publisher**, or **Framework Administrator** as needed.

## 5. Login endpoint (email + password)

The API exposes `POST /api/v1/auth/login` with body `{ "email": "...", "password": "..." }`. It uses Auth0’s **Resource Owner Password** grant. You must:

**Fix "Authorization server not configured with default connection":** Go to **Tenant Settings** (click your tenant name top-left) → **Default Directory** → set to `Username-Password-Authentication` → Save. Also: **Applications** → [Your app] → **Connections** → turn **ON** "Username-Password-Authentication".

1. **Use an Auth0 Application** that has this grant enabled: **Applications** → select the application (e.g. your M2M or a Regular Web App) → **Settings** → **Advanced Settings** → **Grant Types** → enable **Password** → Save.
2. **Create users in Auth0** (no sign-up endpoint): **User Management** → **Users** → **Create User** (email + password), then assign a role as in section 4.
3. **Set credentials in `.env`** for that application: `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` (from the application’s **Settings** → **Basic Information**).

If `AUTH0_CLIENT_ID` or `AUTH0_CLIENT_SECRET` is missing, the login endpoint will return 401 with a “not configured” message.

## 6. Environment variables

In the API project `.env`:

```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.synapse-framework.com
AUTH0_CLIENT_ID=your-app-client-id
AUTH0_CLIENT_SECRET=your-app-client-secret
```

- **AUTH0_DOMAIN:** Your Auth0 tenant domain (e.g. `synapse-framework.auth0.com`), without `https://`.
- **AUTH0_AUDIENCE:** Must match the API identifier you set in Auth0 (`https://api.synapse-framework.com`).
- **AUTH0_CLIENT_ID** / **AUTH0_CLIENT_SECRET:** Required for the login endpoint; use an application that has the **Password** grant enabled.
- **AUTH0_CONNECTION** (optional): Auth0 connection for password grant; defaults to `Username-Password-Authentication`. Set this if you use a different database connection name.

## 7. Calling the API

Clients must send a valid **access token** in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

The token must be issued for your Auth0 API (audience `https://api.synapse-framework.com`) and will contain a `permissions` array. Each endpoint requires at least one of the permissions listed in the table above; the backend returns 403 if the token is valid but lacks the required permission.

---

## 8. Testing in Postman: getting a token

The easiest way to get a token for Postman is a **Machine-to-Machine (M2M)** application that uses the Client Credentials grant.

### 8.1 Create an M2M application in Auth0

1. **Applications** → **Applications** → **Create Application**.
2. Name it (e.g. "Postman – Framework API").
3. Choose **Machine to Machine Applications** → **Create**.
4. Select your **API** (e.g. "Synapse Framework API") → **Authorize**.
5. Under **Authorized Permissions**, select the permissions you need for testing (e.g. tick all five for full access) → **Authorize**.
6. Open the new application → **Settings**. Copy **Client ID** and **Client Secret** (you’ll use these in Postman).

### 8.2 Request a token in Postman

1. Create a new request.
2. Method: **POST**.
3. URL: `https://<AUTH0_DOMAIN>/oauth/token`  
   (e.g. `https://synapse-framework.us.auth0.com/oauth/token`).
4. **Body** → **x-www-form-urlencoded** → add:

   | Key          | Value                                      |
   |--------------|--------------------------------------------|
   | `grant_type` | `client_credentials`                       |
   | `client_id`  | your M2M **Client ID**                      |
   | `client_secret` | your M2M **Client Secret**              |
   | `audience`   | `https://api.synapse-framework.com`        |

5. Send the request. The JSON response has an **`access_token`** field.

Alternatively, use the **login** endpoint: `POST /api/v1/auth/login` with body `{ "email": "user@example.com", "password": "..." }` to get an access token (requires `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` and **Password** grant enabled for that app).

### 8.3 Call your API in Postman

1. Create another request to your API (e.g. `GET http://localhost:3001/api/v1/frameworks`).
2. **Authorization** tab → Type: **Bearer Token** → paste the `access_token` from step 7.2.
3. Send the request.

You can repeat step 8.2 (or the login endpoint) whenever the token expires (typically 24 hours). For long sessions, use the same token until you get a 401, then fetch a new one.
