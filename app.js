
const STORAGE_KEY = 'task-manager-tasks';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const liveRegion = document.getElementById('live-region');
const filterButtons = document.querySelectorAll('.filter-btn');
const remainingCount = document.getElementById('remaining-count');
const clearCompletedButton = document.getElementById('clear-completed');

let tasks = loadTasks();
let currentFilter = 'all';
let editingTaskId = null;

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

    return savedTasks
      .map((task) => ({
        id: task.id || `${Date.now()}-${Math.random()}`,
        title: typeof task.title === 'string' ? task.title : '',
        completed: Boolean(task.completed),
        dueDate: typeof task.dueDate === 'string' ? task.dueDate : '',
      }))
      .filter((task) => task.title);
  } catch (error) {
    console.error('Could not load tasks:', error);
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
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function updateRemainingCount() {
  const remaining = tasks.filter((task) => !task.completed).length;
  remainingCount.textContent =
    `${remaining} task${remaining === 1 ? '' : 's'} left`;
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

    // Show edit form for the selected task
    if (editingTaskId === task.id) {
      const editForm = document.createElement('form');
      editForm.classList.add('edit-form');

      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = task.title;
      editInput.maxLength = 120;
      editInput.required = true;
      editInput.setAttribute('aria-label', 'Edit task title');

      const editDueDate = document.createElement('input');
      editDueDate.type = 'date';
      editDueDate.value = task.dueDate || '';
      editDueDate.setAttribute('aria-label', 'Edit task due date');

      const saveButton = document.createElement('button');
      saveButton.type = 'submit';
      saveButton.textContent = 'Save';

      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.textContent = 'Cancel';

      cancelButton.addEventListener('click', () => {
        editingTaskId = null;
        renderTasks();
        announce('Editing cancelled');
      });

editForm.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    editingTaskId = null;
    renderTasks();

    const editButton = Array.from(
      taskList.querySelectorAll('button[data-task-id]')
    ).find((button) => button.dataset.taskId === String(task.id));

    if (editButton) {
      editButton.focus();
    }

    announce('Editing cancelled');
  }
});

      editForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const newTitle = editInput.value.trim();

        if (!newTitle) {
          editInput.setCustomValidity('Task title cannot be empty.');
          editInput.reportValidity();
          return;
        }

        editInput.setCustomValidity('');

        saveTaskEdit(task.id, newTitle, editDueDate.value);
      });

      editInput.addEventListener('input', () => {
        editInput.setCustomValidity('');
      });

      editForm.appendChild(editInput);
      editForm.appendChild(editDueDate);
      editForm.appendChild(saveButton);
      editForm.appendChild(cancelButton);
      li.appendChild(editForm);
      taskList.appendChild(li);

      editInput.focus();
      return;
    }

    // Completion checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      'aria-label',
      `Mark ${task.title} as complete`
    );
    checkbox.addEventListener('change', () => toggleTask(task.id));

    // Task title
    const text = document.createElement('span');
    text.classList.add('task-title');
    text.textContent = task.title;

    // Due date
    const dueDate = document.createElement('span');
    dueDate.classList.add('due-date');

    if (task.dueDate) {
      const formattedDate = new Date(
        `${task.dueDate}T00:00:00`
      ).toLocaleDateString();

      dueDate.textContent = `Due: ${formattedDate}`;
    }

    // Edit button
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.dataset.taskId = task.id;
    editButton.setAttribute('aria-label', `Edit ${task.title}`);

    editButton.addEventListener('click', () => {
      editingTaskId = task.id;
      renderTasks();
      announce(`Editing task: ${task.title}`);
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ${task.title}`);

    deleteButton.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(text);

    if (task.dueDate) {
      li.appendChild(dueDate);
    }

    li.appendChild(editButton);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  });
}

function saveTaskEdit(taskId, newTitle, newDueDate) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        title: newTitle,
        dueDate: newDueDate,
      };
    }

    return task;
  });

  editingTaskId = null;
  saveTasks();
  renderTasks();
  announce(`Task updated: ${newTitle}`);
}

function addTask(event) {
  event.preventDefault();

  const title = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!title) {
    return;
  }

  tasks.unshift({
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    title,
    completed: false,
    dueDate,
  });

  taskInput.value = '';
  dueDateInput.value = '';
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
    announce(
      `Task marked as ${updatedTask.completed ? 'complete' : 'active'}: ${updatedTask.title}`
    );
  }
}

function deleteTask(taskId) {
  const taskToDelete = tasks.find((task) => task.id === taskId);

  tasks = tasks.filter((task) => task.id !== taskId);

  if (editingTaskId === taskId) {
    editingTaskId = null;
  }

  saveTasks();
  renderTasks();

  if (taskToDelete) {
    announce(`Task deleted: ${taskToDelete.title}`);
  }
}

function clearCompletedTasks() {
  const completedCount = tasks.filter((task) => task.completed).length;

  tasks = tasks.filter((task) => !task.completed);
  editingTaskId = null;

  saveTasks();
  renderTasks();

  if (completedCount > 0) {
    announce(
      `${completedCount} completed task${completedCount === 1 ? '' : 's'} cleared`
    );
  }
}

taskForm.addEventListener('submit', addTask);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    editingTaskId = null;
    renderTasks();
  });
});

clearCompletedButton.addEventListener('click', clearCompletedTasks);

renderTasks();
