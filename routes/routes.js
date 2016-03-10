var express     = require('express');
var router      = express.Router();
var url         = require('url');


router.use(function (req, res, next) {

    var u = url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    });    

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
     url: u,
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

router.get('/mentorschap-wat-is-het', function(req, res){
    res.render('./paginas/mentorschap-wat-is-het',{
      title: 'mentorschap wat is het?',
      description: 'Wat is een mentorschap en hoe werkt het?',
      keywords: 'mentorschap',
      breadcrumbs: [
          { name: 'home', url: '/'}, 
          { name: 'mentorschap', url: '/mentorschap-wat-is-het'}
        ]
  });
});

router.get('/teambuilding', function(req, res){
    res.send('teambuilding');
});

router.get('/brainstormen', function(req, res){
    res.send('brainstormen');
});

router.get('/beleid-maken', function(req, res){
    res.send('beleid maken');
});

router.get('/suzan-de-jong', function(req, res){
    res.render('./paginas/suzan-de-jong',{
      title: 'Suzan de Jong',
      description: 'Combinatie opleiding - stage - mentorschap',
      keywords: 'opleiding, stage, suzan de jong',
      breadcrumbs: [
          { name: 'home', url: '/'}, 
          { name: 'verhalen', url: '/verhalen'},
          { name: 'Suzan de Jong', url: '/suzan-de-jong'}
        ]
    });
});

router.get('/carin-radenborg', function(req, res){
    res.redirect('carin-den-heijer');
});


router.get('/carin-den-heijer', function(req, res){
    res.render('./paginas/carin-den-heijer',{
      title: 'Carin den Heijer',
      description: 'Wat is mijn volgende stap in mijn carrière en hoe neem ik deze stap?',
      keywords: 'volgende stap, carrière, leidinggeven',
      breadcrumbs: [
          { name: 'home', url: '/'}, 
          { name: 'verhalen', url: '/verhalen'},
          { name: 'Carin den Heijer', url: '/carin-den-heijer'}
        ]
    });
});

router.get('/ben-stuijts', function(req, res){
    res.send('Ben Stuijts');
});

router.get('/ben-stuijts', function(req, res){
    res.send('Ben Stuijts');
});

router.get('/verhalen', function(req, res){
    res.send('Verhalen');
});

router.get('/artikelen', function(req, res){
    res.send('Artikelen');
});

module.exports = router;