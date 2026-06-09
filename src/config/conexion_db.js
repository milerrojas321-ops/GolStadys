
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Configurar dotenv para leer las variables del archivo .env
dotenv.config();

// Crear un pool de conexiones (es más eficiente y rápido que una conexión única)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar la conexión al iniciar el servidor
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ ¡Conexión exitosa a la base de datos golstadys_db!');
        connection.release(); // Liberar la conexión de vuelta al pool
    } catch (error) {
        console.error('❌ Error crítico al conectar a la base de datos:', error.message);
    }
})();

export default pool;