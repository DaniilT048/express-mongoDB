import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import {
    createArticle,
    deleteArticleById,
    getArticleById,
    getArticles,
    updateArticleById
} from "../services/articlesServices.js";
import favicon from 'serve-favicon';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import {addUser, findUserByEmailAndPassword, findUserByEmail} from '../services/usersServices.js';
import passport from "passport";
import { Strategy as LocalStrategy } from 'passport-local';
import {dbConnect} from "./db.js";

const PORT = 4000;
const app = express();

async function startServer() {
    try {
        await dbConnect();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(favicon(path.join(__dirname, '../public/favicon.ico')));
app.use(cookieParser());
app.use(cors({
    origin: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express.json());

app.use((req, res, next) => {
    res.locals.theme = req.cookies.theme || 'light';
    next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await findUserByEmailAndPassword(email, password);
            if (!user) {
                return done(null, false, { message: 'Invalid email or password' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
    try {
        const user = await findUserByEmail(email);
        done(null, user || false);
    } catch (err) {
        done(err);
    }
});

function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.message = 'You must login to view the articles';
    res.redirect('/login');
}

app.get('/', (req, res) => {
    res.render('index', { theme: res.locals.theme,  email: req.user?.email || null });
});

app.get('/articles', requireAuth, async (req, res) => {
    try {
        const articles = await getArticles();
        res.render('articles', { articles });
    } catch (err) {
        console.error( err);
        res.status(500).send('Error when receiving articles');
    }
});

app.get('/articles/:id', requireAuth, async (req, res) => {
    try {
        const article = await getArticleById(req.params.id);
        if (!article) return res.status(404).send('Article not found');
        res.render('article', { article });
    } catch (err) {
        console.error('Error when receiving articles', err);
        res.status(500).send('Error server');
    }
});

app.post('/articles', requireAuth, async (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).send('Title and author are required');
    }

    try {
        await createArticle({ title, author });
        res.redirect('/articles');
    } catch (err) {
        console.error('Error creating article:', err);
        res.status(500).send('Server error');
    }
});

app.post('/articles/:id/delete', requireAuth, async (req, res) => {
    try {
        await deleteArticleById(req.params.id);
        res.redirect('/articles');
    } catch (err) {
        console.error('Error deleting article:', err);
        res.status(500).send('Error deleting article');
    }
});

app.get('/articles/:id/edit', requireAuth, async (req, res) => {
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).send('Article not found');
    res.render('editArticle', { article });
});

app.post('/articles/:id/edit', requireAuth, async (req, res) => {
    const { title, author } = req.body;
    try {
        await updateArticleById(req.params.id, { title, author });
        res.redirect('/articles');
    } catch (err) {
        console.error('Error editing article:', err);
        res.status(500).send('Error editing article');
    }
});

app.get('/set-theme/:theme', (req, res) => {
    const { theme } = req.params;

    if (['light', 'dark'].includes(theme)) {
        res.cookie('theme', theme, { maxAge: 7 * 24 * 60 * 60 * 1000 });
        req.session.theme = theme;
    }

    res.redirect(req.get('Referer') || '/' );
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.send('Name or password are required');
    }
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
        return res.send('User is already exist');
    }
    await addUser(email, password);
    res.redirect('/login');
});

app.get('/login',(req, res) => {
    const message = req.session.message;
    req.session.message = null;
    res.render('login', { theme: res.locals.theme, message });
});

app.post('/login', async (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) return next(err);
        if (!user) {
            req.session.message = 'Invalid email or password';
            return res.redirect('/login');
        }
        req.logIn(user, err => {
            if (err) return next(err);
            return res.redirect('/');
        });
    })(req, res, next);
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

startServer();
