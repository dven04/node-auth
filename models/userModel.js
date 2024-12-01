const pool = require('../config/connection')


class Users{
    constructor({ id = null, username = null, password = null, email = null } = {}) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
    }

    async fetchUsers(){
        try{
            const sql = 'SELECT * FROM users';
            const [result] = await pool.execute(sql);
            return result;
        }catch(error){
            console.error('Fetching users failed: ', error);
            throw error;
        }
    }

    async getUserByUsername() {
        try {
            const sql = 'SELECT * FROM users WHERE username = ?';
            const [result] = await pool.execute(sql, [this.username]);
            return result; // This returns an array
        } catch (error) {
            console.error('Fetching users failed: ', error);
            throw error;
        }
    }
    

    async save(){
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const sql = 'INSERT INTO users (username, password, email) VALUES (?,?,?)';
            const [result] = await connection.execute(sql, [
                this.username,
                this.password,
                this.email
            ]);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error('Saving user/s failed: ', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateUser(){
        const connection = await pool.getConnection();
        try{
            await connection.beginTransaction();
            const sql = 'UPDATE users SET employee_id = ?, username = ?, password = ? WHERE user_id = ?';
            const [result] = await connection.execute(sql, [
                this.employee_id,
                this.username,
                this.password
            ]);
            await connection.commit();
            return result;
        }catch(error){
            await connection.rollback();
            console.error('Updating user/s failed: ', error);
            throw error;
        }finally{
            connection.release();
        }
    }

    async deleteUser(){
        const connection = await pool.getConnection();
        try{
            await connection.beginTransaction();
            const sql = 'DELETE FROM users WHERE user_id = ?';
            const [result] = await connection.execute(sql, [this.employee_id]);
            await connection.commit();
            return result;
        }catch(error){
            await connection.rollback();
            console.error('Deleting user/s failed: ', error);
            throw error;
        }finally{
            connection.release();
        }
    }


}

module.exports = Users;