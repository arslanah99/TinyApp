var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())



// function doesEmailExist(){
//   if(usersObj.email === '' || userObj.password === ''){
//     res.sendStatus(400)
//   }
// }



function generateRandomString(){
    let newString = ''
    //input an empty string
    //grab all letters from a-z & 0-9
    //store the random value in the newString
    //output new genearated string
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (var i = 6; i > 0; --i) newString += chars[Math.floor(Math.random() * chars.length)];
    return newString
}
//9sm5xk: gooogle.com

const urlDatabase = {
  // b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  // i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


function urlsForUser(loggedInUserId){
  let urlEmptyObject = {
    // b6UTxQ:{ longURL: "https://www.tsn.ca", userID: "aJ48lW" }
  };
  for(var key in urlDatabase){
    if(urlDatabase[key].userID === loggedInUserId){
      urlEmptyObject[key] = urlDatabase[key]
    }
  }
  return urlEmptyObject
}


const users = {
  'User1': {
    id: 'User1',
    email: 'a@a.com',
    password: 'a'
  },
  'User2': {
    id: 'User2',
    email: 'b@b.com',
    password: 'b'
  }
}

app.get("/", (req, res) => {
  res.send("Hello!", templateVars);

});





//registaration page
app.get('/register', (req, res) => {
  res.render('urls_registration')
})


//registartion post
app.post('/register', (req, res) => {
  let newUserId = generateRandomString() 
  let encryptedPassword = bcrypt.hashSync(req.body.password, 10);
  const userObj = {
    id: newUserId,
    email: req.body.email,
    password: encryptedPassword
  }
  console.log('Users database: ', users);

  if(userObj.email === '' || userObj.password === ''){
    res.sendStatus(400);
  } 
  for(var keys in users){
    if(users[keys].email === req.body.email){
      res.sendStatus(400)
    }


  }
  users[newUserId] = userObj
  res.cookie('user_id', newUserId);
console.log(users)

  res.redirect('/urls')
})

// app.post('/urls', (req, res) => {
//   res.render('/urls')
// })

app.get('/urls', (req, res) => {
  console.log('hgoi')
  let theID = req.cookies['user_id'];
  let templateVars = {
  user_id: users[theID],
  urls: urlsForUser(theID)
}
  res.render('urls_index', templateVars)
})

app.post('/logout', (req, res) => {
  res.cookie('user_id', req.body.user_id)
  res.clearCookie('user_id', res.body)
  res.redirect('/urls')
})

//Login Page
app.get('/login', (req, res) => {
  res.render('urls_login')
})



//login post
app.post('/login', (req, res) => {
  let providedEmail = req.body.email;
  let providedPassword = req.body.password
  // res.cookie('user_id', req.body.)
  // console.log(req.body.user_id)
  // res.send(req.cookies.user_id)
  for(var keys in users){
    if((users[keys].email) === (providedEmail) && bcrypt.compareSync(providedPassword, users[keys].password)){
      // console.log(keys)
     res.cookie('user_id', keys) 
    res.redirect('/urls');
    }
  }
  res.sendStatus(403)
  })
  
// app.get('/urls', (req, res) => {
//     let templateVars = { urls: urlDatabase };
//     res.render('urls_index', templateVars);
// });


app.get("/urls/new", (req, res) => {
  let theID = req.cookies['user_id'];
    let templateVars = {
    user_id: users[theID]
  }
  if(theID === undefined){
    res.redirect('/login')
  } else{
    res.render("urls_new", templateVars);
    
  }
  
  });

app.get('/urls/:shortURL', (req, res) => {
  let theID = req.cookies['user_id'];
    let templateVars = {
      shortURL: req.params.shortURL, 
      user_id: users[theID],
      urls: urlDatabase,
      'user_id': req.cookies['user_id'], users:users
    };
    res.render('urls_show', templateVars)
})



app.post('/urls/:shortURL/delete', (req, res) => {
    // var deleter = urlDatabase.req.params.shortURL
    // delete deleter
    let theID = req.cookies['user_id'];
    if(urlDatabase[req.params.shortURL].userID === theID){
    delete urlDatabase[req.params.shortURL]
    }
    res.redirect('/urls')
})

app.post('/urls', (req, res) => {
    // console.log(req.body);
    // res.send('Ok')
    console.log('HELLLOO')
  let shortUrl = generateRandomString();
    let theID = req.cookies['user_id'];
    let longUrl = req.body.longURL
    let emptObj = {longURL: longUrl, userID:theID};
    urlDatabase[shortUrl] = emptObj;
    let templateVars = {
      urls: urlsForUser(theID), 
      user_id: users[theID]
    };
    
    res.redirect('/urls')
})

app.post('/urls/:id', (req, res) => {
  let theID = req.cookies['user_id'];
  if(urlDatabase[req.params.id].userID === theID){
    urlDatabase[req.params.id].longURL = req.body.newURL
  }
    let templateVars = {
      urls: urlDatabase,
       user_id: users[theID]
      };
    // console.log('hello')
    // console.log(req.params.id)
    // console.log(req.body)
    // if(updatedURL !== ())
    res.render('urls_index', templateVars)
})

app.get("/u/:shortURL", (req, res) => {
    //Take the short url that was generated and make that equal
    //to longURL
    // if(urlDatabase[req.param.id].userID === theID){
      
    // }
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

//   app.get("/hello", (req, res) => {
//     res.send("<html><body>Hello <b>World</b></body></html>\n");
//   });

app.set("view engine", "ejs");