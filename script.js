// Clases principales
class User {
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = new Date();
    }

    // Verifica si la contraseña coincide
    verifyPassword(password) {
        return this.password === password;
    }

    // Convierte el objeto a formato serializable para localStorage
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            password: this.password,
            createdAt: this.createdAt.toISOString()
        };
    }

    // Reconstruye un objeto User desde datos serializados
    static fromJSON(data) {
        const user = new User(data.id, data.name, data.email, data.password);
        user.createdAt = new Date(data.createdAt);
        return user;
    }
}

class Task {
    constructor(id, title, description, createdBy, assignedTo, deadline = null) {
        this.id = id;
        this.title = title;  // Título de la tarea
        this.description = description; // Descripción detallada
        this.createdBy = createdBy;  // ID del usuario creador
        this.assignedTo = assignedTo;  // ID del usuario asignado
        this.deadline = deadline; // Fecha límite (opcional)
        this.createdAt = new Date();  // Fecha de creación
        this.completed = false; // Estado de completado
        this.completedAt = null; // Fecha de completado (si aplica)
    }

    complete() {
        this.completed = true; // Marca como completada
        this.completedAt = new Date(); // Establece fecha de completado
    }

    uncomplete() {
        this.completed = false; // Vuelve a estado pendiente
        this.completedAt = null;  // Elimina fecha de completado
    }

    // Serializa el objeto para almacenamiento
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            createdBy: this.createdBy,
            assignedTo: this.assignedTo,
            deadline: this.deadline ? this.deadline.toISOString() : null,
            createdAt: this.createdAt.toISOString(),
            completed: this.completed,
            completedAt: this.completedAt ? this.completedAt.toISOString() : null
        };
    }

    // Reconstruye desde datos serializados
    static fromJSON(data) {
        const task = new Task(
            data.id,
            data.title,
            data.description,
            data.createdBy,
            data.assignedTo,
            data.deadline ? new Date(data.deadline) : null
        );

        task.createdAt = new Date(data.createdAt);
        task.completed = data.completed;
        task.completedAt = data.completedAt ? new Date(data.completedAt) : null;

        return task;
    }
}

// Gestor de autenticación
class AuthManager {
    constructor() {
        this.users = new Map(); // Almacena usuarios (Map para búsquedas eficientes)
        this.currentUser = null; // Usuario actualmente autenticado
        this.loadFromStorage(); // Carga datos al inicializar
    }

    // Carga usuarios desde localStorage
    loadFromStorage() {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            JSON.parse(storedUsers).forEach(userData => {
                const user = User.fromJSON(userData);
                this.users.set(user.id, user);
            });
        }

        // Carga usuario actual si existe
        const storedCurrentUser = localStorage.getItem('currentUser');
        if (storedCurrentUser) {
            this.currentUser = JSON.parse(storedCurrentUser);
        }
    }

    // Guarda todos los usuarios en localStorage
    saveToStorage() {
        const usersData = Array.from(this.users.values()).map(user => user.toJSON());
        localStorage.setItem('users', JSON.stringify(usersData));
        // Guarda o elimina usuario actual
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    // Registra nuevo usuario
    register(name, email, password) {
        if (Array.from(this.users.values()).find(user => user.email === email)) {
            throw new Error('El email ya está registrado');
        }

        const id = this.generateId(); // Genera ID único
        const user = new User(id, name, email, password);
        this.users.set(id, user);  // Agrega al Map
        this.saveToStorage();  // Persiste en localStorage
        return user;
    }

    login(email, password) {
        const user = Array.from(this.users.values()).find(u => u.email === email);

        if (!user || !user.verifyPassword(password)) {
            throw new Error('Credenciales incorrectas'); // Validación
        }

        this.currentUser = user.toJSON();  // Establece como usuario actual
        this.saveToStorage();  // Persiste
        return user;
    }

    logout() {
        this.currentUser = null;  // Cierra sesión
        this.saveToStorage();  // Persiste
    }

    getCurrentUser() {
        return this.currentUser;  // Devuelve usuario actual
    }

    getAllUsers() {
        return Array.from(this.users.values()); // Todos los usuarios
    }

    // Genera ID único basado en timestamp y random
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
}



// Gestor de tareas
class TaskManager {
    constructor() {
        this.tasks = new Map();   // Almacena tareas
        this.loadFromStorage();   // Carga datos al inicializar
    }

    // Carga tareas desde localStorage
    loadFromStorage() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            JSON.parse(storedTasks).forEach(taskData => {
                const task = Task.fromJSON(taskData);
                this.tasks.set(task.id, task);
            });
        }
    }

    // Guarda todas las tareas en localStorage
    saveToStorage() {
        const tasksData = Array.from(this.tasks.values()).map(task => task.toJSON());
        localStorage.setItem('tasks', JSON.stringify(tasksData));
    }

    // Crea nueva tarea
    createTask(title, description, createdBy, assignedTo, deadline = null) {
        const id = this.generateId();
        const task = new Task(id, title, description, createdBy, assignedTo, deadline);
        this.tasks.set(id, task);
        this.saveToStorage();
        return task;
    }

    // Obtiene tarea por ID
    getTask(id) {
        return this.tasks.get(id);
    }

    // Todas las tareas
    getAllTasks() {
        return Array.from(this.tasks.values());
    }

    // Filtra tareas por estado y/o usuario
    getFilteredTasks(status = 'all', userId = 'all') {
        return this.getAllTasks().filter(task => {
            const statusMatch = status === 'all' ||
                (status === 'completed' && task.completed) ||
                (status === 'pending' && !task.completed);
            const userMatch = userId === 'all' || task.assignedTo === userId;
            return statusMatch && userMatch;
        });
    }

    // Actualiza propiedades de una tarea
    updateTask(id, updates) {
        const task = this.getTask(id);
        if (!task) return undefined;

        // Aplica actualizaciones (excepto ID y createdAt)
        Object.keys(updates).forEach(key => {
            if (key in task && key !== 'id' && key !== 'createdAt') {
                task[key] = updates[key];
            }
        });

        // Persiste cambios
        this.saveToStorage();
        return task;
    }

    // Elimina tarea
    deleteTask(id) {
        const result = this.tasks.delete(id);
        if (result) this.saveToStorage();
        return result;
    }

    // Calcula estadísticas
    getStatistics() {
        const allTasks = this.getAllTasks();
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(task => task.completed).length;
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return { totalTasks, completedTasks, completionPercentage };
    }

    // Genera ID único (misma lógica que AuthManager)
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }


    // Simula carga asíncrona desde API externa
    async loadInitialTasksFromAPI() {
        return new Promise(resolve => {
            setTimeout(() => { // Simula delay de red
                const mockTasks = [ // Datos de ejemplo
                    {
                        id: 'api-1',
                        title: 'Revisar documentación',
                        description: 'Revisar y actualizar la documentación del proyecto',
                        createdBy: 'system',
                        assignedTo: 'all',
                        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        createdAt: new Date().toISOString(),
                        completed: false
                    },
                    {
                        id: 'api-2',
                        title: 'Preparar reunión de equipo',
                        description: 'Preparar agenda y materiales para la reunión',
                        createdBy: 'system',
                        assignedTo: 'all',
                        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                        createdAt: new Date().toISOString(),
                        completed: false
                    }
                ];

                // Agrega tareas simuladas
                mockTasks.forEach(taskData => {
                    const task = Task.fromJSON(taskData);
                    if (!this.tasks.has(task.id)) {
                        this.tasks.set(task.id, task);
                    }
                });

                this.saveToStorage(); // Persiste
                resolve(Array.from(this.tasks.values()));
            }, 1000);
        });
    }
}

// Aplicación principal
class TaskApp {
    constructor() {
        this.auth = new AuthManager(); // Instancia gestor de autenticación
        this.taskManager = new TaskManager();  // Instancia gestor de tareas
        this.init();  // Inicializa aplicación
    }

    init() {
        this.bindEvents(); // Configura event listeners
        this.checkAuth();  // Verifica estado de autenticación
        this.loadInitialData(); // Carga datos iniciales si es necesario
    }


    bindEvents() {
        // Botones de autenticación
        document.getElementById('show-login').addEventListener('click', () => this.toggleAuthForms());
        document.getElementById('show-register').addEventListener('click', () => this.toggleAuthForms());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Formularios
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('create-task-form').addEventListener('submit', (e) => this.handleCreateTask(e));

        // Filtros
        document.getElementById('filter-status').addEventListener('change', () => this.renderTasks());
        document.getElementById('filter-user').addEventListener('change', () => this.renderTasks());
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());
    }

    // Usuario autenticado: muestra interfaz principal
    checkAuth() {
        const user = this.auth.getCurrentUser();
        const illustration = document.getElementById('illustration');

        if (user) {
            document.getElementById('show-login').style.display = 'none';
            document.getElementById('show-register').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'inline-block';
            document.getElementById('user-info').textContent = `Hola, ${user.name}`;
            document.getElementById('auth-forms').style.display = 'none';
            document.getElementById('app-content').style.display = 'block';
            if (illustration) illustration.style.display = 'none'; // oculta ilustración al loguear
            // Actualiza vistas
            this.renderUserList();
            this.renderTasks();
            this.renderStats();
        } else { // Usuario no autenticado: muestra solo botones de login/register
            document.getElementById('show-login').style.display = 'inline-block';
            document.getElementById('show-register').style.display = 'inline-block';
            document.getElementById('logout-btn').style.display = 'none';
            document.getElementById('user-info').textContent = '';
            document.getElementById('auth-forms').style.display = 'none';
            document.getElementById('app-content').style.display = 'none';
            if (illustration) illustration.style.display = ''; // muestra ilustración al cerrar sesión
        }
    }

    // Muestra/oculta formularios de autenticación
    toggleAuthForms() {
        const authForms = document.getElementById('auth-forms');
        const illustration = document.getElementById('illustration');
        // Alterna formularios
        const showForms = authForms.style.display === 'none';
        authForms.style.display = showForms ? 'flex' : 'none';

        // Alterna ilustración en sentido contrario
        illustration.style.display = showForms ? 'none' : '';
    }

    handleLogin(e) {
        e.preventDefault(); // Evita envío tradicional del formulario
        // Obtiene valores del formulario
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            this.auth.login(email, password);  // Intenta login
            document.getElementById('login-form').reset();  // Limpia formulario
            this.checkAuth();  // Actualiza interfaz
        } catch (error) {
            alert(error.message);  // Muestra error
        }
    }

    // Obtiene valores del formulario
    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            this.auth.register(name, email, password); // Intenta registro
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            document.getElementById('register-form').reset();  // Limpia formulario
            document.getElementById('auth-forms').style.display = 'none';  // Oculta formularios
        } catch (error) {
            alert(error.message);   // Muestra error
        }
    }

    logout() {
        this.auth.logout();  // Cierra sesión
        this.checkAuth();   // Actualiza interfaz
    }


    handleCreateTask(e) {
        e.preventDefault();
        const user = this.auth.getCurrentUser();
        if (!user) return;   // Si no hay usuario autenticado, no hace nada

        // Obtiene valores del formulario
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const assignedTo = document.getElementById('task-assignee').value;
        const deadline = document.getElementById('task-deadline').value;

        if (!assignedTo) {
            alert('Debes asignar la tarea a un usuario');
            return;
        }

        // Crea nueva tarea
        this.taskManager.createTask(
            title,
            description,
            user.id,
            assignedTo,
            deadline ? new Date(deadline) : null
        );

        // Limpia formulario
        document.getElementById('create-task-form').reset();
        this.renderTasks();  // Actualiza lista de tareas
        this.renderStats();  // Actualiza estadísticas
    }

    renderUserList() {
        const assigneeSelect = document.getElementById('task-assignee');
        const filterUserSelect = document.getElementById('filter-user');

        // Limpiar selects (excepto primera opción)
        while (assigneeSelect.options.length > 1) assigneeSelect.remove(1);
        while (filterUserSelect.options.length > 1) filterUserSelect.remove(1);

        // Agrega usuarios a los selects
        this.auth.getAllUsers().forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            assigneeSelect.appendChild(option.cloneNode(true));
            filterUserSelect.appendChild(option);
        });
    }

    // Obtiene valores de filtros
    renderTasks() {
        const container = document.getElementById('tasks-container');
        const statusFilter = document.getElementById('filter-status').value;
        const userFilter = document.getElementById('filter-user').value;

        // Obtiene tareas filtradas
        const tasks = this.taskManager.getFilteredTasks(statusFilter, userFilter);
        container.innerHTML = '';  // Limpia contenedor

        if (tasks.length === 0) {
            container.innerHTML = '<p>No hay tareas para mostrar</p>';
            return;
        }

        // Renderiza cada tarea
        tasks.forEach(task => {
            const createdBy = this.auth.users.get(task.createdBy);
            const assignedTo = this.auth.users.get(task.assignedTo);

            const taskEl = document.createElement('div');
            taskEl.className = `task ${task.completed ? 'completed' : ''}`;
            taskEl.innerHTML = `
                        <div class="task-header">
                            <h3>${task.title}</h3>
                            <span>${task.completed ? '✅ Completada' : '⏳ Pendiente'}</span>
                        </div>
                        <p>${task.description || 'Sin descripción'}</p>
                        <div>
                            <strong>Creada por:</strong> ${createdBy ? createdBy.name : 'Desconocido'} | 
                            <strong>Asignada a:</strong> ${assignedTo ? assignedTo.name : 'Desconocido'}
                        </div>
                        ${task.deadline ? `<div><strong>Fecha límite:</strong> ${new Date(task.deadline).toLocaleDateString()}</div>` : ''}
                        <div class="task-actions">
                            ${!task.completed ?
                    `<button onclick="app.completeTask('${task.id}')">Completar</button>` :
                    `<button onclick="app.uncompleteTask('${task.id}')">Pendiente</button>`
                }
                            <button onclick="app.editTask('${task.id}')">Editar</button>
                            <button onclick="app.deleteTask('${task.id}')">Eliminar</button>
                        </div>
                    `;
            container.appendChild(taskEl);
        });
    }

    completeTask(id) {
        this.taskManager.updateTask(id, { completed: true, completedAt: new Date() });
        this.renderTasks();  // Actualiza vista
        this.renderStats();  // Actualiza estadísticas
    }

    uncompleteTask(id) {
        this.taskManager.updateTask(id, { completed: false, completedAt: null });
        this.renderTasks();   // Actualiza vista
        this.renderStats();  // Actualiza estadísticas
    }

    editTask(id) {
        const task = this.taskManager.getTask(id);
        if (!task) return;

        // Usa prompts simples para edición
        const newTitle = prompt('Nuevo título:', task.title);
        if (newTitle === null) return;  // Usuario canceló

        const newDescription = prompt('Nueva descripción:', task.description || '');
        if (newDescription === null) return;

        this.taskManager.updateTask(id, {
            title: newTitle,
            description: newDescription
        });

        this.renderTasks();  // Actualiza vista
    }

    deleteTask(id) {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            this.taskManager.deleteTask(id);  // Elimina
            this.renderTasks();   // Actualiza vista
            this.renderStats();   // Actualiza estadísticas
        }
    }

    // Actualiza elementos de estadísticas
    renderStats() {
        const stats = this.taskManager.getStatistics();
        document.getElementById('total-tasks').textContent = stats.totalTasks;
        document.getElementById('completed-tasks').textContent = stats.completedTasks;
        document.getElementById('completion-percentage').textContent = `${stats.completionPercentage}%`;
    }

    // Restablece filtros a valores por defecto
    clearFilters() {
        document.getElementById('filter-status').value = 'all';
        document.getElementById('filter-user').value = 'all';
        this.renderTasks();
    }

    // Carga tareas iniciales si no hay ninguna
    async loadInitialData() {
        if (this.taskManager.getAllTasks().length === 0) {
            await this.taskManager.loadInitialTasksFromAPI();
            this.renderTasks();
            this.renderStats();
        }
    }
}

// Crea instancia global de la aplicación
const app = new TaskApp();