const express       = require('express');
const router        = express.Router();
const bodyParser    = require('body-parser');
const session       = require('express-session');

const administrator = { 
    token: randomString(32),
    username: 'bens',
    password: '14303963'
};

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
            res.redirect('/');
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

const dashboard = function(res, message) {
    res.render('./admin/dashboard',{
        title: 'Administration Area Dashboard',
        description: 'Administration Area Dashboard',
        keywords: '',
        author: '',
        breadcrumbs: [
            { name: 'login', url: '/'}, 
            { name: 'dashboard', url: '/dashboard'},
        ],
        token: administrator.token,
        message: message
    });
}

router.get('/', function(req, res){
    login_form(res, null);
});

router.post('/', function(req, res){
    var type = 'warning', icon = 'exclamation-triangle';
    var message = { type: 'warning', body: null, icon: 'exclamation-triangle'};
    if(req.body.token !== administrator.token) {
        message.body = 'Token error'.
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
    dashboard(res, null);
});

router.get('/logout', function(req, res){
    req.session.login = false;
    res.redirect('/admin');
});

module.exports = router;

function randomString(r){for(var n="",t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",a=0;r>a;a++)n+=t.charAt(Math.floor(Math.random()*t.length));return n}