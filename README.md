# Student Enrollment & Course Management System

**Live demo:** https://student-enrollment-system-lime.vercel.app (deployed on Vercel with MongoDB Atlas; shared demo data, please keep it tidy)

A small server-rendered web application for managing students, courses, and the enrollments that link them. It is built with Node.js, Express and EJS on top of MongoDB (via Mongoose), and provides a plain HTML interface for adding, editing, deleting and listing records. There is no client-side framework: every page is rendered on the server and every action is a standard HTML form submission.

## Features

- **Students** - add a student (student ID, name, email, age), edit an existing one, delete with a browser confirmation prompt, and view all students in a table.
- **Courses** - add a course (title, code, credit hours), edit, delete with confirmation, and view all courses.
- **Enrollments** - pick a student and a course from dropdowns to enroll. Each enrollment stores both ObjectId references and a snapshot of the student name and course title. Existing enrollments are listed on the same page.
- **All Records** - a single read-only page showing every student, course and enrollment.
- **Home** - a landing page with navigation to the four sections above.

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Web framework | Express 4 |
| Templating | EJS 3 |
| Database | MongoDB (Atlas or local) via Mongoose 7 |
| Configuration | dotenv (`.env` file) |
| Styling | Plain CSS (`public/style.css`) |

## Project structure

```
.
├── server.js            # Express app, MongoDB connection and all routes
├── models/
│   ├── Student.js       # student_id, name, email, age
│   ├── Course.js        # title, code, creditHours
│   └── Enrollment.js    # studentId, studentName, courseId, courseTitle
├── views/
│   ├── home.ejs         # landing page with navigation
│   ├── addStudent.ejs   # add form + student table with edit/delete actions
│   ├── editStudent.ejs
│   ├── addCourse.ejs    # add form + course table with edit/delete actions
│   ├── editCourse.ejs
│   ├── enroll.ejs       # enroll form + enrollment table
│   └── list.ejs         # all students, courses and enrollments
├── public/
│   └── style.css
├── .env.example         # environment variable template
├── .gitignore
├── package.json
└── package-lock.json
```

## Getting started

### Prerequisites

- Node.js 18 or newer (a current LTS release is recommended) and npm
- A MongoDB database: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or a local MongoDB instance

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file from the template (`cp` works in both bash and PowerShell):

   ```bash
   cp .env.example .env
   ```

3. Open `.env` and set `MONGODB_URI` to your connection string, for example `mongodb+srv://<user>:<password>@<cluster>/<db>` for Atlas or `mongodb://localhost:27017/student-course-app` for a local server. `PORT` is optional and defaults to `3000`.

4. Start the server:

   ```bash
   npm start
   ```

5. Open http://localhost:3000 (or whichever `PORT` you configured). The console prints `MongoDB Atlas Connected` once the database connection succeeds.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string. The server exits at startup with an error if it is not set. Keep the real value out of version control; `.env` is git-ignored. |
| `PORT` | no | Port the HTTP server listens on. Defaults to `3000`. |

## Routes

All routes are defined in `server.js`. Forms submit with `POST` and redirect back to the relevant page.

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Home page with navigation links |
| GET | `/add-student` | Add-student form plus a table of all students |
| POST | `/add-student` | Create a student from the form body, then redirect to `/add-student` |
| GET | `/edit-student/:id` | Edit form for one student (redirects to `/add-student` if not found) |
| POST | `/edit-student/:id` | Update a student, then redirect to `/add-student` |
| POST | `/delete-student/:id` | Delete a student, then redirect to `/add-student` |
| GET | `/add-course` | Add-course form plus a table of all courses |
| POST | `/add-course` | Create a course, then redirect to `/add-course` |
| GET | `/edit-course/:id` | Edit form for one course (redirects to `/add-course` if not found) |
| POST | `/edit-course/:id` | Update a course, then redirect to `/add-course` |
| POST | `/delete-course/:id` | Delete a course, then redirect to `/add-course` |
| GET | `/enroll` | Enrollment form (student and course dropdowns) plus the enrollment table |
| POST | `/enroll` | Create an enrollment for the selected student and course, then redirect to `/enroll` (responds `404` if either record is missing) |
| GET | `/list` | Read-only page listing all students, courses and enrollments |

Static files in `public/` are served from the site root (for example `/style.css`).

## Data models

- **Student** - `student_id` (String), `name` (String), `email` (String), `age` (Number)
- **Course** - `title` (String), `code` (String), `creditHours` (Number)
- **Enrollment** - `studentId` (ObjectId, ref `Student`), `studentName` (String), `courseId` (ObjectId, ref `Course`), `courseTitle` (String); all four fields are required

## Limitations / next steps

- **No authentication or authorization** - every page and action is open to anyone who can reach the server.
- **No server-side validation** - the only validation is the HTML `required` attribute; `req.body` is passed straight to Mongoose. Student IDs and course codes are not checked for uniqueness, and a student can be enrolled in the same course more than once.
- **Plain-text error responses** - a central error handler catches errors thrown by `async` route handlers (a malformed `:id` returns `404 Record not found`, anything else `500 Something went wrong`), but these are plain-text responses rather than rendered error pages.
- **Denormalized enrollments** - `studentName` and `courseTitle` are copied into each enrollment when it is created, so renaming a student or course does not update existing enrollments, and deleting a student or course leaves its enrollments behind. There is also no way to remove an enrollment from the UI.
- **No tests, linting or CI** - a test suite (for example Jest + Supertest with an in-memory MongoDB) would be a natural next step.
- **No custom 404 page, pagination, search or sorting** - unknown URLs get a plain-text `404 Page not found` response, and every list page loads the whole collection.
