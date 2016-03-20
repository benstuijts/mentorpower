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
    published: {type: Boolean, default: false}
    
});

articleSchema.methods.generateHash = function(password) {
    return;
};

module.exports = mongoose.model('Article', articleSchema);

/* Utility functions */

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
