# Evaluación Final Módulo 5 - Aplicación de Gestión de Tareas

## Integrantes del Equipo
- María Teresa de la Fuente
- Daniela Garrido Olivares
- Gonzalo Román Reyes

## Repositorio: https://github.com/Daniela-Garrido/Evaluacion-Final-Mod5/tree/Feature/MTeresa

## Descripción del Proyecto
Este proyecto consiste en una aplicación web de gestión de tareas colaborativa, desarrollada con JavaScript moderno.  
Permite a los usuarios registrarse, autenticarse y administrar tareas de manera colaborativa, incluyendo creación, edición, asignación y seguimiento del estado de las tareas.  
La aplicación también simula la persistencia de datos utilizando `localStorage` y realiza cargas iniciales de tareas desde una API simulada.

El desarrollo del proyecto se realizó aplicando los paradigmas solicitados:
- **Orientación a objetos**: para modelar usuarios, tareas y la gestión de la aplicación.
- **Orientación a eventos**: para la interacción con la interfaz mediante formularios y botones.
- **Programación asíncrona**: para la carga de tareas iniciales desde una API simulada mediante `async/await`.

## Funcionalidades
- Registro de usuarios y autenticación simulada.
- Creación, edición y eliminación de tareas.
- Asignación de tareas a usuarios específicos.
- Marcado de tareas como completadas o pendientes.
- Visualización de estadísticas de avance.
- Persistencia de datos en el navegador (`localStorage`).
- Simulación de llamadas a API externa para carga inicial de tareas.

## Tecnologías Utilizadas
- **JavaScript (ES6+)**
- **HTML5**
- **CSS3**
- `localStorage` para almacenamiento local de datos.

## Estructura de Archivos
/Evaluacion-Final-Mod5
│
├─ index.html # Interfaz principal
├─ estyle.css # Estilos de la aplicación
├─ script.js # Lógica de la aplicación (clases, eventos y asíncrono)
└─ README.md # Documentación del proyecto

## Instrucciones de Ejecución
1. Abrir el archivo index.html en un navegador moderno.
2. Interactuar con la aplicación:
    - Registrarse o iniciar sesión.
    - Crear, asignar y administrar tareas.
    - Visualizar estadísticas de avance en tiempo real.