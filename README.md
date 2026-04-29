# MedicAPPP

Medical appointment platform — Spring Boot 3.2.5 + PostgreSQL 16 backend, React (Vite) frontend planned.

## Prerequisites

| Tool | Version |
|---|---|
| JDK | 21 |
| Maven | 3.9+ |
| Docker | any recent |

## Quick start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Run the API (Flyway applies migrations automatically)
cd backend
mvn spring-boot:run
```

API listens on `http://localhost:8080`.  
PostgreSQL: `localhost:5432`, database/user/password all `medicapp`.

---

## Authentication

All protected routes require `Authorization: Bearer <accessToken>`.

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `username`, `email`, `password`, `dateNaissance`, `telephone` | Register patient — creates user, patient profile, and dossier |
| POST | `/api/auth/login` | `username`, `password` | Login |
| POST | `/api/auth/refresh` | `refreshToken` | Issue new token pair |

Response: `{ accessToken, refreshToken, expiresInSeconds, role }`

Tokens: access = 15 min, refresh = 14 days.

---

## Roles

| Role | Created by |
|---|---|
| `PATIENT` | Self-register via `/api/auth/register` |
| `MEDECIN` | Admin via `POST /api/admin/medecins` |
| `ADMIN` | Seeded directly in DB |

---

## Endpoints

### Doctors — `/api/medecins`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/medecins` | any | List all doctors |
| GET | `/api/medecins/{id}` | any | Get doctor by id |
| GET | `/api/medecins/me` | MEDECIN | Own profile |
| GET | `/api/medecins/rendez-vous` | MEDECIN | Own appointments |

### Patient — `/api/patient`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/patient/me` | PATIENT | Own profile |
| GET | `/api/patient/rendez-vous` | PATIENT | Own appointments |

### Availability — `/api/disponibilites`

| Method | Path | Role | Body | Description |
|---|---|---|---|---|
| GET | `/api/disponibilites/medecin/{medecinId}` | any | — | List doctor's slots |
| POST | `/api/disponibilites` | MEDECIN | `jour`(1–7), `heureDebut`, `heureFin` | Add availability slot |
| DELETE | `/api/disponibilites/{id}` | MEDECIN | — | Remove own slot |

`jour`: 1 = Monday … 7 = Sunday (ISO).

### Appointments — `/api/rendez-vous`

| Method | Path | Role | Body | Description |
|---|---|---|---|---|
| POST | `/api/rendez-vous` | PATIENT | `medecinId`, `date`, `heureDebut`, `heureFin` | Book appointment |
| PATCH | `/api/rendez-vous/{id}/statut` | MEDECIN | `statut` | Update status |
| DELETE | `/api/rendez-vous/{id}` | PATIENT | — | Cancel appointment |

`statut` values: `EN_ATTENTE` `CONFIRME` `ANNULE` `TERMINE`

Booking rules enforced:
- The slot must fall within a matching doctor `disponibilite` (same weekday, time range covered).
- No overlapping appointments per doctor — guaranteed by a PostgreSQL `EXCLUDE` constraint (`btree_gist`).

### Medical dossier — `/api/dossier`

| Method | Path | Role | Body | Description |
|---|---|---|---|---|
| GET | `/api/dossier/me` | PATIENT | — | Own dossier + all notes |
| POST | `/api/dossier/{dossierId}/notes` | MEDECIN | `contenu` | Add note to patient dossier |

### Admin — `/api/admin`

| Method | Path | Role | Body | Description |
|---|---|---|---|---|
| GET | `/api/admin/users` | ADMIN | — | List all users |
| POST | `/api/admin/medecins` | ADMIN | `username`, `email`, `password`, `specialite`, `numeroOrdre` | Create doctor account |
| PATCH | `/api/admin/users/{id}/disable` | ADMIN | — | Disable user account |

---

## Error responses

All errors return `{ "error": "<message>" }`.

| Status | When |
|---|---|
| 400 | Validation failure — includes field name |
| 401 | Missing/invalid/expired token, bad credentials |
| 403 | Correct role but wrong ownership (e.g. cancelling someone else's appointment) |
| 404 | Resource not found |
| 409 | Duplicate (username, email, numero_ordre) or overlapping appointment |
| 422 | Booking outside doctor availability |

---

## Configuration

| Key | Location | Notes |
|---|---|---|
| DB URL / credentials | `backend/src/main/resources/application.yml` | Change for production |
| JWT secret | `medicapp.jwt.secret` in `application.yml` | Must be ≥ 32 bytes; use env var in prod |
| JWT TTLs | `access-token-minutes`, `refresh-token-days` | Defaults: 15 min / 14 days |

CORS is open to `http://localhost:5173` (Vite dev server).

---

## Project structure

```
backend/src/main/java/com/medicapp/
├── config/          SecurityConfig (JWT filter, CORS, RBAC rules)
├── controller/      AuthController, MedecinController, PatientController,
│                    DisponibiliteController, RendezVousController,
│                    DossierController, AdminController
├── dto/
│   ├── auth/        LoginRequest, RegisterRequest, RefreshRequest, TokenResponse
│   ├── medecin/     MedecinResponse, CreateMedecinRequest
│   ├── patient/     PatientResponse
│   ├── disponibilite/ DisponibiliteRequest, DisponibiliteResponse
│   ├── rendezvous/  BookingRequest, RendezVousResponse, UpdateStatutRequest
│   ├── dossier/     DossierResponse, NoteResponse, AddNoteRequest
│   └── admin/       UserResponse
├── entity/          User, Patient, Medecin, Administrateur, DossierPatient,
│                    Disponibilite, RendezVous, NoteMedicale,
│                    UserRole, RendezVousStatut (+ converters)
├── exception/       ApiExceptionHandler (global)
├── repository/      one interface per entity
├── security/        JwtService, JwtAuthFilter, JwtProperties, CustomUserDetailsService
└── service/         AuthService, MedecinService, PatientService,
                     DisponibiliteService, RendezVousService,
                     DossierService, AdminService
```

Database migrations: `backend/src/main/resources/db/migration/V1__init_schema.sql`
