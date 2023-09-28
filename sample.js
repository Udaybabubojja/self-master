var express = require('express');
var app = express();
app.use(express.static("public"));

app.get("/index", function (req, res){
    res.sendFile(__dirname+"/public/"+"index.html");
});

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require("./database.json");
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

app.get("/submit", function (req, res){
    const email = req.query.email;
    const score = req.query.score;
    const difficulty = req.query.difficulty;
    const type = req.query.type;
    const category = req.query.category;
    const totalscore = req.query.total;
    if (email && score) {
        db.collection('database').add({
            Email: email,
            Score: score,
            Difficulty: difficulty,
            Type: type,
            Category: category,
            Totalscore: totalscore
        })
        .then(() => {
            res.redirect("/main");
        })
        .catch(error => {
            console.error("Error adding document:", error);
            res.send("An error occurred during adding.");
        });
    } else {
        res.send("details are not sufficient");
    }
});

app.get('/userdata', async (req, res) => {
    try {
        // Retrieve the user's email from the request
        const userEmail = req.query.email;

        if (!userEmail) {
            return res.status(400).json({ error: 'Email parameter missing' });
        }

        // Use the email to query Firestore for user-specific data
        const userDoc = await db.collection('database').where('Email', '==', userEmail).get();

        if (userDoc.empty) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.docs.map(doc => doc.data());

        res.json(userData);
    } catch (error) {
        console.error('Error getting user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.get("/login", function (req, res){
    res.sendFile(__dirname+"/public/"+"login.html");
});

app.get("/main", function (req, res){
    res.sendFile(__dirname+"/public/"+"main.html");
});

app.get("/learn", function (req, res){
    res.sendFile(__dirname+"/public/"+"learn.html");
});

app.get("/homepage", function (req, res){
    res.sendFile(__dirname+"/public/"+"homepage.html");
});

app.get("/profile", function (req, res){
    res.sendFile(__dirname+"/public/"+"profile.html");
});

app.listen(3000, function () {  
    console.log('Now you are listening on port 3000!');  
});