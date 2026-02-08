// ---------- STATE ----------
let tasks = [];

// ---------- DOM ELEMENTS ----------
const taskNameInput = document.getElementById("taskName");
const taskTimeInput = document.getElementById("taskTime");
const taskPrioritySelect = document.getElementById("taskPriority");
const taskDeadlineInput = document.getElementById("taskDeadline");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskListEl = document.getElementById("taskList");

// ---------- INITIAL LOAD ----------
loadTasks();
renderTasks();

// ---------- EVENT LISTENERS ----------
addTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addTask();
});

// ---------- FUNCTIONS ----------

function addTask() {
    const name = taskNameInput.value.trim();
    const time = parseInt(taskTimeInput.value, 10);

    if (!name || !time || time <= 0) {
        alert("Please enter a task name and valid time.");
        return;
    }

    const task = {
        id: Date.now().toString(),
        name,
        remainingTime: time,
        priority: taskPrioritySelect.value || null, // truly optional
        deadline: taskDeadlineInput.value || null,
        createdAt: Date.now(),
        isEditing: false
    };

    task.priority = calculatePriority(task);

    tasks.push(task);
    saveTasks();
    renderTasks();
    resetForm();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function renderTasks() {
    taskListEl.innerHTML = "";

    if (tasks.length === 0) {
        taskListEl.innerHTML = `<p class="empty-state">No tasks yet. Add one above!</p>`;
        return;
    }

    tasks.forEach(task => {
        // Auto-update priority on every render
        task.priority = calculatePriority(task);

        const taskEl = document.createElement("div");
        taskEl.className = "task-item";

        taskEl.innerHTML = `
            <div class="task-header">
                <div class="task-info">

                    ${
                        task.isEditing
                            ? `<input class="edit-name" type="text" value="${task.name}" />`
                            : `<div class="task-name">${task.name}</div>`
                    }

                    <div class="task-meta">

                        ${
                            task.isEditing
                                ? `<input class="edit-time" type="number" value="${task.remainingTime}" />`
                                : `<span class="task-time">⏱ ${task.remainingTime} min</span>`
                        }

                        ${
                            task.isEditing
                                ? `
                                <select class="edit-priority">
                                    <option value="">auto</option>
                                    <option value="high" ${task.priority === "high" ? "selected" : ""}>high</option>
                                    <option value="medium" ${task.priority === "medium" ? "selected" : ""}>medium</option>
                                    <option value="low" ${task.priority === "low" ? "selected" : ""}>low</option>
                                </select>
                                `
                                : `<span class="task-priority priority-${task.priority}">
                                    ${task.priority}
                                   </span>`
                        }

                        ${
                            task.isEditing
                                ? `<input class="edit-deadline" type="datetime-local" value="${task.deadline || ""}" />`
                                : task.deadline
                                    ? `<span class="task-deadline">⏰ ${formatDeadline(task.deadline)}</span>`
                                    : ""
                        }

                    </div>
                </div>

                <div class="task-actions">
                    ${
                        task.isEditing
                            ? `
                              <button class="btn btn-success btn-small save-btn">Save</button>
                              <button class="btn btn-secondary btn-small cancel-btn">Cancel</button>
                              `
                            : `
                              <button class="btn btn-secondary btn-small edit-btn">Edit</button>
                              <button class="btn-delete" title="Delete task">✕</button>
                              `
                    }
                </div>
            </div>
        `;

        // DELETE
        taskEl.querySelector(".btn-delete")?.addEventListener("click", () => {
            deleteTask(task.id);
        });

        // EDIT
        taskEl.querySelector(".edit-btn")?.addEventListener("click", () => {
            task.isEditing = true;
            renderTasks();
        });

        // SAVE
        taskEl.querySelector(".save-btn")?.addEventListener("click", () => {
            task.name = taskEl.querySelector(".edit-name").value.trim();
            task.remainingTime = parseInt(taskEl.querySelector(".edit-time").value, 10);

            const selectedPriority = taskEl.querySelector(".edit-priority").value;
            task.priority = selectedPriority || null;

            const newDeadline = taskEl.querySelector(".edit-deadline").value;
            task.deadline = newDeadline || null;

            task.priority = calculatePriority(task);

            task.isEditing = false;
            saveTasks();
            renderTasks();
        });

        // CANCEL
        taskEl.querySelector(".cancel-btn")?.addEventListener("click", () => {
            task.isEditing = false;
            renderTasks();
        });

        taskListEl.appendChild(taskEl);
    });

    saveTasks();
}

function resetForm() {
    taskNameInput.value = "";
    taskTimeInput.value = "";
    taskPrioritySelect.value = ""; // 👈 auto / none
    taskDeadlineInput.value = "";
}

// ---------- STORAGE ----------
function saveTasks() {
    localStorage.setItem("decidr_tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem("decidr_tasks");
    tasks = saved ? JSON.parse(saved) : [];
}

// ---------- HELPERS ----------
function formatDeadline(deadlineStr) {
    return new Date(deadlineStr).toLocaleString();
}

// ---------- PRIORITY ENGINE ----------
function calculatePriority(task) {
    if (!task.deadline && !task.priority) {
        return "low";
    }

    if (task.deadline) {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);

        if (diffDays <= 1) return "high";
        if (diffDays <= 3) return "medium";
        return "low";
    }

    return task.priority || "low";
}