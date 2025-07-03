// --- Contenedores de secciones principales ---
const loginSection = document.getElementById('loginSection');
const createUserSection = document.getElementById('createUserSection');
const mainPageSection = document.getElementById('mainPageSection');

// --- Elementos del DOM para el modal de inicio de sesión ---
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const createAccountBtn = document.getElementById('createAccountBtn');

// --- Elementos del DOM para el modal de crear usuario ---
const createUserModal = document.getElementById('createUserModal');
const createUserForm = document.getElementById('createUserForm');

// --- Elementos del DOM para la página principal ---
const newIdeaBtn = document.getElementById('newIdeaBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const imageGallery = document.getElementById('imageGallery');
const loggedInUserDisplay = document.getElementById('loggedInUserDisplay');
const profileAvatarHeader = document.getElementById('profileAvatarHeader');
const totalUsersDisplay = document.getElementById('totalUsersDisplay'); // El span clickeable para abrir la lista
const userCountSpan = document.getElementById('userCount'); // El span que mostrará el número

// --- Elementos del DOM para el modal de nueva idea ---
const newIdeaModal = document.getElementById('newIdeaModal');
const newIdeaForm = document.getElementById('newIdeaForm');
const ideaDescriptionInput = document.getElementById('ideaDescription');

// --- Elementos del DOM para el modal de detalle de imagen ---
const imageDetailModal = document.getElementById('imageDetailModal');
const detailImageName = document.getElementById('detailImageName');
const detailImageDescription = document.getElementById('detailImageDescription');
const detailImage = document.getElementById('detailImage');
const commentsList = document.getElementById('commentsList');
const commentText = document.getElementById('commentText');
const commentingUser = document.getElementById('commentingUser');
const postCommentBtn = document.getElementById('postCommentBtn');
const editIdeaBtn = document.getElementById('editIdeaBtn');
const deleteIdeaBtn = document.getElementById('deleteIdeaBtn');
const likeIdeaBtn = document.getElementById('likeIdeaBtn');
const heartIdeaBtn = document.getElementById('heartIdeaBtn');
const detailLikesCount = document.getElementById('detailLikesCount');
const detailHeartsCount = document.getElementById('detailHeartsCount');

// --- Elementos del DOM para el modal de edición de idea ---
const editIdeaModal = document.getElementById('editIdeaModal');
const editIdeaForm = document.getElementById('editIdeaForm');
const editIdeaNameInput = document.getElementById('editIdeaName');
const editIdeaDescriptionInput = document.getElementById('editIdeaDescription');

// --- Nuevos elementos del DOM para el modal de lista de usuarios ---
const usersListModal = document.getElementById('usersListModal');
const registeredUsersList = document.getElementById('registeredUsersList');

// --- Elemento para los mensajes personalizados ---
const customAlertContainer = document.getElementById('customAlertContainer');


// Variable para el usuario logueado
let loggedInUser = "";
let currentIdeaIndex = null; // Para saber qué idea está abierta en el modal de detalle/edición

// Almacén simple de usuarios (para demostración, en una aplicación real sería una base de datos)
// Incluye avatarURL y ideasPublicadasCount
let users = JSON.parse(localStorage.getItem('users')) || {
    'user': { password: 'pass', avatarURL: 'https://via.placeholder.com/30/007bff/FFFFFF?text=U', ideasPublishedCount: 0 },
    'admin': { password: 'admin', avatarURL: 'https://via.placeholder.com/30/FF5733/FFFFFF?text=A', ideasPublishedCount: 0 }
};

// Cargar ideas guardadas en localStorage o inicializar un array vacío
// Ahora las ideas también tienen 'description', 'likes', 'hearts' y 'author'
let ideas = JSON.parse(localStorage.getItem('ideas')) || [];


// --- Funciones para cambiar secciones ---
function showSection(sectionToShow) {
    const sections = document.querySelectorAll('.section-container');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    sectionToShow.classList.add('active');
}

// --- Función para mostrar mensajes personalizados ---
function showCustomAlert(message, type = 'success', duration = 3000) {
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('custom-alert');
    if (type === 'error') {
        alertDiv.classList.add('error');
    }
    alertDiv.innerHTML = `
        <span>${message}</span>
        <span class="alert-close-btn">&times;</span>
    `;

    customAlertContainer.appendChild(alertDiv);

    alertDiv.querySelector('.alert-close-btn').addEventListener('click', () => {
        alertDiv.remove();
    });

    setTimeout(() => {
        alertDiv.remove();
    }, duration);
}

// --- Función para actualizar el contador de usuarios ---
function updateUsersCount() {
    const numberOfUsers = Object.keys(users).length;
    userCountSpan.textContent = numberOfUsers;
}


// --- Inicialización al cargar la página ---
updateUsersCount(); // Inicializa el contador de usuarios
showSection(loginSection); // **Esto asegura que SIEMPRE inicie en la pantalla de login**

// Comprueba si hay un usuario previamente logueado (solo para actualizar UI, no para saltar login)
loggedInUser = localStorage.getItem('loggedInUser');
if (loggedInUser && users[loggedInUser]) {
    updateHeaderUserInfo(); // Solo actualiza la información en el header si el usuario es válido
} else {
    loggedInUser = ""; // Asegurarse de que no haya usuario "fantasma"
    localStorage.removeItem('loggedInUser'); // Limpiar si la sesión no es válida
}


// --- Funcionalidad del Modal de Inicio de Sesión ---
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    if (users[usernameInput] && users[usernameInput].password === passwordInput) {
        showCustomAlert('¡Inicio de sesión exitoso!', 'success');
        loggedInUser = usernameInput;
        localStorage.setItem('loggedInUser', loggedInUser);
        updateHeaderUserInfo(); // Actualiza el nombre y avatar en el header
        showSection(mainPageSection); // La redirección ocurre SÓLO aquí, después de validar
        renderIdeas(); // Renderiza las ideas al entrar a la página principal
    } else {
        showCustomAlert('Usuario o contraseña incorrectos.', 'error');
    }
});

// --- Maneja el botón de "Crear Usuario" ---
createAccountBtn.addEventListener('click', function() {
    showSection(createUserSection);
});


// --- Funcionalidad del Modal de Crear Usuario ---
createUserForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showCustomAlert('Las contraseñas no coinciden.', 'error');
        return;
    }

    if (users[newUsername]) {
        showCustomAlert('El nombre de usuario ya existe. Por favor, elige otro.', 'error');
        return;
    }

    // Inicializa el nuevo usuario con un avatar por defecto y 0 ideas publicadas
    users[newUsername] = {
        password: newPassword,
        avatarURL: `https://via.placeholder.com/30/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=${newUsername.charAt(0).toUpperCase()}`,
        ideasPublishedCount: 0
    };
    localStorage.setItem('users', JSON.stringify(users));
    updateUsersCount(); // **Actualiza el contador de usuarios después de crear uno nuevo**
    showCustomAlert('¡Usuario creado con éxito! Ahora puedes iniciar sesión.', 'success');

    createUserForm.reset();
    showSection(loginSection);
});

// --- Funcionalidad Común para Cerrar Modales con el botón 'x' ---
document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const modal = event.target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
            // Si se cierra el modal de crear usuario, regresa a la sección de login
            if (modal.id === 'createUserModal') {
                showSection(loginSection);
            }
            // Si se cierra el modal de edición, regresa al modal de detalle si estaba abierto
            if (modal.id === 'editIdeaModal' && currentIdeaIndex !== null) {
                openImageDetail(currentIdeaIndex); // Reabre el modal de detalle
            }
        }
    });
});

// --- Cerrar modales secundarios al hacer clic fuera ---
window.addEventListener('click', (event) => {
    if (event.target === newIdeaModal) {
        newIdeaModal.style.display = 'none';
    }
    if (event.target === imageDetailModal) {
        imageDetailModal.style.display = 'none';
    }
    if (event.target === editIdeaModal) {
        editIdeaModal.style.display = 'none';
        if (currentIdeaIndex !== null) { // Si se cierra la edición, reabrir el detalle
            openImageDetail(currentIdeaIndex);
        }
    }
    if (event.target === usersListModal) { // Cerrar el modal de lista de usuarios
        usersListModal.style.display = 'none';
    }
});


// --- Funcionalidad de la Página Principal ---

// Función para actualizar el nombre de usuario y avatar en el header
function updateHeaderUserInfo() {
    loggedInUserDisplay.textContent = loggedInUser;
    profileAvatarHeader.src = users[loggedInUser] ? users[loggedInUser].avatarURL : 'https://via.placeholder.com/30';
    commentingUser.textContent = `Usuario: ${loggedInUser}`; // También actualiza el nombre en el modal de comentarios
}


// --- Maneja el botón de Cerrar Sesión ---
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    loggedInUser = "";
    showCustomAlert('Sesión cerrada correctamente.', 'success');
    showSection(loginSection); // Vuelve al formulario de inicio de sesión
});

// --- Funcionalidad de Búsqueda ---
searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        const filteredIdeas = ideas.filter(idea =>
            idea.name.toLowerCase().includes(searchTerm) ||
            idea.description.toLowerCase().includes(searchTerm) ||
            idea.author.toLowerCase().includes(searchTerm) // Buscar por autor también
        );
        renderIdeas(filteredIdeas); // Renderiza solo las ideas filtradas
        showCustomAlert(`Mostrando ${filteredIdeas.length} resultados para "${searchTerm}"`, 'info', 2500);
    } else {
        renderIdeas(ideas); // Si el campo está vacío, renderiza todas las ideas
        showCustomAlert('Mostrando todas las ideas.', 'info', 2000); // Tipo 'info' para un mensaje neutro
    }
});

searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        searchBtn.click(); // Simular clic en el botón de búsqueda
    }
    // Si el campo está vacío y la tecla no es Enter, vuelve a mostrar todas las ideas
    if (searchInput.value.trim() === '' && event.key !== 'Enter') {
        renderIdeas(ideas);
    }
});


// Función para renderizar las ideas en la galería
function renderIdeas(ideasToRender = ideas) { // Ahora acepta un argumento para ideas filtradas
    imageGallery.innerHTML = '';
    if (ideasToRender.length === 0 && searchInput.value.trim() !== '') {
        imageGallery.innerHTML = '<p class="no-results-message">No se encontraron ideas que coincidan con su búsqueda.</p>';
        return;
    } else if (ideasToRender.length === 0) {
        imageGallery.innerHTML = '<p class="no-results-message">No hay ideas publicadas aún. ¡Sé el primero en crear una!</p>';
        return;
    }

    ideasToRender.forEach((idea) => { // Eliminado 'index' de aquí, usa ideas.indexOf(idea) para asegurar el índice original
        const card = document.createElement('div');
        card.classList.add('image-card');
        // Usar ideas.indexOf(idea) para referenciar el índice en el array global 'ideas'
        card.dataset.index = ideas.indexOf(idea); 
        card.innerHTML = `
            <img src="${idea.imageUrl}" alt="${idea.name}">
            <div class="card-content">
                <h3>${idea.name}</h3>
                <p class="card-description">${idea.description}</p>
                <div class="card-footer">
                    <span class="author"><i class="fas fa-user"></i> ${idea.author}</span>
                    <div class="card-actions-summary">
                        <span class="card-likes"><i class="fas fa-thumbs-up"></i> ${idea.likes || 0}</span>
                        <span class="card-hearts"><i class="fas fa-heart"></i> ${idea.hearts || 0}</span>
                    </div>
                </div>
            </div>
        `;
        imageGallery.appendChild(card);
        card.addEventListener('click', () => openImageDetail(ideas.indexOf(idea))); // Abre con el índice original
    });
}

newIdeaBtn.addEventListener('click', () => {
    newIdeaModal.style.display = 'flex';
});

newIdeaForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const ideaName = document.getElementById('ideaName').value;
    const ideaDescription = ideaDescriptionInput.value; // Obtener la descripción
    const imageFile = document.getElementById('imageUpload').files[0];

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newIdea = {
                id: Date.now(), // ID único para la idea
                name: ideaName,
                description: ideaDescription, // Guardar la descripción
                imageUrl: e.target.result,
                author: loggedInUser, // Guardar el autor
                likes: 0, // Contadores para la idea
                hearts: 0,
                comments: []
            };
            ideas.push(newIdea);
            localStorage.setItem('ideas', JSON.stringify(ideas));

            // Incrementar el contador de ideas publicadas del usuario
            if (users[loggedInUser]) {
                users[loggedInUser].ideasPublishedCount = (users[loggedInUser].ideasPublishedCount || 0) + 1;
                localStorage.setItem('users', JSON.stringify(users));
            }

            renderIdeas();
            newIdeaModal.style.display = 'none';
            newIdeaForm.reset();
            showCustomAlert('¡Idea guardada exitosamente!', 'success');
        };
        reader.readAsDataURL(imageFile);
    } else {
        showCustomAlert('Por favor, selecciona una imagen para tu idea.', 'error');
    }
});


// --- Funcionalidad del Modal de Detalle de Imagen y Comentarios ---
function openImageDetail(index) {
    currentIdeaIndex = index; // Almacena el índice de la idea actual
    const idea = ideas[index];

    detailImageName.textContent = idea.name;
    detailImageDescription.textContent = idea.description; // Mostrar descripción
    detailImage.src = idea.imageUrl;
    detailImage.alt = idea.name;
    detailLikesCount.textContent = idea.likes || 0; // Mostrar likes de la idea
    detailHeartsCount.textContent = idea.hearts || 0; // Mostrar hearts de la idea

    // Mostrar/ocultar botones de editar/eliminar según el autor
    if (loggedInUser === idea.author) {
        editIdeaBtn.style.display = 'flex'; // Usar flex para mantener los estilos de botón
        deleteIdeaBtn.style.display = 'flex';
    } else {
        editIdeaBtn.style.display = 'none';
        deleteIdeaBtn.style.display = 'none';
    }

    commentsList.innerHTML = '';
    idea.comments.forEach((comment, commentIndex) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="comment-text-wrapper">
                <strong>${comment.user}:</strong> ${comment.text}
            </div>
            <div class="comment-actions">
                <i class="fas fa-thumbs-up" data-type="like" data-idea-index="${index}" data-comment-index="${commentIndex}"></i>
                <span class="count">${comment.likes || 0}</span>
                <i class="fas fa-thumbs-down" data-type="dislike" data-idea-index="${index}" data-comment-index="${commentIndex}"></i>
                <span class="count">${comment.dislikes || 0}</span>
                <i class="fas fa-heart" data-type="heart" data-idea-index="${index}" data-comment-index="${commentIndex}"></i>
                <span class="count">${comment.hearts || 0}</span>
            </div>
        `;
        commentsList.appendChild(li);
    });

    imageDetailModal.dataset.currentIndex = index;
    imageDetailModal.style.display = 'flex';
}

// Delegación de eventos para los íconos de comentarios (likes/dislikes/hearts)
commentsList.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'I' && target.closest('.comment-actions')) {
        const ideaIndex = target.dataset.ideaIndex;
        const commentIndex = target.dataset.commentIndex;
        const type = target.dataset.type;

        if (ideaIndex !== undefined && commentIndex !== undefined && type) {
            const idea = ideas[ideaIndex];
            const comment = idea.comments[commentIndex];

            if (!comment.likes) comment.likes = 0;
            if (!comment.dislikes) comment.dislikes = 0;
            if (!comment.hearts) comment.hearts = 0;

            if (type === 'like') {
                comment.likes++;
            } else if (type === 'dislike') {
                comment.dislikes++;
            } else if (type === 'heart') {
                comment.hearts++;
            }

            localStorage.setItem('ideas', JSON.stringify(ideas));

            const countSpan = target.nextElementSibling;
            if (countSpan && countSpan.classList.contains('count')) {
                if (type === 'like') countSpan.textContent = comment.likes;
                else if (type === 'dislike') countSpan.textContent = comment.dislikes;
                else if (type === 'heart') countSpan.textContent = comment.hearts;
            }
        }
    }
});


// Maneja el botón de "Comentar"
postCommentBtn.addEventListener('click', () => {
    const commentTextValue = commentText.value.trim();
    if (commentTextValue) {
        const currentIndex = imageDetailModal.dataset.currentIndex;
        if (currentIndex !== undefined && loggedInUser) { // Asegurarse de que haya un usuario logueado
            const idea = ideas[currentIndex];
            const newComment = {
                user: loggedInUser,
                text: commentTextValue,
                timestamp: new Date().toISOString(),
                likes: 0,
                dislikes: 0,
                hearts: 0
            };
            idea.comments.push(newComment);
            localStorage.setItem('ideas', JSON.stringify(ideas));

            // Reabrimos el modal de detalle para actualizar la lista de comentarios
            openImageDetail(currentIndex);

            commentText.value = '';
            showCustomAlert('¡Comentario publicado!', 'success', 2000);
        } else if (!loggedInUser) {
            showCustomAlert('Debes iniciar sesión para comentar.', 'error');
        }
    } else {
        showCustomAlert('Por favor, escribe un comentario antes de publicar.', 'error');
    }
});


// --- Funcionalidad de Reacciones en la Idea Principal (Likes/Hearts) ---
likeIdeaBtn.addEventListener('click', () => {
    if (currentIdeaIndex !== null && loggedInUser) {
        const idea = ideas[currentIdeaIndex];
        idea.likes = (idea.likes || 0) + 1;
        localStorage.setItem('ideas', JSON.stringify(ideas));
        detailLikesCount.textContent = idea.likes;
        showCustomAlert('¡Te gusta esta idea!', 'success', 1500);
        renderIdeas(); // Actualizar la galería para que la tarjeta también refleje el cambio
    } else if (!loggedInUser) {
        showCustomAlert('Debes iniciar sesión para reaccionar.', 'error');
    }
});

heartIdeaBtn.addEventListener('click', () => {
    if (currentIdeaIndex !== null && loggedInUser) {
        const idea = ideas[currentIdeaIndex];
        idea.hearts = (idea.hearts || 0) + 1;
        localStorage.setItem('ideas', JSON.stringify(ideas));
        detailHeartsCount.textContent = idea.hearts;
        showCustomAlert('¡Has dado un corazón a esta idea!', 'success', 1500);
        renderIdeas(); // Actualizar la galería
    } else if (!loggedInUser) {
        showCustomAlert('Debes iniciar sesión para reaccionar.', 'error');
    }
});


// --- Funcionalidad de Editar y Eliminar Ideas ---
editIdeaBtn.addEventListener('click', () => {
    if (currentIdeaIndex !== null) {
        const idea = ideas[currentIdeaIndex];
        editIdeaNameInput.value = idea.name;
        editIdeaDescriptionInput.value = idea.description;

        imageDetailModal.style.display = 'none'; // Oculta el modal de detalle
        editIdeaModal.style.display = 'flex'; // Muestra el modal de edición
    }
});

editIdeaForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (currentIdeaIndex !== null) {
        const idea = ideas[currentIdeaIndex];
        idea.name = editIdeaNameInput.value;
        idea.description = editIdeaDescriptionInput.value;

        localStorage.setItem('ideas', JSON.stringify(ideas));
        showCustomAlert('Idea actualizada correctamente.', 'success');
        editIdeaModal.style.display = 'none';
        renderIdeas(); // Actualiza la galería
        openImageDetail(currentIdeaIndex); // Reabre el modal de detalle con la info actualizada
    }
});

deleteIdeaBtn.addEventListener('click', () => {
    if (currentIdeaIndex !== null && confirm('¿Estás seguro de que quieres eliminar esta idea? Esta acción no se puede deshacer.')) {
        const idea = ideas[currentIdeaIndex];
        const author = idea.author;

        ideas.splice(currentIdeaIndex, 1); // Elimina la idea del array
        localStorage.setItem('ideas', JSON.stringify(ideas));

        // Decrementar el contador de ideas publicadas del usuario
        if (users[author]) {
            users[author].ideasPublishedCount = Math.max(0, (users[author].ideasPublishedCount || 0) - 1);
            localStorage.setItem('users', JSON.stringify(users));
        }

        showCustomAlert('Idea eliminada correctamente.', 'success');
        imageDetailModal.style.display = 'none'; // Cierra el modal de detalle
        renderIdeas(); // Vuelve a renderizar la galería
        currentIdeaIndex = null; // Reinicia el índice actual
    }
});


// --- Funcionalidad de la Lista de Usuarios (Nuevo) ---

// Event listener para el clic en el número de usuarios
totalUsersDisplay.addEventListener('click', () => {
    // Limpia la lista antes de volver a llenarla
    registeredUsersList.innerHTML = '';

    // Obtiene los nombres de usuario y los ordena alfabéticamente
    const userNames = Object.keys(users).sort((a, b) => a.localeCompare(b));

    if (userNames.length === 0) {
        const li = document.createElement('li');
        li.textContent = "No hay usuarios registrados aún.";
        registeredUsersList.appendChild(li);
    } else {
        userNames.forEach(username => {
            const user = users[username];
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${user.avatarURL}" alt="Avatar de ${username}" class="user-avatar-small">
                <span>${username}</span>
                <span class="user-idea-count">${user.ideasPublishedCount || 0} ideas</span>
            `;
            registeredUsersList.appendChild(li);
        });
    }

    // Muestra el modal
    usersListModal.style.display = 'flex';
});