const articles = [
    {
        "id": 1,
        "title": "How to handle state in React. The missing FAQ.",
        "author": "Osmel Mora",
        "url": "https://medium.com/react-ecosystem/how-to-handle-state-in-react-6f2d3cd73a0c"
    },
    {
        "id": 2,
        "title": "You might not need React Router",
        "author": "Konstantin Tarkus",
        "url": "https://medium.freecodecamp.com/you-might-not-need-react-router-38673620f3d"
    },
    {
        "id": 3,
        "title": "Mixins Considered Harmful",
        "author": "Dan Abramov",
        "url": "https://facebook.github.io/react/blog/2016/07/13/mixins-considered-harmful.html"
    },
    {
        "id": 4,
        "title": "React Design Principles",
        "author": "Dan Abramov",
        "url": "https://facebook.github.io/react/contributing/design-principles.html"
    },
    {
        "id": 5,
        "title": "Don't use .bind() when passing props",
        "author": "Dave Ceddia",
        "url": "https://daveceddia.com/avoid-bind-when-passing-props/"
    }
]

export const getArticles = () => {
    return articles;
}

export const getArticleById = (id) => {
    return articles.find(article => article.id === Number(id));
}