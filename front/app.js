const API_URL = "http://localhost:5001/api/students";
const CAREERS_API_URL = "http://localhost:5001/api/careers";
const CATEGORIES_API_URL = "http://localhost:5001/api/categories";

const API_KEY = "12345ABCDEF";

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`
};

// --- ESTUDIANTES ---

async function registerStudentService(name, career) {
    //realiza una peticion post a la api enviandole el nombre y carrera del estudiante, ingresados en index.html, como el cuerpo de la peticion para poder registrarlo en la base de datos o archivo .json
    const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, career })
    });
    return response.json();
}

async function getStudentByIdService(id) {
    //realiza una peticion get a la api (donde el ID es el identificador del estudiante) para obtener los datos del estudiante en especifico desde  la api
    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers
    });
    return response.json();
}

async function getStudentsByCareerService(career) {
    //realiza una peticion get a la api (donde la carrera es el filtro) para obtener todos los estudiantes que pertenecen a esa carrera desde la api
    const response = await fetch(`${API_URL}?career=${career}`, {
        method: "GET",
        headers
    });
    return response.json();
}

async function deleteStudentService(id) {
    //le envia una peticion delete a la api (donde el ID es el identificador del estudiante) para eliminar al estudiante de la base de datos o archivo .json
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers
    });
    return response.json();
}

// --- FUNCIONES INTERMEDIAS PARA ESTUDIANTES ---

async function registerStudent() {
    //funcion intermedia que se encarga de recoger los datos del formulario de registro de estudiantes ingresados en el index.html, valida los datos/campos y llama a registerStudentService para enviar la informacion a la api para luego mostrar el resultado en la interfaz del usuario
    const name = document.getElementById('registerName').value.trim();
    const career = document.getElementById('careerFilterRegister').value;
    const resultContainer = document.getElementById('registerResult');

    if (!name || !career) {
        resultContainer.innerHTML = '<div class="alert alert-danger">Por favor complete todos los campos.</div>';
        return;
    }

    try {
        const result = await registerStudentService(name, career);
        if (result.error) {
            resultContainer.innerHTML = `<div class="alert alert-danger">${result.error}</div>`;
        } else {
            resultContainer.innerHTML = `<div class="alert alert-success">Estudiante registrado correctamente. ID: ${result.student.id}</div>`;
            document.getElementById('registerName').value = '';
            document.getElementById('careerFilterRegister').value = '';
        }
    } catch (error) {
        resultContainer.innerHTML = '<div class="alert alert-danger">Error al registrar estudiante.</div>';
        console.error(error);
    }
}

async function getStudentById() {
    // funcion intermedia que se encarga de recoger el ID del estudiante ingresado en el formulario de busqueda por ID, valida el ID y llama a getStudentByIdService para obtener los datos del estudiante desde la api, luego muestra el resultado en la interfaz del usuario
    const id = document.getElementById('studentId').value.trim();
    const resultContainer = document.getElementById('getResult');
    if (!id) {
        resultContainer.innerHTML = '<div class="alert alert-danger">Ingrese un ID válido.</div>';
        return;
    }
    try {
        const student = await getStudentByIdService(id);
        if (student.error) {
            resultContainer.innerHTML = `<div class="alert alert-danger">${student.error}</div>`;
        } else {
            resultContainer.innerHTML = `<div class="alert alert-info"><strong>ID:</strong> ${student.id}<br><strong>Nombre:</strong> ${student.name}<br><strong>Carrera:</strong> ${student.career}</div>`;
        }
    } catch (error) {
        resultContainer.innerHTML = '<div class="alert alert-danger">Error al buscar estudiante.</div>';
        console.error(error);
    }
}

async function getStudentsByCareer() {
    //funcion intermedia que se encarga de recoger la carrera seleccionada en el formulario de busqueda por carrera, valida la carrera y llama a getStudentsByCareerService para obtener los estudiantes de esa carrera desde la api, luego muestra el resultado en la interfaz del usuario
    const career = document.getElementById('careerFilterSearch').value;
    const resultContainer = document.getElementById('careerResult');
    if (!career) {
        resultContainer.innerHTML = '<div class="alert alert-danger">Seleccione una carrera.</div>';
        return;
    }
    try {
        const students = await getStudentsByCareerService(career);
        if (!students || students.length === 0) {
            resultContainer.innerHTML = '<div class="alert alert-warning">No se encontraron estudiantes en esta carrera.</div>';
            return;
        }
        resultContainer.innerHTML = students.map(student => `
            <div class="card mb-2">
                <div class="card-body">
                    <h5 class="card-title">${student.name}</h5>
                    <p class="card-text"><strong>ID:</strong> ${student.id}<br><strong>Carrera:</strong> ${student.career}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        resultContainer.innerHTML = '<div class="alert alert-danger">Error al buscar estudiantes.</div>';
        console.error(error);
    }
}

async function deleteStudent() {
    //funcion intermedia que se encarga de recoger el ID del estudiante ingresado en el formulario de eliminacion, valida el ID y llama a deleteStudentService para eliminar al estudiante desde la api, luego muestra el resultado en la interfaz del usuario
    const id = document.getElementById('deleteId').value.trim();
    const resultContainer = document.getElementById('deleteResult');
    if (!id) {
        resultContainer.innerHTML = '<div class="alert alert-danger">Ingrese un ID válido.</div>';
        return;
    }
    try {
        const result = await deleteStudentService(id);
        if (result.error) {
            resultContainer.innerHTML = `<div class="alert alert-danger">${result.error}</div>`;
        } else {
            resultContainer.innerHTML = `<div class="alert alert-success">Estudiante eliminado correctamente.</div>`;
            document.getElementById('deleteId').value = '';
        }
    } catch (error) {
        resultContainer.innerHTML = '<div class="alert alert-danger">Error al eliminar estudiante.</div>';
        console.error(error);
    }
}

async function showAllStudents() {
    //funcion intermedia que se encarga de obtener todos los estudiantes registrados, llama a getAllCareersService para obtener las carreras y luego a getStudentsByCareerService para obtener los estudiantes de cada carrera, luego muestra el resultado en la interfaz del usuario
    const resultContainer = document.getElementById('allStudentsResult');
    try {
        const careers = await getAllCareersService();
        let allStudents = [];
        for (const career of careers) {
            const students = await getStudentsByCareerService(career.name);
            if (Array.isArray(students)) {
                allStudents = allStudents.concat(students);
            }
        }
        // Eliminar duplicados por ID
        const uniqueStudents = [];
        const ids = new Set();
        for (const student of allStudents) {
            if (!ids.has(student.id)) {
                uniqueStudents.push(student);
                ids.add(student.id);
            }
        }
        if (uniqueStudents.length === 0) {
            resultContainer.innerHTML = '<div class="alert alert-info">No hay estudiantes registrados</div>';
            return;
        }
        let htmlContent = '';
        for (const student of uniqueStudents) {
            htmlContent += `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5>${student.name}</h5>
                        <p>ID: ${student.id} | Carrera: ${student.career}</p>
                    </div>
                </div>
            `;
        }
        resultContainer.innerHTML = htmlContent;
    } catch (error) {
        resultContainer.innerHTML = `<div class="alert alert-danger">Error al cargar estudiantes: ${error.message}</div>`;
        console.error(error);
    }
}

// --- CARRERAS ---

async function getAllCareersService() {
    //realiza una peticion get a la api para obtener todas las carreras registradas en la base de datos o archivo .json
    const response = await fetch(CAREERS_API_URL, {
        method: "GET",
        headers
    });
    return response.json();
}

async function getCareerByIdService(id) {
    //realiza una peticion get a la api (donde el ID es el identificador de la carrera) para obtener los datos de la carrera en especifico desde la api
    const response = await fetch(`${CAREERS_API_URL}/${id}`, {
        method: "GET",
        headers
    });
    return response.json();
}

async function registerCareerService(name, duration, category) {
    //realiza una peticion post a la api enviandole el nombre, duracion y categoria de la carrera, ingresados en carreras.html, como el cuerpo de la peticion para poder registrarla en la base de datos o archivo .json
    const response = await fetch(CAREERS_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, duration, category })
    });
    return response.json();
}

async function deleteCareerService(id) {
    //le envia una peticion delete a la api (donde el ID es el identificador de la carrera) para eliminar la carrera de la base de datos o archivo .json
    const response = await fetch(`${CAREERS_API_URL}/${id}`, {
        method: "DELETE",
        headers
    });
    return response.json();
}

// --- FUNCIONES INTERMEDIAS PARA CARRERAS ---

async function addCareer() {
    //funcion intermedia que se encarga de recoger los datos del formulario de registro de carreras ingresados en carreras.html, valida los datos/campos y llama a registerCareerService para enviar la informacion a la api para luego poder mostrar el resultado en la interfaz del usuario
    const name = document.getElementById("newCareer").value.trim();
    const category = document.getElementById("categorySelect").value;
    const msg = document.getElementById("addCareerMsg");

    if (!name || !category) {
        msg.innerHTML = '<div class="alert alert-danger">Debes ingresar un nombre y seleccionar una categoría.</div>';
        return;
    }

    try {
        await registerCareerService(name, "4 años", category);
        msg.innerHTML = '<div class="alert alert-success">Carrera añadida exitosamente.</div>';
        document.getElementById("newCareer").value = "";
        document.getElementById("categorySelect").value = "";
        await loadCareersForDelete();
    } catch (error) {
        msg.innerHTML = '<div class="alert alert-danger">Error al añadir carrera.</div>';
        console.error("Error al añadir carrera:", error);
    }
}

async function searchCareerById() {
    //funcion intermedia que se encarga de recoger el ID de la carrera ingresado en el formulario de busqueda por ID, valida el ID y llama a getCareerByIdService para obtener los datos de la carrera desde la api, luego muestra el resultado en la interfaz del usuario
    const id = document.getElementById('careerIdSearch').value.trim();
    const resultContainer = document.getElementById('careerSearchResult');
    if (!id) {
        resultContainer.innerHTML = '<div class="alert alert-danger">Ingrese un ID válido.</div>';
        return;
    }
    try {
        const career = await getCareerByIdService(id);
        if (career.error) {
            resultContainer.innerHTML = `<div class="alert alert-danger">${career.error}</div>`;
        } else {
            resultContainer.innerHTML = `
                <div class="alert alert-info">
                    <strong>ID:</strong> ${career.id}<br>
                    <strong>Nombre:</strong> ${career.name}<br>
                    <strong>Categoría:</strong> ${career.category}
                </div>
            `;
        }
    } catch (error) {
        resultContainer.innerHTML = '<div class="alert alert-danger">Error al buscar carrera.</div>';
        console.error(error);
    }
}

async function loadCategoriesForCareers() {
    // esta funcion intermedia llama a getAllCategoriesService para obtener todas las categorias registradas en la base de datos o archivo .json y luego las carga en el select de categorias en carreras.html
    const select = document.getElementById('categorySelect');
    if (select) {
        try {
            const categories = await getAllCategoriesService();
            select.innerHTML = '<option value="">Categoría</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    }
}

async function loadCareersForDelete() {
    // esta funcion intermedia llama a getAllCareersService para obtener todas las carreras registradas en la base de datos o archivo .json y luego las carga en el select de carreras en carreras.html para poder eliminarlas
    const select = document.getElementById('deleteCareerSelect');
    if (select) {
        try {
            const careers = await getAllCareersService();
            select.innerHTML = '<option value="">Seleccione una carrera</option>';
            careers.forEach(career => {
                const option = document.createElement('option');
                option.value = career.id;
                option.textContent = career.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar carreras para eliminar:', error);
        }
    }
}

async function deleteCareer() {
    //funcion intermedia que se encarga de recoger el ID de la carrera seleccionada en el formulario de eliminacion, valida el ID y llama a deleteCareerService para eliminar la carrera desde la api, luego muestra el resultado en la interfaz del usuario
    const select = document.getElementById('deleteCareerSelect');
    const msg = document.getElementById('deleteCareerResult');
    const id = select ? select.value : null;
    if (!id) {
        msg.innerHTML = '<div class="alert alert-danger">Seleccione una carrera para eliminar.</div>';
        return;
    }
    try {
        const result = await deleteCareerService(id);
        if (result.error) {
            msg.innerHTML = `<div class="alert alert-danger">${result.error}</div>`;
        } else {
            msg.innerHTML = '<div class="alert alert-success">Carrera eliminada exitosamente.</div>';
            await loadCareersForDelete();
        }
    } catch (error) {
        msg.innerHTML = '<div class="alert alert-danger">Error al eliminar carrera.</div>';
        console.error("Error al eliminar carrera:", error);
    }
}

async function showAllCareers() {
    //funcion intermedia que se encarga de obtener todas las carreras registradas, llama a getAllCareersService para obtener todas las carreras y luego muestra todos sus nombres y categorias en la interfaz del usuario
    const resultContainer = document.getElementById('allCareersResult');
    try {
        const careers = await getAllCareersService();
        if (!careers || careers.length === 0) {
            resultContainer.innerHTML = '<div class="alert alert-info">No hay carreras registradas</div>';
            return;
        }
        let htmlContent = '';
        for (const career of careers) {
            htmlContent += `
                <div class="card mb-2">
                    <div class="card-body">
                        <h5 class="card-title">${career.name}</h5>
                        <p class="card-text">
                            <strong>Categoría:</strong> ${career.category ? career.category : '<span class="text-muted">Sin categoría</span>'}
                        </p>
                    </div>
                </div>
            `;
        }
        resultContainer.innerHTML = htmlContent;
    } catch (error) {
        resultContainer.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar carreras: ${error.message}
            </div>
        `;
        console.error("Error en showAllCareers:", error);
    }
}

// --- CATEGORÍAS ---

async function getAllCategoriesService() {
    //realiza una peticion get a la api para obtener todas las categorias registradas en la base de datos o archivo .json
    const response = await fetch(CATEGORIES_API_URL, {
        method: "GET",
        headers
    });
    return response.json();
}

async function registerCategoryService(name) {
    //realiza una peticion post a la api enviandole el nombre de la categoria, ingresado en categorias.html, como el cuerpo de la peticion para poder registrarla en la base de datos o archivo .json
    const response = await fetch(CATEGORIES_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ name })
    });
    return response.json();
}

async function getCategoryByIdService(id) {
    //realiza una peticion get a la api (donde el ID es el identificador de la categoria) para obtener los datos de la categoria en especifico desde la api
    const response = await fetch(`${CATEGORIES_API_URL}/${id}`, {
        method: "GET",
        headers
    });
    return response.json();
}

async function deleteCategoryService(id) {
    //le envia una peticion delete a la api (donde el ID es el identificador de la categoria) para eliminar la categoria de la base de datos o archivo .json
    const response = await fetch(`${CATEGORIES_API_URL}/${id}`, {
        method: "DELETE",
        headers
    });
    return response.json();
}   


async function searchCategoryById() {
    //funcion intermedia que se encarga de recoger el ID de la categoria ingresado en el formulario de busqueda por ID, valida el ID y llama a getCategoryByIdService para obtener los datos de la categoria desde la api, luego muestra el resultado en la interfaz del usuario
        const id = document.getElementById('categoryIdSearch').value.trim();
        const resultContainer = document.getElementById('categorySearchResult');
            if (!id) {
                resultContainer.innerHTML = '<div class="alert alert-danger">Ingrese un ID válido.</div>';
                return;
            }
            try {
            const category = await getCategoryByIdService(id);
            if (category.error) {
                resultContainer.innerHTML = `<div class="alert alert-danger">${category.error}</div>`;
            } else {
                resultContainer.innerHTML = `
                    <div class="alert alert-info">
                        <strong>ID:</strong> ${category.id}<br>
                        <strong>Nombre:</strong> ${category.name}
                    </div>
                `;
            }
     } catch (error) {
            resultContainer.innerHTML = '<div class="alert alert-danger">Error al buscar categoría.</div>';
            console.error(error);
     }
}

async function addCategory() {
    //funcion intermedia que se encarga de recoger el nombre de la categoria ingresado en el formulario de registro de categorias, valida el nombre y llama a registerCategoryService para enviar la informacion a la api para luego poder mostrar el resultado en la interfaz del usuario
    const name = document.getElementById("newCategory").value.trim();
    const msg = document.getElementById("addCategoryMsg");

    if (!name) {
        msg.innerHTML = '<div class="alert alert-danger">Debes ingresar un nombre de categoría.</div>';
        return;
    }

    try {
        const result = await registerCategoryService(name);
        if (result.error) {
            msg.innerHTML = `<div class="alert alert-danger">${result.error}</div>`;
        } else {
            msg.innerHTML = '<div class="alert alert-success">Categoría añadida exitosamente.</div>';
            document.getElementById("newCategory").value = "";
            await loadCategoriesForDelete();
        }
    } catch (error) {
        msg.innerHTML = '<div class="alert alert-danger">Error al añadir categoría.</div>';
        console.error("Error al añadir categoría:", error);
    }
}

async function loadCategoriesForDelete() {
    // esta funcion intermedia llama a getAllCategoriesService para obtener todas las categorias registradas en la base de datos o archivo .json y luego las carga en el select de categorias en categorias.html para poder eliminarlas
    const select = document.getElementById('deleteCategorySelect');
    if (select) {
        try {
            const categories = await getAllCategoriesService();
            select.innerHTML = '<option value="">Seleccione una categoría</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar categorías para eliminar:', error);
        }
    }
}

async function deleteCategory() {
    //funcion intermedia que se encarga de recoger el ID de la categoria seleccionada en el formulario de eliminacion, valida el ID y llama a deleteCategoryService para eliminar la categoria desde la api, luego muestra el resultado en la interfaz del usuario
    const select = document.getElementById('deleteCategorySelect');
    const msg = document.getElementById('deleteCategoryResult');
    const id = select ? select.value : null;
    if (!id) {
        msg.innerHTML = '<div class="alert alert-danger">Seleccione una categoría para eliminar.</div>';
        return;
    }
    try {
        const result = await deleteCategoryService(id);
        if (result.error) {
            msg.innerHTML = `<div class="alert alert-danger">${result.error}</div>`;
        } else {
            msg.innerHTML = '<div class="alert alert-success">Categoría eliminada exitosamente.</div>';
            await loadCategoriesForDelete();
        }
    } catch (error) {
        msg.innerHTML = '<div class="alert alert-danger">Error al eliminar categoría.</div>';
        console.error("Error al eliminar categoría:", error);
    }
}

// --- INICIALIZACIÓN DE SELECTS ---

document.addEventListener('DOMContentLoaded', () => {
    // Para registro de estudiante
    //Carga las carreras guardadas en el archivo .json, que fueron registradas en carreras.html y las disponibiliza en el select de carreras del formulario de registro de estudiantes en index.html
    const careerRegisterSelect = document.getElementById('careerFilterRegister');
    if (careerRegisterSelect) {
        getAllCareersService().then(careers => {
            careerRegisterSelect.innerHTML = '<option value="">Seleccione una carrera</option>';
            careers.forEach(career => {
                const option = document.createElement('option');
                option.value = career.name;
                option.textContent = career.name;
                careerRegisterSelect.appendChild(option);
            });
        }).catch(error => {
            console.error('Error al cargar carreras para registro:', error);
        });
    }

    // Para búsqueda de estudiante por carrera
    //Carga las carreras guardadas en el archivo .json, que fueron registradas en carreras.html y las disponibiliza en el select de carreras del formulario de busqueda de estudiantes por carrera en index.html
    const careerSearchSelect = document.getElementById('careerFilterSearch');
    if (careerSearchSelect) {
        getAllCareersService().then(careers => {
            careerSearchSelect.innerHTML = '<option value="">Seleccione una carrera</option>';
            careers.forEach(career => {
                const option = document.createElement('option');
                option.value = career.name;
                option.textContent = career.name;
                careerSearchSelect.appendChild(option);
            });
        }).catch(error => {
            console.error('Error al cargar carreras para búsqueda:', error);
        });
    }

    // Para carrera.html
    if (typeof loadCategoriesForCareers === "function") loadCategoriesForCareers();
    // Carga las categorias guardadas en el archivo .json, que fueron registradas en categorias.html y las disponibiliza en el select de categorias del formulario de registro de carreras en carreras.html
    if (typeof loadCareersForDelete === "function") loadCareersForDelete();
    // Carga las carreras guardadas en el archivo .json, que fueron registradas en carreras.html y las disponibiliza en el select de carreras del formulario de eliminacion de carreras en carreras.html
    
    // Para categorias.html
    if (typeof loadCategoriesForDelete === "function") loadCategoriesForDelete();
    // Carga las categorias guardadas en el archivo .json, que fueron registradas en categorias.html y las disponibiliza en el select de categorias del formulario de eliminacion de categorias en categorias.html
});

// --- FLUJO DE EVENTOS ---

// el flujo de eventos se encarga de recoger los eventos o datos ingresados por el usuario en los formularios de index.html, carreras.html y categorias.html, y llama a las funciones intermedias correspondientes para realizar las acciones deseadas (registro, busqueda, eliminacion, etc.) en app.js
// las funciones intermedias luego llaman a los servicios correspondientes para interactuar con la API y obtener, ingresar, eliminar o editar los datos en la base de datos o archivo .json
// por ultimo la api devuelve los resultados actualizaddos o los errores correspondientes a las acciones realizadas por el usuario y las funciones intermedias muestran los resultados en la interfaz del usuario, osea en el index.html, carreras.html o categorias.html.