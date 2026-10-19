require("dotenv").config();
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const Student = require("./models/Student");
const Course = require("./models/Course");
const Enrollment = require("./models/Enrollment");

const app = express();

// Express 4 ignores rejected promises from async handlers; forward them to next()
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* =======================
   App Configuration
======================= */
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/* =======================
   MongoDB Connection
======================= */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

/* =======================
   Health check (no database access)
======================= */
app.get("/healthz", (req, res) => res.json({ status: "ok" }));

/* =======================
   Home
======================= */
app.get("/", wrap(async (req, res) => {
  const students = await Student.find();
  const courses = await Course.find();
  res.render("home", { students, courses });
}));

/* =======================
   Students
======================= */
app.get("/add-student", wrap(async (req, res) => {
  const students = await Student.find();
  res.render("addStudent", { students });
}));

app.post("/add-student", wrap(async (req, res) => {
  await Student.create(req.body);
  res.redirect("/add-student");
}));
// Render edit form for a specific student
app.get("/edit-student/:id", wrap(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.redirect("/add-student"); // fallback
  res.render("editStudent", { student });
}));
// Handle form submission to update student
app.post("/edit-student/:id", wrap(async (req, res) => {
  await Student.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/add-student");
}));
app.post("/delete-student/:id", wrap(async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect("/add-student");
  } catch (err) {
    console.error(err);
    res.redirect("/add-student");
  }
}));


/* =======================
   Courses
======================= */
app.get("/add-course", wrap(async (req, res) => {
  const courses = await Course.find();
  res.render("addCourse", { courses });
}));

app.post("/add-course", wrap(async (req, res) => {
  await Course.create(req.body);
  res.redirect("/add-course");
}));
// Render edit form for a specific course
app.get("/edit-course/:id", wrap(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.redirect("/add-course");
  res.render("editCourse", { course });
}));

// Handle update form submission
app.post("/edit-course/:id", wrap(async (req, res) => {
  await Course.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/add-course");
}));

// Delete course
app.post("/delete-course/:id", wrap(async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.redirect("/add-course");
}));

/* =======================
   Enroll Student
======================= */
app.get("/enroll", wrap(async (req, res) => {
  const students = await Student.find();
  const courses = await Course.find();
  const enrollments = await Enrollment.find();
  res.render("enroll", { students, courses, enrollments });
}));

app.post("/enroll", wrap(async (req, res) => {
  const { studentId, courseId } = req.body;

  const student = await Student.findById(studentId);
  const course = await Course.findById(courseId);

  if (!student || !course) {
    return res.status(404).send("Student or course not found");
  }

  await Enrollment.create({
    studentId: student._id,
    studentName: student.name,
    courseId: course._id,
    courseTitle: course.title
  });

  res.redirect("/enroll");
}));

/* =======================
   List Enrollments
======================= */
app.get("/list", wrap(async (req, res) => {
  const students = await Student.find();
  const courses = await Course.find();
  const enrollments = await Enrollment.find();

  res.render("list", { students, courses, enrollments });
}));


/* =======================
   404 + Error Handling
======================= */
app.use((req, res) => res.status(404).send("Page not found"));

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.name === "CastError" ? 404 : 500)
    .send(err.name === "CastError" ? "Record not found" : "Something went wrong");
});

/* =======================
   Server Start
======================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
