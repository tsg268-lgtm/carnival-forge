const STORAGE_KEY = "carnivalForgeProjects_v01";

let projects = [];
let activeProjectId = null;

// DOM ELEMENTS
let dashboardView;
let workspaceView;
let backToDashboardBtn;

let projectTitleInput;
let projectCategoryInput;
let projectDescriptionInput;
let createProjectBtn;
let projectList;
let importFileInput;

let workspaceProjectTitle;
let workspaceProjectDescription;
let exportProjectBtn;
let deleteProjectBtn;

let notesCount;
let canonCount;
let tasksCount;
let completedTasksCount;
let recommendedStep;

let noteInput;
let addNoteBtn;
let notesList;

let canonNameInput;
let canonTypeInput;
let canonStatusInput;
let canonDescriptionInput;
let addCanonBtn;
let canonList;

let taskInput;
let addTaskBtn;
let tasksList;

function setupElements() {
  dashboardView = document.getElementById("dashboardView");
  workspaceView = document.getElementById("workspaceView");
  backToDashboardBtn = document.getElementById("backToDashboardBtn");

  projectTitleInput = document.getElementById("projectTitleInput");
  projectCategoryInput = document.getElementById("projectCategoryInput");
  projectDescriptionInput = document.getElementById("projectDescriptionInput");
  createProjectBtn = document.getElementById("createProjectBtn");
  projectList = document.getElementById("projectList");
  importFileInput = document.getElementById("importFileInput");

  workspaceProjectTitle = document.getElementById("workspaceProjectTitle");
  workspaceProjectDescription = document.getElementById("workspaceProjectDescription");
  exportProjectBtn = document.getElementById("exportProjectBtn");
  deleteProjectBtn = document.getElementById("deleteProjectBtn");

  notesCount = document.getElementById("notesCount");
  canonCount = document.getElementById("canonCount");
  tasksCount = document.getElementById("tasksCount");
  completedTasksCount = document.getElementById("completedTasksCount");
  recommendedStep = document.getElementById("recommendedStep");

  noteInput = document.getElementById("noteInput");
  addNoteBtn = document.getElementById("addNoteBtn");
  notesList = document.getElementById("notesList");

  canonNameInput = document.getElementById("canonNameInput");
  canonTypeInput = document.getElementById("canonTypeInput");
  canonStatusInput = document.getElementById("canonStatusInput");
  canonDescriptionInput = document.getElementById("canonDescriptionInput");
  addCanonBtn = document.getElementById("addCanonBtn");
  canonList = document.getElementById("canonList");

  taskInput = document.getElementById("taskInput");
  addTaskBtn = document.getElementById("addTaskBtn");
  tasksList = document.getElementById("tasksList");
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getTodayString() {
  return new Date().toISOString();
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function loadProjects() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    projects = [];
    return;
  }

  try {
    projects = JSON.parse(saved);

    if (!Array.isArray(projects)) {
      projects = [];
    }
  } catch (error) {
    console.error("Could not load projects:", error);
    projects = [];
  }
}

function getActiveProject() {
  return projects.find(project => project.id === activeProjectId);
}

function createProject() {
  const title = projectTitleInput.value.trim();
  const category = projectCategoryInput.value.trim();
  const description = projectDescriptionInput.value.trim();

  if (!title) {
    alert("Please enter a project title.");
    return;
  }

  const now = getTodayString();

  const newProject = {
    id: generateId("project"),
    title,
    category: category || "Uncategorized",
    description: description || "No description yet.",
    status: "Active",
    notes: [],
    canon: [],
    tasks: [],
    drafts: [],
    exports: [],
    createdAt: now,
    updatedAt: now
  };

  projects.unshift(newProject);
  saveProjects();

  projectTitleInput.value = "";
  projectCategoryInput.value = "";
  projectDescriptionInput.value = "";

  renderDashboard();
  openProject(newProject.id);
}

function renderDashboard() {
  projectList.innerHTML = "";

  if (projects.length === 0) {
    projectList.innerHTML = `
      <div class="project-card">
        <h3>No projects yet</h3>
        <p>Create your first project to open the Forge.</p>
      </div>
    `;
    return;
  }

  projects.forEach(project => {
    const card = document.createElement("article");
    card.className = "project-card";

    card.innerHTML = `
      <h3>${escapeHTML(project.title)}</h3>
      <p><strong>Category:</strong> ${escapeHTML(project.category || "Uncategorized")}</p>
      <p>${escapeHTML(project.description || "No description yet.")}</p>
      <p class="muted">Updated: ${formatDate(project.updatedAt)}</p>
      <div class="card-actions">
        <button data-open-project="${project.id}">Open Project</button>
      </div>
    `;

    projectList.appendChild(card);
  });

  document.querySelectorAll("[data-open-project]").forEach(button => {
    button.addEventListener("click", () => {
      openProject(button.dataset.openProject);
    });
  });
}

function openProject(projectId) {
  activeProjectId = projectId;

  dashboardView.classList.add("hidden");
  workspaceView.classList.remove("hidden");
  backToDashboardBtn.classList.remove("hidden");

  switchTab("overviewTab");
  renderWorkspace();
}

function showDashboard() {
  activeProjectId = null;

  workspaceView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  backToDashboardBtn.classList.add("hidden");

  renderDashboard();
}

function renderWorkspace() {
  const project = getActiveProject();

  if (!project) {
    showDashboard();
    return;
  }

  workspaceProjectTitle.textContent = project.title;
  workspaceProjectDescription.textContent = project.description;

  renderOverview();
  renderNotes();
  renderCanon();
  renderTasks();
}

function renderOverview() {
  const project = getActiveProject();

  if (!project) return;

  notesCount.textContent = project.notes.length;
  canonCount.textContent = project.canon.length;
  tasksCount.textContent = project.tasks.length;

  const completed = project.tasks.filter(task => task.completed).length;
  completedTasksCount.textContent = completed;

  if (project.notes.length === 0) {
    recommendedStep.textContent = "Add your first project note. Capture the messy idea before polishing anything.";
  } else if (project.canon.length === 0) {
    recommendedStep.textContent = "Add your first canon entry. Start with a character, title, location, or rule that must stay true.";
  } else if (project.tasks.length === 0) {
    recommendedStep.textContent = "Add your first task. Give the project a clear next move.";
  } else {
    const nextTask = project.tasks.find(task => !task.completed);

    recommendedStep.textContent = nextTask
      ? `Next task: ${nextTask.title}`
      : "All current tasks are complete. Add the next milestone.";
  }
}

function addNote() {
  const project = getActiveProject();

  if (!project) return;

  const body = noteInput.value.trim();

  if (!body) {
    alert("Please write a note first.");
    return;
  }

  project.notes.unshift({
    id: generateId("note"),
    body,
    createdAt: getTodayString()
  });

  project.updatedAt = getTodayString();

  noteInput.value = "";
  saveProjects();
  renderWorkspace();
}

function renderNotes() {
  const project = getActiveProject();

  if (!project) return;

  notesList.innerHTML = "";

  if (project.notes.length === 0) {
    notesList.innerHTML = `
      <div class="item-card">
        <p>No notes yet.</p>
      </div>
    `;
    return;
  }

  project.notes.forEach(note => {
    const card = document.createElement("article");
    card.className = "item-card";

    card.innerHTML = `
      <p>${escapeHTML(note.body)}</p>
      <p class="muted">${formatDate(note.createdAt)}</p>
      <div class="card-actions">
        <button class="secondary-btn" data-delete-note="${note.id}">Delete</button>
      </div>
    `;

    notesList.appendChild(card);
  });

  document.querySelectorAll("[data-delete-note]").forEach(button => {
    button.addEventListener("click", () => {
      deleteNote(button.dataset.deleteNote);
    });
  });
}

function deleteNote(noteId) {
  const project = getActiveProject();

  if (!project) return;

  project.notes = project.notes.filter(note => note.id !== noteId);
  project.updatedAt = getTodayString();

  saveProjects();
  renderWorkspace();
}

function addCanon() {
  const project = getActiveProject();

  if (!project) return;

  const name = canonNameInput.value.trim();
  const type = canonTypeInput.value.trim();
  const status = canonStatusInput.value;
  const description = canonDescriptionInput.value.trim();

  if (!name || !description) {
    alert("Please enter at least a canon name and description.");
    return;
  }

  project.canon.unshift({
    id: generateId("canon"),
    name,
    type: type || "General",
    status,
    description,
    createdAt: getTodayString()
  });

  project.updatedAt = getTodayString();

  canonNameInput.value = "";
  canonTypeInput.value = "";
  canonStatusInput.value = "Active Canon";
  canonDescriptionInput.value = "";

  saveProjects();
  renderWorkspace();
}

function renderCanon() {
  const project = getActiveProject();

  if (!project) return;

  canonList.innerHTML = "";

  if (project.canon.length === 0) {
    canonList.innerHTML = `
      <div class="item-card">
        <p>No canon entries yet.</p>
      </div>
    `;
    return;
  }

  project.canon.forEach(entry => {
    const card = document.createElement("article");
    card.className = "item-card";

    card.innerHTML = `
      <h3>${escapeHTML(entry.name)}</h3>
      <p>
        <span class="badge">${escapeHTML(entry.type)}</span>
        <span class="badge">${escapeHTML(entry.status)}</span>
      </p>
      <p>${escapeHTML(entry.description)}</p>
      <p class="muted">${formatDate(entry.createdAt)}</p>
      <div class="card-actions">
        <button class="secondary-btn" data-delete-canon="${entry.id}">Delete</button>
      </div>
    `;

    canonList.appendChild(card);
  });

  document.querySelectorAll("[data-delete-canon]").forEach(button => {
    button.addEventListener("click", () => {
      deleteCanon(button.dataset.deleteCanon);
    });
  });
}

function deleteCanon(canonId) {
  const project = getActiveProject();

  if (!project) return;

  project.canon = project.canon.filter(entry => entry.id !== canonId);
  project.updatedAt = getTodayString();

  saveProjects();
  renderWorkspace();
}

function addTask() {
  const project = getActiveProject();

  if (!project) return;

  const title = taskInput.value.trim();

  if (!title) {
    alert("Please enter a task.");
    return;
  }

  project.tasks.unshift({
    id: generateId("task"),
    title,
    completed: false,
    createdAt: getTodayString()
  });

  project.updatedAt = getTodayString();

  taskInput.value = "";
  saveProjects();
  renderWorkspace();
}

function renderTasks() {
  const project = getActiveProject();

  if (!project) return;

  tasksList.innerHTML = "";

  if (project.tasks.length === 0) {
    tasksList.innerHTML = `
      <div class="item-card">
        <p>No tasks yet.</p>
      </div>
    `;
    return;
  }

  project.tasks.forEach(task => {
    const card = document.createElement("article");
    card.className = "item-card";

    card.innerHTML = `
      <h3 class="${task.completed ? "task-complete" : ""}">
        ${escapeHTML(task.title)}
      </h3>
      <p class="muted">${formatDate(task.createdAt)}</p>
      <div class="card-actions">
        <button data-toggle-task="${task.id}">
          ${task.completed ? "Mark Incomplete" : "Mark Complete"}
        </button>
        <button class="secondary-btn" data-delete-task="${task.id}">Delete</button>
      </div>
    `;

    tasksList.appendChild(card);
  });

  document.querySelectorAll("[data-toggle-task]").forEach(button => {
    button.addEventListener("click", () => {
      toggleTask(button.dataset.toggleTask);
    });
  });

  document.querySelectorAll("[data-delete-task]").forEach(button => {
    button.addEventListener("click", () => {
      deleteTask(button.dataset.deleteTask);
    });
  });
}

function toggleTask(taskId) {
  const project = getActiveProject();

  if (!project) return;

  const task = project.tasks.find(item => item.id === taskId);

  if (!task) return;

  task.completed = !task.completed;
  project.updatedAt = getTodayString();

  saveProjects();
  renderWorkspace();
}

function deleteTask(taskId) {
  const project = getActiveProject();

  if (!project) return;

  project.tasks = project.tasks.filter(task => task.id !== taskId);
  project.updatedAt = getTodayString();

  saveProjects();
  renderWorkspace();
}

function exportActiveProject() {
  const project = getActiveProject();

  if (!project) return;

  const fileData = JSON.stringify(project, null, 2);
  const blob = new Blob([fileData], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const safeTitle = project.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  link.href = url;
  link.download = `${safeTitle || "carnival-forge-project"}-backup.json`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importProject(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    try {
      const imported = JSON.parse(reader.result);

      if (!imported.title || !imported.id) {
        alert("This does not look like a valid Carnival Forge project backup.");
        return;
      }

      if (!Array.isArray(imported.notes)) imported.notes = [];
      if (!Array.isArray(imported.canon)) imported.canon = [];
      if (!Array.isArray(imported.tasks)) imported.tasks = [];
      if (!Array.isArray(imported.drafts)) imported.drafts = [];
      if (!Array.isArray(imported.exports)) imported.exports = [];

      const existingIndex = projects.findIndex(project => project.id === imported.id);

      imported.updatedAt = getTodayString();

      if (existingIndex >= 0) {
        const shouldReplace = confirm("A project with this ID already exists. Replace it?");

        if (!shouldReplace) return;

        projects[existingIndex] = imported;
      } else {
        projects.unshift(imported);
      }

      saveProjects();
      renderDashboard();
      alert("Project imported successfully.");
    } catch (error) {
      console.error(error);
      alert("Could not import this file.");
    }
  };

  reader.readAsText(file);
  event.target.value = "";
}

function deleteActiveProject() {
  const project = getActiveProject();

  if (!project) return;

  const confirmed = confirm(`Delete "${project.title}"? This cannot be undone unless you exported a backup.`);

  if (!confirmed) return;

  projects = projects.filter(item => item.id !== project.id);
  saveProjects();
  showDashboard();
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });

  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("hidden", panel.id !== tabId);
  });
}

function formatDate(dateString) {
  if (!dateString) return "Unknown date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function seedStarterProjectIfEmpty() {
  if (projects.length > 0) return;

  const now = getTodayString();

  projects.push({
    id: generateId("project"),
    title: "The Carnival Forge",
    category: "Creative Engine",
    description: "A creative command center for building worlds, books, games, canon, drafts, tasks, and exports.",
    status: "Active",
    notes: [
      {
        id: generateId("note"),
        body: "First goal: build the project core. Create projects, save notes, save canon, save tasks, and export backups.",
        createdAt: now
      }
    ],
    canon: [
      {
        id: generateId("canon"),
        name: "The Carnival Forge",
        type: "Project Title",
        status: "Active Canon",
        description: "The main creative engine being built as a browser-first app that can later grow into a full creative operating system.",
        createdAt: now
      }
    ],
    tasks: [
      {
        id: generateId("task"),
        title: "Create GitHub repo",
        completed: true,
        createdAt: now
      },
      {
        id: generateId("task"),
        title: "Add README.md, index.html, style.css, and script.js",
        completed: false,
        createdAt: now
      },
      {
        id: generateId("task"),
        title: "Test project creation and JSON export",
        completed: false,
        createdAt: now
      }
    ],
    drafts: [],
    exports: [],
    createdAt: now,
    updatedAt: now
  });

  saveProjects();
}

function setupEventListeners() {
  createProjectBtn.addEventListener("click", createProject);
  backToDashboardBtn.addEventListener("click", showDashboard);
  addNoteBtn.addEventListener("click", addNote);
  addCanonBtn.addEventListener("click", addCanon);
  addTaskBtn.addEventListener("click", addTask);
  exportProjectBtn.addEventListener("click", exportActiveProject);
  deleteProjectBtn.addEventListener("click", deleteActiveProject);
  importFileInput.addEventListener("change", importProject);

  document.querySelectorAll(".tab-btn").forEach(button => {
    button.addEventListener("click", () => {
      switchTab(button.dataset.tab);
    });
  });

  taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      addTask();
    }
  });

  projectTitleInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      createProject();
    }
  });
}

function initApp() {
  setupElements();

  const requiredElements = [
    dashboardView,
    workspaceView,
    backToDashboardBtn,
    projectTitleInput,
    projectCategoryInput,
    projectDescriptionInput,
    createProjectBtn,
    projectList,
    importFileInput,
    workspaceProjectTitle,
    workspaceProjectDescription,
    exportProjectBtn,
    deleteProjectBtn,
    notesCount,
    canonCount,
    tasksCount,
    completedTasksCount,
    recommendedStep,
    noteInput,
    addNoteBtn,
    notesList,
    canonNameInput,
    canonTypeInput,
    canonStatusInput,
    canonDescriptionInput,
    addCanonBtn,
    canonList,
    taskInput,
    addTaskBtn,
    tasksList
  ];

  const missingElement = requiredElements.find(element => !element);

  if (missingElement) {
    alert("The app could not start because an HTML element is missing. Check that index.html matches the required version.");
    console.error("Missing required HTML element.");
    return;
  }

  setupEventListeners();
  loadProjects();
  seedStarterProjectIfEmpty();
  renderDashboard();

  console.log("The Carnival Forge v0.1 loaded successfully.");
}

document.addEventListener("DOMContentLoaded", initApp);
