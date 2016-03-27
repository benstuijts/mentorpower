const express       = require('express');
const router        = express.Router();
const bodyParser    = require('body-parser');
const session       = require('express-session');
const jsonfile      = require('jsonfile')
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



function updateUrlLog() {
    var output = [];
    Article._read({},{'slug':1, '_id': 0})
        .then(function(slugs){
            slugs.forEach(function(slug){
                output.push("/" + slug.slug);
            });
            
            
            jsonfile.writeFile('./available-urls.json', output, function(error){
                if(error) {
                    console.log('Logging URLs of website went wrong');
                }
            });
            
        })
        .catch(function(error){});
};

Article._search('mooi', 'title')
       .then(function(results){
           //console.log('Documents found:' + results.length);
           //console.log(results);
       });


/*
Article.count().then(function(result){
    console.log('There are ' + result + ' documents in the database.');
    return Article.create({title: 'new article ' + randomString(8)});
}).then(function(result){
    console.log('Created this object in database ' + result);
    return Article.count();
}).then(function(result){
    console.log('The are ' + result + ' documents in the database now' );
}).catch(function(error){
    console.log('Something went wrong: ' + error);
});
*/

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
    res.render('./admin/login', admin_params.add(extra));
};
const dashboard = function(res, extra) {

    Article._read({})
           .then(function(articles){
               admin_params.articles = articles;
               res.render('./admin/dashboard',admin_params.add(extra));
           });
    };
const images = function(res, extra) {
    Image.find({}, function(err, images) {
        if(err) {
            admin_params['message'] = {type: 'warning', body: 'Error getting all images from database.', icon: 'exclamation-triangle' };
        } 
        admin_params.images = images;
        res.render('./admin/images',admin_params.add(extra));
    });
};
const imagelist = function(res, extra) {
    Image.find({}, function(err, images) {
        if(err) {
            admin_params['message'] = {type: 'warning', body: 'Error getting all images from database.', icon: 'exclamation-triangle' };
        } 
        admin_params.images = images;
        res.render('./admin/image_list',admin_params.add(extra));
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

router.get('/updatelog', function(req, res){
    updateUrlLog();
    login_form(res, null);
});

router.get('/dashboard', isLoggedIn, function(req, res){
    var action = req.query.action || 'ALL_ARTICLES';
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
            var cb = function() {
                dashboard(res, { message: {type: 'success', body: 'Article successfully published.', icon: 'check-square-o'},
                action:"ALL_ARTICLES"})};
            updateUrlLog();
            Article.publish(req.query.id, cb);
  
        break;
        
        case 'MUTE_ARTICLE':
            var cb = function() {
                dashboard(res, { message: {type: 'success', body: 'Article successfully muted.', icon: 'check-square-o'},
                action:"ALL_ARTICLES"})};
            updateUrlLog();
            Article.mute(req.query.id, cb);    
            
        break;
        
        case 'DELETE_ARTICLE':
            console.log('deleting article');
            updateUrlLog();
            Article.$deleteById(req.query.id, function(error) {
                var message;
                if(error) {
                    message = {type: 'warning', body: 'Error deleting article from database.', icon: 'exclamation-triangle'};  
                } else {
                    message = {type: 'success', body: 'Article deleted successfully from database.', icon: 'check-square-o'};
                }
                dashboard(res, {message:message});   
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
                updateUrlLog();
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
                updateUrlLog();
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

