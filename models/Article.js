const mongoose    = require('mongoose');

var articleSchema = mongoose.Schema({
    
    title: String,
    subtitle: String,
    slug: String,
    tags: String,
    author: String,
    image: String,
    body: String,
    views: {type: Number, default: 0},
    published: {type: Boolean, default: false},
    settings: mongoose.Schema.Types.Mixed,
    _statics: mongoose.Schema.Types.Mixed
    
});

// Static methods: CRUD Create, Read, Update, Delete

/* PATTERN:
    Article.$count(function(error, count){
        if(error) { return false; }
        console.log(count);
    });
    
    idee: aparte lib van maken: const mongooseCrud = require('mongoose-crud');
    articleSchema.statics = mongooseCrud;
    
*/
articleSchema.statics = require('../modules/mongoose-statics');

// options nog uitzoeken

articleSchema.statics.query = function(query, fields, options) {
    console.log('query fn');
    var self = this;
    
    return new Promise(function(resolve, reject){
        self.find(query, fields, options, function(error, result){
            if(error) {
                return reject(error);
            }
            // resultaten verrijken met extra informatie?
            console.log(typeof result);
            resolve(result);
        });
    });
    
};

articleSchema.statics.getAllArticles = function() {
    return this.query({});
};

articleSchema.statics.getAllArticlesTitles = function() {
    return this.query({}, {title: 1, _id:0});
};


articleSchema.statics.getAll = function(cb) {
    this.find({}, function(error, docs){
        if(error) {
            cb(true, null);
        } else {
            cb(false, docs);
        }
    });
};

articleSchema.statics.publish = function(_id, cb) {
    this.findOne({_id: _id}, {}, function(error, article){
        if(error) { 
            return false; 
        } else {
            article.published = true;
            article.save();
            cb();
        }
    });
};
articleSchema.statics.mute = function(_id, cb) {
    this.findOne({_id: _id}, {}, function(error, article){
        if(error) { 
            return false; 
        } else {
            article.published = false;
            article.save();
            cb();
        }
    });
};
articleSchema.statics.delete = function(_id, cb) {
    this.remove({_id: _id}, function(error){
        if(error) {
            cb(true);
        } else {
            cb(false);
        }      
    });
};


articleSchema.methods.generateHash = function(password) {
    return;
};

articleSchema.methods.publish = function(cb) {
    
    this.update({_id: this.id}, {$set: { 'published' : true }});
    cb();
};
articleSchema.methods.mute = function() {
    this.published = false;
};

module.exports = mongoose.model('Article', articleSchema);

/* Utility functions */

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
