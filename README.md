# Task Manager

A browser-based task manager created with HTML, CSS, and JavaScript.

This project follows a TodoMVC-inspired task flow and demonstrates core task-manager behavior in a small, easy-to-understand app.

## Project structure

```text
task-manager/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Features
- Add a task
- Mark a task complete or active again
- Delete a task
- Filter tasks by All, Active, and Completed
- Save tasks in localStorage
- Show remaining task count
- Clear completed tasks
- Keep UI simple and keyboard-friendly

## Run locally
From the project folder, run:

```bash
python -m http.server 8000
```

Then open this in the browser:

```text
http://localhost:8000
```

You can also open the project directly in a browser by double-clicking `index.html`, though using a local server is recommended.

## Requirements covered
This project satisfies the main task-manager requirements:
- add task
- complete task
- delete task
- filter tasks
- persist tasks with localStorage

## Notes
Each task is stored as an object with an `id`, `title`, and `completed` flag. Data is saved in the browser so it remains after refresh.

## Testing checklist
- Add a normal task
- Try submitting an empty task
- Add multiple tasks
- Mark a task complete
- Mark it active again
- Delete a task
- Test All, Active, and Completed filters
- Refresh the page and confirm tasks remain
- Confirm there are no browser console errors
