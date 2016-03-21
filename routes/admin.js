const express       = require('express');
const router        = express.Router();
const bodyParser    = require('body-parser');
const session       = require('express-session');
const config        = require('../config');
const mongoose      = require('mongoose');
const Article       = require('../models/Article');

const administrator = { 
    token: randomString(32),
    username: 'bens',
    password: '14303963'
};

mongoose.connect(config.database.url, function(){
    console.log('INFO connected to database.');
});

router.use( bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 

router.use(session({
        secret: 'ssshhhhh',
        resave: false,
        saveUninitialized: true,
}));

var isLoggedIn = function(req, res, next) {
        if(!req.session.login) {
            res.redirect('/admin');
        } else {
            next();
        }
};

router.use(function (req, res, next) {
    
    res.locals = {
        baseUrl: 'https://mentorpower2016-stuijts.c9users.io',
        message: {
            type: null,
            body: null,
            icon: null
        }  
    };
    
    next();
});

const login_form = function(res, message) {
    res.render('./admin/login',{
        title: 'Administration Area',
        description: 'Administration Area',
        keywords: '',
        author: '',
        breadcrumbs: [
            { name: 'login', url: '/'}, 
        ],
        token: administrator.token,
        message: message
    });
}

const dashboard = function(res, message, extraOptions) {
    var options = {
        title: 'Administration Area Dashboard',
        description: 'Administration Area Dashboard',
        keywords: '',
        author: '',
        breadcrumbs: [
            { name: 'login', url: '/'}, 
            { name: 'dashboard', url: '/dashboard'},
        ],
        token: administrator.token,
        message: message,
        action: null
    }
    for(var opt in extraOptions) {
        options[opt] = extraOptions[opt];
    }
    
    res.render('./admin/dashboard',options)
}

router.get('/', function(req, res){
    login_form(res, null);
});

router.post('/', function(req, res){
    var message = { type: 'warning', body: null, icon: 'exclamation-triangle'};
    if(req.body.token !== administrator.token) {
        message.body = 'Token error';
        login_form(res, message);
    }
    if(!req.body.username || !req.body.password) {
        message.body = 'Please fill in you username and password.';
        login_form(res, message);
    }
    if(req.body.username !== administrator.username) {
        message.body = 'Incorrect Username!';
        login_form(res, message);
    }
    if(req.body.password !== administrator.password) {
        message.body = 'Incorrect Password!';
        login_form(res, message);
    }
    req.session.login = true;
    res.redirect('admin/dashboard');
});

router.get('/dashboard', isLoggedIn, function(req, res){
    var action = req.query.action;
    switch(action) {
        case "ALL_ARTICLES":
            Article.find({}, function(err, articles){
                if(err) {
                    dashboard(res, {type: 'warning', body: 'Error getting all articles from database.', icon: 'exclamation-triangle'}, {action: null });
                    return;
                    
                }  else {
                    dashboard(res, null, {action: action, articles: articles});
                    return;
                }
            });
        break;
        
        default: 
            dashboard(res, null, {action: action});
        break;
    }
});

router.post('/dashboard', isLoggedIn, function(req,res){
    var message = { type: 'warning', body: null, icon: 'exclamation-triangle'};
    if(req.body.token !== administrator.token) {
        message.body = 'Token error';
        dashboard(res, message, req.body.action);
    }
    console.log(req.body);
    var title = req.body.title, subtitle = req.body.subtitle, slug = req.body.slug,
        tags = req.body.tags, author = req.body.author || config.author, 
        image = req.body.image, body = req.body.body;
    if(title == '') {
        message.body = 'A new Article must have a title!';
        dashboard(res, message, req.body.action);
    }
    if(slug == '') {
        message.body = 'A new Article must have a slug!';
        dashboard(res, message, req.body.action);
    }
    // article opslaan...
    var article = new Article();
        article.title = title;
        article.subtitle = subtitle;
        article.slug = slug;
        article.tags = tags;
        article.author = author;
        article.image = image;
        article.body = body;
        article.views = 0;
        article.published = false;
    article.save(function(err){
        if(err) {
            message.body = 'There was a problem saving the article in de database.';
            dashboard(res, message, req.body.action);
        } else {
            message.type = 'success';
            message.body = 'Article was saved in the database';
            message.icon = 'check-square-o';
            dashboard(res, message, 'ALL_ARTICLES');
        }
    });
});

router.get('/logout', function(req, res){
    req.session.login = false;
    res.redirect('/admin');
});

module.exports = router;

function randomString(r){for(var n="",t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",a=0;r>a;a++)n+=t.charAt(Math.floor(Math.random()*t.length));return n}

