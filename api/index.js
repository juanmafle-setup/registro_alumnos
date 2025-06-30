const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5001;

// API Key ficticia
const API_KEY = '12345ABCDEF';

// Middleware
app.use(cors());
app.use(express.json());

// Archivos de datos
const STUDENTS_FILE = './students.json';
const CAREERS_FILE = './careers.json';
const CATEGORIES_FILE = './categories.json';

// Funciones utilitarias
function loadStudents() {
    try {
        const data = fs.readFileSync(STUDENTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}
function saveStudents(students) {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2));
}
function loadCareers() {
    try {
        const data = fs.readFileSync(CAREERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}
function saveCareers(careers) {
    fs.writeFileSync(CAREERS_FILE, JSON.stringify(careers, null, 2));
}
function loadCategories() {
    try {
        const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}
function saveCategories(categories) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

// Middleware para validar API Key
app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized. Invalid API Key.' });
    }
    next();
});

// ============================
// Endpoints
// ============================

// Registrar nuevo estudiante
app.post('/api/students', (req, res) => {
    const { name, career } = req.body;
    if (!name || !career) {
        return res.status(400).json({ error: "Missing required fields: name and career." });
    }
    const students = loadStudents();
    const newStudentId = students.length ? students[students.length - 1].id + 1 : 1;
    const newStudent = { id: newStudentId, name, career };
    students.push(newStudent);
    saveStudents(students);
    return res.status(201).json({ message: "Student registered successfully.", student: newStudent });
});

// Consultar estudiante por ID
app.get('/api/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const students = loadStudents();
    const student = students.find(s => s.id === id);
    if (!student) {
        return res.status(404).json({ error: "Student not found." });
    }
    return res.status(200).json(student);
});

// Consultar estudiantes por carrera
app.get('/api/students', (req, res) => {
    const career = req.query.career;
    if (!career) {
        return res.status(400).json({ error: "Career filter is required." });
    }
    const students = loadStudents();
    const filtered = students.filter(s => s.career.toLowerCase() === career.toLowerCase());
    return res.status(200).json(filtered);
});

// Eliminar estudiante por ID
app.delete('/api/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let students = loadStudents();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Student not found for deletion." });
    }
    students.splice(index, 1);
    saveStudents(students);
    return res.status(200).json({ message: "Student deleted successfully." });
});

// CRUD para carrera
// Registrar nueva carrera
app.post('/api/careers', (req, res) => {
    const { name, duration, category } = req.body;
    if (!name || !category) {
        return res.status(400).json({ error: "Missing required fields: name and category." });
    }
    const careers = loadCareers();
    const existingCareer = careers.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCareer) {
        return res.status(409).json({ error: "Career already exists." });
    }
    const newCareersId = careers.length ? careers[careers.length - 1].id + 1 : 1;
    const newCareer = {
        id: newCareersId,
        name,
        duration,
        category
    };
    careers.push(newCareer);
    saveCareers(careers);
    return res.status(201).json({ message: "Career registered successfully.", career: newCareer });
});

// Consultar carrera por ID
app.get('/api/careers/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const careers = loadCareers();
    const career = careers.find(c => c.id === id);
    if (!career) {
        return res.status(404).json({ error: "Career not found." });
    }
    return res.status(200).json(career);
});

// Consultar todas las carreras
app.get('/api/careers', (req, res) => {
    const careerName = req.query.name;
    const careers = loadCareers();
    if (careerName) {
        const filteredCareers = careers.filter(c => c.name.toLowerCase() === careerName.toLowerCase());
        return res.status(200).json(filteredCareers);
    }
    return res.status(200).json(careers);
});

// Borrar carrera por ID (y sus estudiantes)
app.delete('/api/careers/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let careers = loadCareers();
    let students = loadStudents();
    const index = careers.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Career not found for deletion." });
    }

    const careerName = careers[index].name;

    // Elimina los estudiantes de esa carrera
    students = students.filter(s => s.career.toLowerCase() !== careerName.toLowerCase());
    saveStudents(students);

    // Elimina la carrera
    careers.splice(index, 1);
    saveCareers(careers);

    return res.status(200).json({ message: "Career and all its students deleted successfully." });
});

// CRUD para categorías de carreras
app.post('/api/categories', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Missing required field: name." });
    }
    const categories = loadCategories();
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
        return res.status(409).json({ error: "Career category already exists." });
    }
    const newCategoryId = categories.length ? categories[categories.length - 1].id + 1 : 1;
    const newCategory = { id: newCategoryId, name };
    categories.push(newCategory);
    saveCategories(categories);
    return res.status(201).json({ message: "Career category registered successfully.", category: newCategory });
});

// Consultar categoría de carrera por ID
app.get('/api/categories/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const categories = loadCategories();
    const category = categories.find(c => c.id === id);
    if (!category) {
        return res.status(404).json({ error: "Career category not found." });
    }
    return res.status(200).json(category);
});

// Consultar todas las categorías de carreras
app.get('/api/categories', (req, res) => {
    const categoryName = req.query.name;
    const categories = loadCategories();
    if (categoryName) {
        const filteredCategories = categories.filter(c => c.name.toLowerCase() === categoryName.toLowerCase());
        return res.status(200).json(filteredCategories);
    }
    return res.status(200).json(categories);
});

// Borrar categoría de carrera por ID (y sus carreras y estudiantes)
app.delete('/api/categories/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let categories = loadCategories();
    let careers = loadCareers();
    let students = loadStudents();

    const categoryIndex = categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
        return res.status(404).json({ error: "Career category not found for deletion." });
    }

    const categoryName = categories[categoryIndex].name;

    // Encuentra las carreras asociadas a la categoría
    const careersToDelete = careers.filter(c => c.category && c.category.toLowerCase() === categoryName.toLowerCase());

    // Elimina los estudiantes de esas carreras
    const careerNamesToDelete = careersToDelete.map(c => c.name.toLowerCase());
    students = students.filter(s => !careerNamesToDelete.includes(s.career.toLowerCase()));
    saveStudents(students);

    // Elimina las carreras asociadas a la categoría
    careers = careers.filter(c => !careerNamesToDelete.includes(c.name.toLowerCase()));
    saveCareers(careers);

    // Elimina la categoría
    categories.splice(categoryIndex, 1);
    saveCategories(categories);

    return res.status(200).json({ message: "Career category and all its careers and students deleted successfully." });
});

// ============================
// Start server
// ============================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});