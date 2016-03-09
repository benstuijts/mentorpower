var express     = require('express');
var router      = express.Router();



router.use(function (req, res, next) {
   res.locals = {
     author: "Ben Stuijts",
     baseUrl: "https://mentorpower2016-stuijts.c9users.io/",
     contact: {
         email: "benstuijts@mentorpower.nl",
         telephone: "0031651363602",
         website: "http://www.mentorpower.nl",
         linkin: "https://nl.linkedin.com/in/benstuijts",
         facebook: "https://www.facebook.com/mentorpower.nl",
         twitter: "https://twitter.com/BenStuijts",
         google: "https://www.google.com/+MentorpowerNl",
         address: "Maltaweide 8, 3223MJ Hellevoetsluis",
         kvk: "63508109",
         iban: "NL48 KNAB 0732 2691 13",
         btw: "NL196390400B01"
     },
     urlFor: function(url) {
         return '/' + url
     },
   };
   next();
});

router.get('/home', function(req, res){ res.redirect('/')});

router.get('/', function(req, res) {
  res.render('landingspage',{
      title: 'home',
      description: '',
      keywords: '',
      breadcrumbs: [
          { name: 'home', url: '/'}, 
          { name: 'ben stuijts', url: '/'}
        ]
  });
});

module.exports = router;