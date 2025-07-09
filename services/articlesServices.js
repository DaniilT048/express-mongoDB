import { dbConnect } from '../db.js';
import { ObjectId } from 'mongodb';

export async function getArticles() {
    const db = await dbConnect();
    const articlesCollection = db.collection('articles');
    return await articlesCollection.find().toArray();
}

export async function getArticleById(id) {
    const db = await dbConnect();
    if (!ObjectId.isValid(id)) {
        return null;
    }
    const articlesCollection = db.collection('articles');
    return await articlesCollection.findOne({ _id: new ObjectId(id) });
}