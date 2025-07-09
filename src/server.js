import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import {getArticleById, getArticles} from "../services/articlesServices.js";
import favicon from 'serve-favicon';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import {users, addUser, findUserByEmailAndPassword, findUserByEmail} from '../services/usersServices.js';
import passport from "passport";
import { Strategy as LocalStrategy } from 'passport-local';

const PORT = 4000;
const app = express();

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
    (email, password, done) => {
        const user = findUserByEmailAndPassword(email, password);
        if (!user) {
            return done(null, false, { message: 'Неверный email или пароль' });
        }
        return done(null, user);
    }
));

passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser((email, done) => {
    const user = findUserByEmail(email);
    if (user) {
        done(null, user);
    } else {
        done(null, false);
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
    res.render('index');
});

app.get('/articles', requireAuth, (req, res) => {
    const articles = getArticles();
    res.render('articles', { articles } );
})

app.get('/articles/:id', requireAuth, (req, res) => {
    const article = getArticleById(req.params.id);
    if (!article) return res.status(404).send('Article is not found');
    res.render('article', { article });
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

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.send('Name or password are required');
    }
    if (findUserByEmail(email)) {
        return res.send('User is already exist');
    }
    addUser(email, password);
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    const message = req.session.message;
    req.session.message = null;
    res.render('login', { theme: res.locals.theme, message });
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureMessage: true
    })
);

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login');
    });
});



app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})