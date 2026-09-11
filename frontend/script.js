// =============================
// Student Management Dashboard
// FastAPI + Render + Supabase
// =============================

const API = "https://endpoint-python-1.onrender.com";

let students = [];
let filteredStudents = [];
let editId = null;

// DOM Elements
const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const courseInput = document.getElementById("course");
const marksInput = document.getElementById("marks");
const submitBtn = document.getElementById("submitBtn");

const tableBody = document.getElementById("studentTable");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const sortMarks = document.getElementById("sortMarks");

// =============================
// Page Load
// =============================
window.onload = () => {
    loadStudents();
};

// =============================
// Toast
// =============================
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

// =============================
// Loader
// =============================
function showLoader() {
    loading.classList.remove("hidden");
}

function hideLoader() {
    loading.classList.add("hidden");
}

// =============================
// GET Students
// =============================
async function loadStudents() {

    showLoader();

    try {

        const response = await fetch(`${API}/students`);

        if (!response.ok) throw new Error("Server Error");

        students = await response.json();

        filteredStudents = [...students];

        populateCourseFilter();

        calculateStats();

        renderTable(filteredStudents);

    } catch (error) {

        showToast("Backend Offline");

    } finally {

        hideLoader();
    }
}

// =============================
// Render Table
// =============================
function renderTable(data) {

    tableBody.innerHTML = "";

    if (data.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    data.forEach(student => {

        let status = "";
        let color = "";

        if (student.marks >= 90) {
            status = "Excellent";
            color = "#22c55e";
        } else if (student.marks >= 75) {
            status = "Good";
            color = "#2563eb";
        } else if (student.marks >= 50) {
            status = "Average";
            color = "#f59e0b";
        } else {
            status = "Needs Improvement";
            color = "#ef4444";
        }

        tableBody.innerHTML += `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>${student.marks}</td>
            <td>
                <span style="
                    background:${color};
                    padding:6px 12px;
                    border-radius:20px;
                    color:white;
                    font-size:13px;">
                    ${status}
                </span>
            </td>
            <td>
                <button class="action-btn edit"
                    onclick="editStudent(${student.id})">
                    Edit
                </button>

                <button class="action-btn delete"
                    onclick="deleteStudent(${student.id})">
                    Delete
                </button>
            </td>
        </tr>`;
    });
}

// =============================
// Statistics
// =============================
function calculateStats() {

    document.getElementById("totalStudents").innerText = students.length;

    if (students.length === 0) {

        document.getElementById("avgMarks").innerText = 0;
        document.getElementById("highestMarks").innerText = 0;
        document.getElementById("lowestMarks").innerText = 0;
        return;
    }

    const marks = students.map(s => s.marks);

    const avg = (
        marks.reduce((a, b) => a + b, 0) / marks.length
    ).toFixed(1);

    document.getElementById("avgMarks").innerText = avg;
    document.getElementById("highestMarks").innerText = Math.max(...marks);
    document.getElementById("lowestMarks").innerText = Math.min(...marks);
}

// =============================
// Validation
// =============================
function validateForm() {

    let valid = true;

    document.getElementById("nameError").innerText = "";
    document.getElementById("courseError").innerText = "";
    document.getElementById("marksError").innerText = "";

    if (!nameInput.value.trim()) {
        document.getElementById("nameError").innerText = "Name required";
        valid = false;
    }

    if (!courseInput.value.trim()) {
        document.getElementById("courseError").innerText = "Course required";
        valid = false;
    }

    const marks = Number(marksInput.value);

    if (marks < 0 || marks > 100 || isNaN(marks)) {
        document.getElementById("marksError").innerText = "Marks 0-100";
        valid = false;
    }

    return valid;
}

// =============================
// Add / Update
// =============================
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    submitBtn.disabled = true;
    submitBtn.innerText = "Saving...";

    const data = {
        name: nameInput.value.trim(),
        course: courseInput.value.trim(),
        marks: Number(marksInput.value)
    };

    try {

        if (editId === null) {

            await fetch(`${API}/students`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            showToast("Student Added");

        } else {

            await fetch(`${API}/students/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            showToast("Student Updated");
        }

        clearForm();
        loadStudents();

    } catch {

        showToast("Operation Failed");

    } finally {

        submitBtn.disabled = false;
        submitBtn.innerText = editId === null
            ? "Add Student"
            : "Update Student";
    }
});

// =============================
// Edit
// =============================
function editStudent(id) {

    const student = students.find(s => s.id === id);

    if (!student) return;

    editId = id;

    nameInput.value = student.name;
    courseInput.value = student.course;
    marksInput.value = student.marks;

    submitBtn.innerText = "Update Student";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =============================
// Delete
// =============================
async function deleteStudent(id) {

    if (!confirm("Delete this student?")) return;

    try {

        await fetch(`${API}/students/${id}`, {
            method: "DELETE"
        });

        showToast("Student Deleted");

        loadStudents();

    } catch {

        showToast("Delete Failed");
    }
}

// =============================
// Clear Form
// =============================
function clearForm() {

    form.reset();

    editId = null;

    submitBtn.innerText = "Add Student";

    document.getElementById("nameError").innerText = "";
    document.getElementById("courseError").innerText = "";
    document.getElementById("marksError").innerText = "";
}

// =============================
// Course Dropdown
// =============================
function populateCourseFilter() {

    const courses = [...new Set(students.map(s => s.course))];

    courseFilter.innerHTML =
        `<option value="">All Courses</option>`;

    courses.forEach(course => {

        courseFilter.innerHTML += `
            <option value="${course}">
                ${course.toUpperCase()}
            </option>`;
    });
}

// =============================
// Search + Filter + Sort
// =============================
function applyFilters() {

    const search = searchInput.value.toLowerCase();

    const course = courseFilter.value;

    filteredStudents = students.filter(student => {

        const matchName =
            student.name.toLowerCase().includes(search);

        const matchCourse =
            course === "" || student.course === course;

        return matchName && matchCourse;
    });

    if (sortMarks.value === "asc") {
        filteredStudents.sort((a, b) => a.marks - b.marks);
    }

    if (sortMarks.value === "desc") {
        filteredStudents.sort((a, b) => b.marks - a.marks);
    }

    renderTable(filteredStudents);
}