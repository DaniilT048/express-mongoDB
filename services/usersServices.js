import { db } from '../src/db.js';

export async function findUserByEmail(email) {
    const users = db.collection('users');
    return await users.findOne({ email });
}

export async function findUserByEmailAndPassword(email, password) {
    const users = db.collection('users');
    return await users.findOne({ email, password });
}

export async function addUser(email, password) {
    const users = db.collection('users');
    return await users.insertOne({ email, password });
}