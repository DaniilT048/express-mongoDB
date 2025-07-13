import {db } from '../src/db.js';
import { ObjectId } from 'mongodb';

export async function getArticles() {
    const articlesCollection = db.collection('articles');
    return await articlesCollection.find().toArray();
}

export async function getArticleById(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    const articlesCollection = db.collection('articles');
    return await articlesCollection.findOne({ _id: new ObjectId(id) });
}

export async function createArticle({ title, author }) {
    const articlesCollection = db.collection('articles');
    return await articlesCollection.insertOne({ title, author });
}

export async function deleteArticleById(id) {
    if (!ObjectId.isValid(id)) return null;
    const articlesCollection = db.collection('articles');
    return await articlesCollection.deleteOne({ _id: new ObjectId(id) });
}

export async function updateArticleById(id, { title, author }) {
    if (!ObjectId.isValid(id)) return null;
    const articlesCollection = db.collection('articles');
    return await articlesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { title, author } }
    );
}