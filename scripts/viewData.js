const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');

function viewUsers() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error al conectar con la base de datos:', err.message);
            return;
        }
        console.log('Conectado a la base de datos SQLite.\n');
    });

    console.log('=== LISTA DE USUARIOS ===');
    
    // Ver todos los usuarios (sin password)
    db.all(`
        SELECT id, nombre, email, edad, fecha_creacion, fecha_actualizacion 
        FROM usuarios 
        ORDER BY fecha_creacion DESC
    `, (err, rows) => {
        if (err) {
            console.error('Error al obtener usuarios:', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('No hay usuarios registrados.');
        } else {
            console.log(`Total de usuarios: ${rows.length}\n`);
            
            rows.forEach((user, index) => {
                console.log(`Usuario #${index + 1}:`);
                console.log(`  ID: ${user.id}`);
                console.log(`  Nombre: ${user.nombre}`);
                console.log(`  Email: ${user.email}`);
                console.log(`  Edad: ${user.edad || 'No especificada'}`);
                console.log(`  Fecha creación: ${user.fecha_creacion}`);
                console.log(`  Fecha actualización: ${user.fecha_actualizacion}`);
                console.log('----------------------------------------');
            });
        }

        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('\nConexión cerrada.');
        });
    });
}

// Ejecutar la función
viewUsers();