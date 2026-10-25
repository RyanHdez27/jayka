# API Specification - Jayka v1

## Base URL
`/api/v1`

## Common Response Format
### Success
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Reason for failure"]
  }
}
```

## Endpoints

### 1. Authentication
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/auth/login` | Admin login. Returns Bearer Token. | No |
| POST | `/auth/logout` | Revokes current token. | Yes |

### 2. Public Content (Guest Access)
| Method | Endpoint | Description | Response |
| :--- | :--- | :--- | :--- |
| GET | `/services` | List all services for the landing page. | `Array<Service>` |
| GET | `/projects` | List all projects for the gallery. | `Array<Project>` |
| GET | `/posts` | List featured and recent blog posts. | `Array<Post>` |
| GET | `/posts/{id}` | Get detailed content of a post. | `Post` |
| POST | `/leads` | Submit contact form. | `Success Message` |

### 3. Administrative Management (Admin Only)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/admin/leads` | List all received contact requests. | Admin |
| PUT | `/admin/leads/{id}` | Mark lead as contacted/converted. | Admin |
| POST | `/admin/posts` | Create a new blog post. | Admin |
| PUT | `/admin/posts/{id}` | Update existing post. | Admin |
| DELETE| `/admin/posts/{id}` | Soft delete a post. | Admin |
| POST | `/admin/services` | Add a new service. | Admin |
| PUT | `/admin/services/{id}`| Update service details. | Admin |
| DELETE| `/admin/services/{id}`| Delete service. | Admin |
| POST | `/admin/projects` | Add a new project image/label. | Admin |
| PUT | `/admin/projects/{id}` | Update project. | Admin |
| DELETE| `/admin/projects/{id}`| Delete project. | Admin |

## Data Models

### Service
- `id`: UUID
- `title`: String
- `description`: Text
- `icon`: String (SVG path or icon name)
- `image_url`: String

### Project
- `id`: UUID
- `service_id`: UUID (FK)
- `label`: String
- `image_url`: String

### Post
- `id`: UUID
- `category_id`: UUID (FK)
- `author_id`: UUID (FK)
- `title`: String
- `excerpt`: Text
- `content`: Text (Markdown/HTML)
- `image_url`: String
- `published_at`: DateTime
- `read_time`: String
- `is_featured`: Boolean

### Lead
- `id`: UUID
- `name`: String
- `email`: String
- `message`: Text
- `status`: Enum (new, contacted, converted, rejected)
- `created_at`: DateTime
