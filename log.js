// URL Base de la API para la entidad de usuarios
const API_URL = 'https://jsonplaceholder.typicode.com/users';

// Referencias a los elementos del DOM
const userForm = document.getElementById('user-form');
const userNameInput = document.getElementById('user-name');
const userEmailInput = document.getElementById('user-email');
const userTableBody = document.getElementById('user-table-body');

// Estado local para simular la persistencia de datos en el Frontend
let localUsers = [];

// ==========================================
// 1. LEER USUARIOS (READ - GET)
// ==========================================
async function cargarUsuarios() {
    try {
        // Hacemos la petición al servidor para traer los usuarios existentes
        const respuesta = await fetch(API_URL);
        const usuarios = await respuesta.json();
        
        console.log("Usuarios cargados del servidor:", usuarios);
        
        // Guardamos en nuestro estado local y renderizamos en el DOM
        localUsers = usuarios;
        renderizarTabla();
    } catch (error) {
        console.error("Error al cargar usuarios de la API:", error);
    }
}

// Función encargada exclusivamente de transformar los datos JSON en elementos HTML (DOM)
function renderizarTabla() {
    userTableBody.innerHTML = ''; // Limpiamos la tabla
    
    localUsers.forEach(usuario => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${usuario.id}</td>
            <td><strong>${usuario.name}</strong></td>
            <td>${usuario.email}</td>
            <td>
                <button class="btn btn-edit" data-id="${usuario.id}">Editar</button>
                <button class="btn btn-delete" data-id="${usuario.id}">Eliminar</button>
            </td>
        `;
        userTableBody.appendChild(fila);
    });
}

// ==========================================
// 2. CREAR USUARIO (CREATE - POST)
// ==========================================
userForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitamos que la página se recargue
    
    const nuevoUsuario = {
        name: userNameInput.value.trim(),
        email: userEmailInput.value.trim()
    };

    try {
        // Enviamos los datos al servidor
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(nuevoUsuario),
            headers: { 'Content-type': 'application/json; charset=UTF-8' }
        });
        
        const usuarioCreado = await respuesta.json();
        console.log("Servidor procesó el guardado (Status 201):", usuarioCreado);
        
        // Simulamos ID único para el entorno local y actualizamos la interfaz
        usuarioCreado.id = localUsers.length ? Math.max(...localUsers.map(u => u.id)) + 1 : 1;
        localUsers.unshift(usuarioCreado); // Lo agregamos al inicio de la lista
        
        renderizarTabla();
        userForm.reset(); // Limpiamos los inputs
    } catch (error) {
        console.error("Error al crear usuario:", error);
    }
});

// ==========================================
// 3. CAPTURA DE EVENTOS DE LA TABLA (EDITAR Y ELIMINAR)
// ==========================================
// Usamos delegación de eventos para escuchar los clicks en los botones dentro de la tabla
userTableBody.addEventListener('click', (e) => {
    const idUnico = parseInt(e.target.dataset.id);
    
    if (e.target.classList.contains('btn-delete')) {
        eliminarUsuario(idUnico);
    } else if (e.target.classList.contains('btn-edit')) {
        actualizarUsuario(idUnico);
    }
});

// ==========================================
// 4. ELIMINAR USUARIO (DELETE)
// ==========================================
async function eliminarUsuario(id) {
    const confirmar = confirm(`¿Estás seguro de eliminar al usuario con ID ${id}?`);
    if (!confirmar) return;

    try {
        // Petición HTTP DELETE apuntando al ID específico en la URL
        const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        console.log(`Servidor respondió al DELETE (Status ${respuesta.status})`);
        
        // Si el servidor responde con éxito, limpiamos el DOM mediante el estado local
        localUsers = localUsers.filter(user => user.id !== id);
        renderizarTabla();
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
    }
}

// ==========================================
// 5. ACTUALIZAR USUARIO (UPDATE - PUT/PATCH)
// ==========================================
async function actualizarUsuario(id) {
    const usuarioActual = localUsers.find(user => user.id === id);
    
    // Pedimos los nuevos datos (puedes mejorar esto en producción con un modal)
    const nuevoNombre = prompt("Modificar Nombre:", usuarioActual.name);
    const nuevoEmail = prompt("Modificar Correo:", usuarioActual.email);
    
    if (!nuevoNombre || !nuevoEmail) return; // Si cancela, no hace nada

    try {
        // Enviamos la actualización parcial (PATCH) al servidor con el ID en la URL
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: nuevoNombre, email: nuevoEmail }),
            headers: { 'Content-type': 'application/json; charset=UTF-8' }
        });
        
        const datosActualizados = await respuesta.json();
        console.log("Servidor aplicó el cambio (Status 200):", datosActualizados);
        
        // Sincronizamos el cambio en el DOM
        usuarioActual.name = datosActualizados.name;
        usuarioActual.email = datosActualizados.email;
        renderizarTabla();
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
    }
}

// Inicialización: Ejecutar la lectura de datos apenas cargue el DOM
document.addEventListener('DOMContentLoaded', cargarUsuarios);