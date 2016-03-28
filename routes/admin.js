const express       = require('express');
const router        = express.Router();
const bodyParser    = require('body-parser');
const session       = require('express-session');
const config        = require('../config');
const mongoose      = require('mongoose');
const Article       = require('../models/Article');
const Image         = require('../models/Image');

const multer        = require('multer');
const path          = require('path');
const crypto        = require('crypto');

var storage = multer.diskStorage({
  destination: './public/images/uploads/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err);

      cb(null, raw.toString('hex') + path.extname(file.originalname));
    });
  }
});

const administrator = config.administrator;
    administrator.token = randomString(32);


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
        baseUrl: config.baseUrl,
        message: {
            type: null,
            body: null,
            icon: null
        },
        url: req.url
    };
    
    next();
});



var admin_params = {
    title: 'Administration Area',
    description: 'Administration Area',
    keywords: '',
    author: config.author,
    breadcrumbs: [],
    token: administrator.token,
    message: null,
    action: null,
    articles: null,
    images: null,
    add: function(extra) {
        for(var opt in extra) {
            this[opt] = extra[opt];
        }
        return this;
    }
};

const login_form = function(res, extra) {
    res.render('./administration/login', admin_params.add(extra));
};
const dashboard = function(res, extra) {
    if(res.message) {
        admin_params.message = 
            res.message;
    }
    Article._read({}, {}, {
        sort: {
            createdAt: -1
        }
    })
        .then(function(articles){
            admin_params.articles = articles;
            res.render('./administration/dashboard',admin_params.add(extra));
        });
    };
const images = function(res, extra) {
    
    Image._read({})
        .then(function(result){
            admin_params.images = result;
            res.render('./admin/images',admin_params.add(extra));
        })
        .catch(function(error){
            admin_params['message'] = {type: 'warning', body: 'Error getting all images from database.', icon: 'exclamation-triangle' };
            res.render('./admin/images',admin_params);
        });
};
const imagelist = function(res, extra) {
    
    Image._read({})
        .then(function(result){
            admin_params.images = result;
            res.render('./admin/image_list',admin_params.add(extra));
        })
        .catch(function(error){
            admin_params['message'] = {type: 'warning', body: 'Error getting all images from database.', icon: 'exclamation-triangle' };
            res.render('./admin/image_list',admin_params);
        });

};

router.get('/', function(req, res){
    login_form(res, null);
});

router.post('/', function(req, res){
    var message = { type: 'warning', body: null, icon: 'exclamation-triangle'};
    if(req.body.token !== administrator.token) {
        message.body = 'Token error';
        login_form(res, {message: message});
    }
    if(!req.body.username || !req.body.password) {
        message.body = 'Please fill in you username and password.';
        login_form(res, {message: message});
    }
    if(req.body.username !== administrator.username) {
        message.body = 'Incorrect Username!';
        login_form(res, {message: message});
    }
    if(req.body.password !== administrator.password) {
        message.body = 'Incorrect Password!';
        login_form(res, {message: message});
    }
    req.session.login = true;
    res.redirect('admin/dashboard');
});

router.get('/dashboard', isLoggedIn, function(req, res){
    var action = req.query.action || 'ALL_ARTICLES';
    res.message = { type: 'info', body: 'Welcome ' };
    
    switch(action) {
        case 'NONE':
        case 'ALL_ARTICLES':
            dashboard(res, {action: 'ALL_ARTICLES'});
        break;
        
        case 'CREATE_ARTICLE':
            dashboard(res, {action: 'CREATE_ARTICLE'});
        break;
        
        case 'EDIT_ARTICLE':
            
            Article.findOne({_id: req.query.id}, function(err, article){
                if(err) {
                    
                } else {
                    dashboard(res, {
                        _id: article._id,
                        title: article.title,
                        subtitle: article.subtitle,
                        slug: article.slug,
                        tags: article.tags,
                        author: article.author,
                        image: article.image,
                        body: article.body,
                        action: 'EDIT_ARTICLE'
                    });
                }
            });
            
        break;
        
        case 'PUBLISH_ARTICLE':
            var message;
            Article.publish(req.query.id, function(error){
                if(error) {
                    message = { type: 'error', body: error };
                } else {
                    message = { type: 'success', body: 'Article is published on website'};
                }
                dashboard(res, {message: message});
            });
            
        break;
        
        case 'MUTE_ARTICLE':
            var message;
            Article.mute(req.query.id, function(error){
                if(error) {
                    message = { type: 'error', body: error };
                } else {
                    message = { type: 'success', body: 'Article is muted.'};
                }
                dashboard(res, {message: message});
            });
            
        break;
        
        case 'DELETE_ARTICLE':
            console.log('deleting article');
            var message;
            Article._deleteById(req.query.id)
                .then(function(result){
                    message = { type: 'success', body: 'Article was deleted from database.'};
                    dashboard(res, {message: message});
                })
                .catch(function(error){
                    message = { type: 'error', body: error};
                    dashboard(res, {message: message});
                });

        break;
        
        default:
        console.log('default routing');
            dashboard(res, {action: action});
        break;

    }

});

router.post('/dashboard', isLoggedIn, function(req,res){
    var message = { type: 'warning', body: null, icon: 'exclamation-triangle'};
    if(req.body.token !== administrator.token) {
        
    }
    
    if(req.body.action === 'CREATE_ARTICLE') {
        var title = req.body.title, subtitle = req.body.subtitle, slug = req.body.slug,
            tags = req.body.tags, author = req.body.author || config.author, 
            image = req.body.image, body = req.body.body;
            
        if(title == '') {
            message.body = 'A new Article must have a title!';
            dashboard(res, {message:message});
            return;
        }
        if(slug == '') {
            message.body = 'A new Article must have a slug!';
            dashboard(res, {message:message});
            return;
        }
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
                dashboard(res, {action: req.body.action, message: message});
            } else {
                message.type = 'success';
                message.body = 'Article was saved in the database';
                message.icon = 'check-square-o';
                dashboard(res, {message:message});
            }
        });
    }
    
    if(req.body.action === 'EDIT_ARTICLE') {
        Article.update({_id: req.body.id}, {
            title: req.body.title,
            subtitle: req.body.subtitle,
            slug: req.body.slug,
            tags: req.body.tags,
            author: req.body.author,
            image: req.body.image,
            body: req.body.body
        }, function(err){
            if(err) {
                console.log(err);
            } else {
                
                message.type = 'success';
                message.body = 'Article was saved in the database';
                message.icon = 'check-square-o';
                dashboard(res, {message: message, action:"ALL_ARTICLES"});
            }
        });
        
    }
    
});

router.get('/imagelist', isLoggedIn, function(req, res){
    imagelist(res);
});

router.get('/images', isLoggedIn, function(req,res){
    images(res);
});

var uploadImages = multer({storage: storage}).single('file');

router.post('/images', function (req, res) {
  uploadImages(req, res, function (err) {
    if (err) {
    var message = {type: 'warning', body: 'Error: Upload not completed.', icon: 'exclamation-triangle' };
        images(res, {message: message});
        return;
    }
    // image was correctly uploaded, now save in database...
    var image = new Image();
        image.title = req.body.title;
        image.description = req.body.description;
        image.alt = req.body.alt || req.body.title;
        image.extension = '.' + req.file.originalname.split('.')[1];
        image.filename = '/images/uploads/' + req.file.filename;
        
        console.log(image.filename);
        
    image.save(function(err) {
        var message;
        if(err) {
            message = {type: 'warning', body: 'Error: Image not saved in database.', icon: 'exclamation-triangle' };
        } else {
            message = {type: 'success', body: 'Image saved in database.', icon: 'check-square-o' };
        }
        images(res, {message: message});
    });    
    


  });
  
});

router.get('/logout', function(req, res){
    req.session.login = false;
    res.redirect('/admin');
});

module.exports = router;

function randomString(r){for(var n="",t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",a=0;r>a;a++)n+=t.charAt(Math.floor(Math.random()*t.length));return n}

