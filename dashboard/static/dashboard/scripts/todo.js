document.addEventListener("DOMContentLoaded", () => {
    loadTodos();
});

function loadTodos() {
    const todoList = document.getElementById("todo-list");
    const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];

    todoList.innerHTML = "";
    savedTodos.forEach((task, index) => {
        let li = document.createElement("li");
        li.innerHTML = `${task} <button onclick="removeTodo(${index})">X</button>`;
        todoList.appendChild(li);
    });
}

function addTodo() {
    const todoInput = document.getElementById("todo-input");
    const task = todoInput.value.trim();
    
    if (task === "") return;

    let todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.push(task);
    localStorage.setItem("todos", JSON.stringify(todos));

    todoInput.value = "";
    loadTodos();
}

function removeTodo(index) {
    let todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(todos));

    loadTodos();
}
