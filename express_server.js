var express = require("express");
var app = express();
const bcrypt = require("bcrypt");
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);
//generates a random string
function generateRandomString() {
  let newString = "";
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 6; i > 0; --i)
    newString += chars[Math.floor(Math.random() * chars.length)];
  return newString;
}

const urlDatabase = {};

function urlsForUser(loggedInUserId) {
  let urlEmptyObject = {};
  for (var key in urlDatabase) {
    if (urlDatabase[key].userID === loggedInUserId) {
      urlEmptyObject[key] = urlDatabase[key];
    }
  }
  return urlEmptyObject;
}

const users = {};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

//registaration page
app.get("/register", (req, res) => {
  res.render("urls_registration");
});

//registartion post
app.post("/register", (req, res) => {
  let password = req.body.password;
  let newUserId = generateRandomString();
  let encryptedPassword = bcrypt.hashSync(req.body.password, 10);
  const userObj = {
    id: newUserId,
    email: req.body.email,
    password: encryptedPassword
  };
  console.log("Users database: ", users);

  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  }
  for (var keys in users) {
    if (
      users[keys].email === req.body.email ||
      users[keys].password === req.body.password
    ) {
      res.sendStatus(400);
    }
  }
  users[newUserId] = userObj;
  req.session.user_id = newUserId;
  console.log(users);

  res.redirect("/urls");
});

//getting the main /urls page
app.get("/urls", (req, res) => {
  let theID = req.session["user_id"];
  let templateVars = {
    user_id: users[theID],
    urls: urlsForUser(theID)
  };
  res.render("urls_index", templateVars);
});

//logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Login Page
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//login post
app.post("/login", (req, res) => {
  let providedEmail = req.body.email;
  let providedPassword = req.body.password;

  for (var keys in users) {
    if (
      users[keys].email === providedEmail &&
      bcrypt.compareSync(providedPassword, users[keys].password)
    ) {
      req.session.user_id = keys;
      res.redirect("/urls");
    }
  }
  res.sendStatus(403);
});
//update route
app.get("/urls/new", (req, res) => {
  let theID = req.session["user_id"];
  let templateVars = {
    user_id: users[theID]
  };
  if (theID === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});
//getting shorturl update page
app.get("/urls/:shortURL", (req, res) => {
  let theID = req.session["user_id"];
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.send("URL FOR GIVEN ID DOES NOT EXIST").sendStatus(401);
  } else if (urlDatabase[req.params.shortURL].userID !== theID) {
    res
      .send("YOU ARE NOT ALLOWED TO ACCESS ANOTHER USERS SHORTURL FOR UPDATING")
      .sendStatus(401);
  } else {
    console.log(users[theID]);
    let templateVars = {
      shortURL: req.params.shortURL,
      user_id: users[theID],
      urls: urlDatabase,
      users: users
    };
    res.render("urls_show", templateVars);
  }
});
//delete post
app.post("/urls/:shortURL/delete", (req, res) => {
  //  if
  let theID = req.session["user_id"];
  if (urlDatabase[req.params.shortURL].userID === theID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else if (urlDatabase[req.params.shortURL].userID !== theID) {
    res.send("YOU MUST BE LOGGED IN TO DO THAT").sendStatus(401);
  }
});
//main url post route
app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  let theID = req.session["user_id"];
  let longUrl = req.body.longURL;
  let emptObj = { longURL: longUrl, userID: theID };
  urlDatabase[shortUrl] = emptObj;
  let templateVars = {
    urls: urlsForUser(theID),
    user_id: users[theID]
  };

  res.redirect("/urls");
});
//updated url post route
app.post("/urls/:id", (req, res) => {
  let theID = req.session["user_id"];

  if (urlDatabase[req.params.id].userID === theID) {
    urlDatabase[req.params.id].longURL = req.body.newURL;
  }
  if (urlDatabase[req.params.id].userID !== theID) {
    res.send("YOU MUST BE LOGGED IN TO CHANGE URLS").sendStatus(401);
  }
  let templateVars = {
    urls: urlDatabase,
    user_id: users[theID]
  };

  res.redirect("/urls");
});
//get route to use the short url to go to the long url page
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.set("view engine", "ejs");
