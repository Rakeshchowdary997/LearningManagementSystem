// Simple in-memory database (objects) to simulate backend
const usersDB = [];
const coursesDB = [];
const quizQuestions = [
  {
    question: "What is 2 + 2?",
    options: ["1", "2", "3", "4"],
    answer: 3,
  },
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Paris", "Rome", "Madrid"],
    answer: 1,
  },
];

let currentUser = null;
let userProgress = {};

// Utility functions
function showSectionForRole(role) {
  // Hide all sections first
  document.getElementById("course-creation").classList.add("hidden");
  document.getElementById("assessments").classList.add("hidden");
  document.getElementById("progress-tracking").classList.add("hidden");

  if (role === "instructor") {
    document.getElementById("course-creation").classList.remove("hidden");
    document.getElementById("progress-tracking").classList.remove("hidden");
  } else if (role === "student") {
    document.getElementById("assessments").classList.remove("hidden");
    document.getElementById("progress-tracking").classList.remove("hidden");
  } else if (role === "admin") {
    // Admin could see all
    document.getElementById("course-creation").classList.remove("hidden");
    document.getElementById("assessments").classList.remove("hidden");
    document.getElementById("progress-tracking").classList.remove("hidden");
  }
}

// User Registration
document.getElementById("registration-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const role = document.getElementById("reg-role").value;

  if (usersDB.find((u) => u.username === username)) {
    alert("Username already exists.");
    return;
  }

  usersDB.push({ username, password, role });
  alert("Registration successful! You can now log in.");
  e.target.reset();
});

// User Login
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  const user = usersDB.find((u) => u.username === username && u.password === password);
  if (!user) {
    alert("Invalid username or password.");
    return;
  }

  currentUser = user;
  document.getElementById("welcome-msg").textContent = `Welcome, ${user.username} (${user.role})!`;

  // Show/hide sections based on role
  showSectionForRole(user.role);

  // Load data relevant to user
  if (user.role === "instructor") {
    loadCourses();
  }

  // Reset login form
  e.target.reset();
});

// Course Creation by Instructor
document.getElementById("course-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== "instructor") {
    alert("Only instructors can create courses.");
    return;
  }

  const title = document.getElementById("course-title").value.trim();
  const content = document.getElementById("course-content").value.trim();

  if (!title || !content) return;

  coursesDB.push({
    id: coursesDB.length + 1,
    title,
    content,
    instructor: currentUser.username,
  });

  alert("Course created!");
  e.target.reset();
  loadCourses();
});

function loadCourses() {
  const courseList = document.getElementById("course-list");
  courseList.innerHTML = "";

  const userCourses = coursesDB.filter((c) => c.instructor === currentUser.username);

  if (userCourses.length === 0) {
    courseList.innerHTML = "<li>No courses created yet.</li>";
    return;
  }

  userCourses.forEach((course) => {
    const li = document.createElement("li");
    li.textContent = `${course.title} - ${course.content.substring(0, 30)}...`;
    courseList.appendChild(li);
  });
}

// Quiz for Students
const quizContainer = document.getElementById("quiz-question-container");
const quizForm = document.getElementById("quiz-form");
const quizResult = document.getElementById("quiz-result");

function loadQuiz() {
  quizContainer.innerHTML = "";
  quizQuestions.forEach((q, i) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");

    const questionText = document.createElement("p");
    questionText.textContent = `${i + 1}. ${q.question}`;
    questionDiv.appendChild(questionText);

    q.options.forEach((option, idx) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${i}`;
      radio.value = idx;
      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      questionDiv.appendChild(label);
      questionDiv.appendChild(document.createElement("br"));
    });

    quizContainer.appendChild(questionDiv);
  });
}

quizForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== "student") {
    alert("Only students can take quizzes.");
    return;
  }

  let score = 0;

  quizQuestions.forEach((q, i) => {
    const answer = quizForm[`q${i}`].value;
    if (parseInt(answer) === q.answer) score++;
  });

  quizResult.textContent = `You scored ${score} out of ${quizQuestions.length}`;

  // Track progress
  if (!userProgress[currentUser.username]) userProgress[currentUser.username] = {};
  userProgress[currentUser.username].quizScore = score;

  updateProgressDisplay();
});

// Progress Tracking for Student & Instructor
function updateProgressDisplay() {
  const display = document.getElementById("progress-display");
  if (!currentUser) {
    display.textContent = "";
    return;
  }

  if (currentUser.role === "student") {
    const progress = userProgress[currentUser.username] || {};
    display.textContent = `Quiz Score: ${progress.quizScore !== undefined ? progress.quizScore : "N/A"}`;
  } else if (currentUser.role === "instructor") {
    // Show number of courses created
    const count = coursesDB.filter((c) => c.instructor === currentUser.username).length;
    display.textContent = `You have created ${count} course(s).`;
  } else if (currentUser.role === "admin") {
    // Admin can see overall summary
    display.textContent = `Total Users: ${usersDB.length}, Total Courses: ${coursesDB.length}`;
  }
}

// When quiz section shows, load quiz
document.getElementById("assessments").addEventListener("transitionend", () => {
  if (!document.getElementById("assessments").classList.contains("hidden")) {
    loadQuiz();
  }
});
