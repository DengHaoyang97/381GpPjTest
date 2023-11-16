//no use,backup 
//const dbUser = "381Project"; //lohin/create mongodb method
//const { MongoClient } = require("mongodb");//mongodb method
//let db=client.db(dbUser);//mongodb method(define db)
/*const connectMG = async () => {
   client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   try {
      await client.connect();
      console.log('Wah Connected MG');
   } catch (err) {
      console.error('Failed Connect MG',err);
   }
} */ //mongodb method(cnDB)//const kittySchema = require('./models/kitty');//schema requirement
//
//names
const collectionName_user = 'user';  //login/create
const uri = `mongodb+srv://billydeng97:dhy97886886@cluster0.zsgzyzj.mongodb.net/381Project?retryWrites=true&w=majority`;
//names

//quotes
const mongoose = require('mongoose');
const express = require('express');
const session = require('cookie-session');
const app = express();
 app.set('view engine','ejs');
const bodyParser=require('body-parser');
 app.use(bodyParser.urlencoded({ extended: true }));
//quotes

//shortcuts
const closeDB=()=>mongoose.disconnect();	
const openDB=()=>mongoose.connect(uri);	
const db=mongoose.connection;
//shortcuts

app.use(session({
    userid: "session",  
    keys: ["123","bbb","666"],
}))
 
 //schemas
 //books
 const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    year: Number
});
const Book = mongoose.model('books', bookSchema);
//books/

//functions
const matchNamePW = async (db,usn,psw) => {
   try {let result = await db.collection(collectionName_user).findOne({ "username":`${usn}`,"password":`${psw}`});
   return result !== null; }
   catch (err) {
   console.error('SomethingWrong', err);
   return false;}} //match password and username

const matchUserName = async (db,usn) => {
   try {let result = await db.collection(collectionName_user).findOne({ "username":`${usn}`});
      return result !== null; }
   catch (err) {
      console.error('SomethingWrong', err);
      return false;}}  //function use to match username

const createAcc=async (db,nusn,npsw)=>{
	try{
	let result=await db.collection(collectionName_user).insertOne({"username":`${nusn}`,"password":`${npsw}`});
	return result !== 1;}
	catch (err) {
	      console.error('SomethingWrong', err);
	      return false;}} //function use to create accounts
    
const handle_login = async (req,username,password) => {
   try{ 
   await openDB();
   console.log("Connected DB");
   let result=await matchNamePW(db,username,password);
   if(result){
   console.log("pw&usn matched");
   let unique=await db.collection(collectionName_user).findOne({"username":`${username}`});
   let Id=unique._id.toString();
   console.log(Id);
   req.session.dbid=Id;//cookie p2
   return null;
   }
   else{
   return {Message:"Wrong Username or Password"};
   console.log("Not matched")}}
   catch (err){
   console.error("Somthing Wrong!",err);}
   finally{
   await closeDB(); 
   console.log("Disconnected DB");}} //login
 //  
   const handle_accCreate = async (username, password) => {
   try{  
   await openDB();
   console.log("Connected DB");
        let match=await matchUserName(db,username);
	if(match){let result=true;
	console.log("Username used");
	return {Message:"User Name Already Used"};}
	else{
   let result=await createAcc(db,username,password);
       console.log("Wow Created new user welcome 666");
       return null;}}
   catch (err){
   console.error("SomthingWrong!",err);}
   finally{await closeDB(); 
   console.log("Disconnected DB");}}//acc create
      
//res req
app.get('/login', (req, res) => {
   res.status(200).render('login.ejs',{Message:null});   
  });

app.post('/login', async(req,res) => {
   const result=await handle_login(req,req.body.username,req.body.password);
   if(result && result.Message){res.status(200).render('login.ejs',{Message:result.Message});}
   if(result==null){res.redirect('/');}});

app.get('/createaccount', (req, res) => {
   res.status(200).render('createaccount.ejs',{Message:null}); });
 
app.post('/createaccount', async(req, res) => {
    const result=await handle_accCreate(req.body.username,req.body.password);
    if(result && result.Message){ res.status(200).render('createaccount.ejs',{Message:result.Message});}
  });
  
  app.get('/logout',(req,res)=>{
  req.session.loggedIn = null;
  req.session.id = null;
  res.redirect('/login');
  });
 
 //mainpage
app.get('/', async(req, res) => {
    if (req.session.dbid) {
    try {   
	await mongoose.connect(`mongodb+srv://billydeng97:dhy97886886@cluster0.zsgzyzj.mongodb.net/381Project?retryWrites=true&w=majority`);
	console.log('list books');
	    const books= await Book.find();;
        res.render('index', { books: books });
	await mongoose.disconnect();	
	    
    } catch (err) {
        res.status(500).send('Connot connect to DB');
		console.log('Connot connect to DB');
    }
  } else {console.log("偷看人家~plz Don't peep badbad");
    res.redirect('/login');}});   
//main page
  
 //handle books

app.get('/books/new', async (req, res) => {
    try {
		console.log('insertone');
		res.render('createbook');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.get('/books/edit/:id', async (req, res) => {
    try {
	await mongoose.connect(`mongodb+srv://billydeng97:dhy97886886@cluster0.zsgzyzj.mongodb.net/381Project?retryWrites=true&w=majority`);	
        const book = await Book.findById(req.params.id);
        res.render('edit', { book: book });
	await mongoose.disconnect();	
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
});

app.post('/books/add', async (req, res) => {
    try {
	await mongoose.connect(`mongodb+srv://billydeng97:dhy97886886@cluster0.zsgzyzj.mongodb.net/381Project?retryWrites=true&w=majority`);
	console.log('insertone');
        const newBook = new mongoose.connection.Book(req.body);
        await newBook.save();
		console.log('inserted book with id: ' + newBook._id);
	await mongoose.disconnect();
        res.redirect('/');
	    
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
});

app.post('/books/update/:id', async (req, res) => {
    try {
	await mongoose.connect(`mongodb+srv://billydeng97:dhy97886886@cluster0.zsgzyzj.mongodb.net/381Project?retryWrites=true&w=majority`);	
        await mongoose.connection.Book.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/');
	await mongoose.disconnect();	
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
});

app.post('/books/delete/:id', async (req, res) => {
    try {
	    
       await mongoose.connect(`mongodb+srv://billydeng97:dhy97886886@cluster0.zsgzyzj.mongodb.net/381Project?retryWrites=true&w=majority`);
        await mongoose.connection.Book.findByIdAndDelete(req.params.id);
        res.redirect('/');
       await mongoose.disconnect();	
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
});
  
  
//end
app.listen(process.env.PORT || 3000);

   


