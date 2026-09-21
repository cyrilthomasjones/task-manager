const STORAGE_KEY = 'task-manager-tasks';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const liveRegion = document.getElementById('live-region');
const filterButtons = document.querySelectorAll('.filter-btn');
const remainingCount = document.getElementById('remaining-count');
const clearCompletedButton = document.getElementById('clear-completed');

let tasks = loadTasks();
let currentFilter = 'all';

function announce(message) {
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(savedTasks)) {
      return [];
    }

    return savedTasks.map((task) => ({
      id: task.id || `${Date.now()}-${Math.random()}`,
      title: typeof task.title === 'string' ? task.title : '',
      completed: Boolean(task.completed),
    })).filter((task) => task.title);
  } catch (error) {
    console.error('Could not load tasks from localStorage:', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function updateRemainingCount() {
  const remaining = tasks.filter((task) => !task.completed).length;
  remainingCount.textContent = `${remaining} task${remaining === 1 ? '' : 's'} left`;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = '';
  updateFilterButtons();
  updateRemainingCount();

  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');

    if (currentFilter === 'active') {
      emptyState.textContent = 'No active tasks.';
    } else if (currentFilter === 'completed') {
      emptyState.textContent = 'No completed tasks.';
    } else {
      emptyState.textContent = 'No tasks yet.';
    }
  } else {
    emptyState.classList.add('hidden');
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement('li');
    li.classList.add('task-item');

    if (task.completed) {
      li.classList.add('completed');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.title} as complete`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const text = document.createElement('span');
    text.textContent = task.title;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  });
}

function addTask(event) {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) {
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    title,
    completed: false,
  });

  taskInput.value = '';
  taskInput.focus();
  saveTasks();
  renderTasks();
  announce(`Task added: ${title}`);
}

function toggleTask(taskId) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }

    return task;
  });

  saveTasks();
  renderTasks();

  const updatedTask = tasks.find((task) => task.id === taskId);
  if (updatedTask) {
    announce(`Task marked as ${updatedTask.completed ? 'complete' : 'active'}: ${updatedTask.title}`);
  }
}

function deleteTask(taskId) {
  const taskToDelete = tasks.find((task) => task.id === taskId);
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();

  if (taskToDelete) {
    announce(`Task deleted: ${taskToDelete.title}`);
  }
}

function clearCompletedTasks() {
  const completedCount = tasks.filter((task) => task.completed).length;
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();

  if (completedCount > 0) {
    announce(`${completedCount} completed task${completedCount === 1 ? '' : 's'} cleared`);
  }
}

taskForm.addEventListener('submit', addTask);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompletedButton.addEventListener('click', clearCompletedTasks);

renderTasks();
