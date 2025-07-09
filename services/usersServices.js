export const users = [];

export function addUser(email, password) {
    users.push({ email, password });
}

export function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

export function findUserByEmailAndPassword(email, password) {
    return users.find(u => u.email === email && u.password === password);
}