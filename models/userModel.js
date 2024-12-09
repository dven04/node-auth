const pool = require('../config/connection');
const bcrypt = require('bcrypt');

class Users {
    constructor({ id = null, username = null, password = null, email = null } = {}) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
    }

    static async getAllUsers() {
        try {
            const sql = 'SELECT * FROM users';
            const [result] = await pool.execute(sql);
            return result;
        } catch (error) {
            console.error('Error fetching all users:', error.message);
            throw error;
        }
    }

    // Find a user by either username (static method)
    static async findByUsername(username) {
        try {
            const sql = 'SELECT * FROM users WHERE username = ?';
            const [result] = await pool.execute(sql, [username]);
            return result.length > 0 ? result[0] : null;  // Return the user or null if not found
        } catch (error) {
            console.error('Error checking if username exists:', error.message);
            throw error;
        }
    }
    // Find a user by email (Static method)
    static async findByUserEmail(email) {
        try {
            const sql = 'SELECT * FROM users WHERE email = ?';
            const [result] = await pool.execute(sql, [email]);
            return result.length > 0 ? result[0] : null;  // Return the user or null if not found
        } catch (error) {
            console.error('Error checking if email exists:', error.message);
            throw error;
        }
    }


    // Find a user by username
    async findByUsername() {
        try {
            const sql = 'SELECT * FROM users WHERE username = ?';
            const [result] = await pool.execute(sql, [this.username]);
            return result.length > 0 ? result[0] : null;  // Return the user or null if not found
        } catch (error) {
            console.error('Error fetching user by username:', error.message);
            throw error;
        }
    }
    // Find a user by email
    async findByUserEmail() {
        try {
            const sql = 'SELECT * FROM users WHERE email = ?';
            const [result] = await pool.execute(sql, [this.email]);
            return result.length > 0 ? result[0] : null;  // Return the user or null if not found
        } catch (error) {
            console.error('Error fetching user by username:', error.message);
            throw error;
        }
    }


    // Find a user by their ID
    async findById() {
        try {
            const sql = 'SELECT * FROM users WHERE id = ?';
            const [result] = await pool.execute(sql, [this.id]);
            return result[0];  // return the first matching user
        } catch (error) {
            console.error('Error fetching user by ID:', error.message);
            throw error;
        }
    }

    // Method to create a new user
    async create() {
        return await withTransaction(async (connection) => {
            const hashedPassword = await bcrypt.hash(this.password, 10); // Hash the password before saving
            const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
            const [result] = await connection.execute(sql, [this.username, hashedPassword, this.email]);
            this.id = result.insertId;  // set the id of the current instance
            return this;  // Return the user instance with the newly created id
        });
    }

    // Method to update an existing user (optional, depending on requirements)
    async update() {
        return await withTransaction(async (connection) => {
            const currentUser = await this.findById();

            let hashedPassword = this.password;
            if (this.password !== currentUser.password) {
                hashedPassword = await bcrypt.hash(this.password, 10);
            }

            const sql = 'UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?';
            const [result] = await connection.execute(sql, [this.username, hashedPassword, this.email, this.id]);
            return result;
        });
    }

    // Method to delete a user by their ID
    async delete() {
        return await withTransaction(async (connection) => {
            const sql = 'DELETE FROM users WHERE id = ?';
            const [result] = await connection.execute(sql, [this.id]);
            return result;  // Return the result of the delete query
        });
    }
}

// Helper function to execute queries with transactions
const withTransaction = async (callback) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = Users;
