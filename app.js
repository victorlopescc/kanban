let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentEditingId = null;

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  document.querySelectorAll('.tasks').forEach(column => column.innerHTML = '');

  tasks.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-card';
    taskElement.draggable = true;
    taskElement.id = task.id;
    taskElement.ondragstart = drag;

    let dateContent = "Sem data";
    if(task.dueDate) {
      const date = new Date(task.dueDate);
      dateContent = `Data Limite: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }

    taskElement.innerHTML = `
            <h3>${task.title}</h3>
            ${task.description ? `<p>${task.description}</p>` : ''}
            <small>${dateContent}</small>
            <div class="task-actions">
                <button onclick="editTask('${task.id}')">Editar</button>
                <button onclick="deleteTask('${task.id}')" class="delete-btn">Excluir</button>
            </div>
        `;

    document.querySelector(`#${task.status} .tasks`).appendChild(taskElement);
  });
}

function openModal(editing = false) {
  document.getElementById('modal').style.display = 'block';
  if (!editing) {
    document.getElementById('taskForm').reset();
    currentEditingId = null;
  }
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function handleFormSubmit(e) {
  e.preventDefault();
  const taskData = {
    id: currentEditingId || Date.now().toString(),
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    dueDate: document.getElementById('dueDate').value || null, // Data opcional
    status: 'todo'
  };

  if (!currentEditingId) {
    tasks.push(taskData);
  } else {
    const index = tasks.findIndex(t => t.id === currentEditingId);
    tasks[index] = taskData;
  }

  saveTasks();
  renderTasks();
  closeModal();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  document.getElementById('title').value = task.title;
  document.getElementById('description').value = task.description;
  document.getElementById('dueDate').value = task.dueDate;
  currentEditingId = id;
  openModal(true);
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Drag and Drop functions
function allowDrop(ev) {
  ev.preventDefault();
  const draggingElement = document.querySelector('.dragging');
  const taskCards = ev.currentTarget.querySelectorAll('.task-card:not(.dragging)');

  taskCards.forEach(task => {
    const rect = task.getBoundingClientRect();
    const nextSibling = (ev.clientY > rect.top + rect.height / 2) ?
      task.nextSibling :
      task;

    if (ev.clientY > rect.top && ev.clientY < rect.bottom) {
      task.style.transform = ev.clientY > rect.top + rect.height / 2 ?
        'translateY(-20px)' :
        'translateY(20px)';
    }
  });
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
  ev.dataTransfer.effectAllowed = "move";
  ev.target.classList.add('dragging');
}

function drop(ev) {
  ev.preventDefault();
  const taskId = ev.dataTransfer.getData("text");
  const targetColumn = ev.target.closest('.column');
  const tasksContainer = targetColumn.querySelector('.tasks');
  const dragTask = document.getElementById(taskId);

  if (!targetColumn) return;

  const closestTask = ev.target.closest('.task-card');
  const newStatus = targetColumn.id;
  const task = tasks.find(t => t.id === taskId);

  if (task) {
    if (task.status !== newStatus) {
      task.status = newStatus;
    }

    if (closestTask && task.status === newStatus) {
      const rect = closestTask.getBoundingClientRect();
      const nextSibling = (ev.clientY > rect.top + rect.height / 2) ?
        closestTask.nextSibling :
        closestTask;

      tasksContainer.insertBefore(dragTask, nextSibling);
    } else {
      tasksContainer.appendChild(dragTask);
    }

    const newOrder = Array.from(tasksContainer.children).map(child => child.id);
    tasks.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));

    saveTasks();
  }
}


// Initial render
renderTasks();

document.addEventListener('dragend', (e) => {
  document.querySelectorAll('.task-card').forEach(task => {
    task.classList.remove('dragging');
    task.style.transform = 'none';
  });
});