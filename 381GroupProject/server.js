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
const uri2 = `mongodb+srv://userfornode:12345678900@book-managementsystem.cqntnli.mongodb.net/BookManage`;
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
mongoose.connect(uri2);	

app.use(session({
  name: 'session',
  keys: ['aaa','bbb'],
}));//checked
//functions
const matchNamePW = async (db,usn,psw) => {
   try {let result = await db.collection(collectionName_user).findOne({ "username":`${usn}`,"password":`${psw}`});
      return result !== null; }
   catch (err) {
      console.error('SomethingWrong', err);
      return false;}}
      
const matchUserName = async (db,usn) => {
   try {let result = await db.collection(collectionName_user).findOne({ "username":`${usn}`});
      return result !== null; }
   catch (err) {
      console.error('SomethingWrong', err);
      return false;}}     
      


const createAcc=async (db,nusn,npsw)=>{
	
	try{
	let result=await db.collection(collectionName_user).insertOne({"username":`${nusn}`,"password":`${npsw}`});
	return result !== 1;}
	
	catch (err) {
	      console.error('SomethingWrong', err);
	      return false;}}
   
 
   const handle_login = async (req,username,password) => {
   try{ 
   await openDB();
   console.log("Connected DB");
   
   let result=await matchNamePW(db,username,password);
   if(result){
   console.log("Wah 666");
   
   let unique=await db.collection(collectionName_user).findOne({"username":`${username}`});
   let Id=unique._id.toString();
   console.log(Id);
   req.session.dbid=Id;
   return null;
   }
   else{
   return {Message:"Wrong Username or Password"};
   console.log("NOTCORRECT!!!")}
 
   
  }
   catch (err){
   console.error("Ahhhhhh!",err);
   }
   finally{
   await closeDB(); 
   console.log("Disconnected DB");}}
 //  
   const handle_accCreate = async (username, password) => {
   try{  
   await openDB();
   console.log("Connected DB");
   
	let match=await matchUserName(db,username);
	if(match){let result=true;
	console.log("Username used");
	return {Message:"User Name Already Used"};
	}
	
	else{
   let result=await createAcc(db,username,password);
       console.log("Wah666 Created");
       return null;}}
   
   
   catch (err){
   console.error("Ahhhhhh!",err);
   }
   finally{
   await closeDB(); 
   console.log("Disconnected DB");}}
   
   
   
   
//res req

app.get('/login', (req, res) => {
   res.status(200).render('login.ejs',{Message:null});   
  
});
app.post('/login', async(req,res) => {
   const result=await handle_login(req,req.body.username,req.body.password);
   if(result && result.Message){ res.status(200).render('login.ejs',{Message:result.Message});}
   if(result==null){req.session.loggedIn = true;
   return res.redirect('/');}
  
});


app.get('/createaccount', (req, res) => {
   res.status(200).render('createaccount.ejs',{Message:null});   
  });
  
app.post('/createaccount', async(req, res) => {
    const result=await handle_accCreate(req.body.username,req.body.password);
    if(result && result.Message){ res.status(200).render('createaccount.ejs',{Message:result.Message});}
  });


  app.get('/', async (req, res) => {
	
	if (!req.session.dbid) {
	console.log("坏坏哦偷看人家~");
	res.redirect('/login');} ;
	
    try {
	   await openDB();
	console.log('list books');
        const books = await db.collection(Book).find();
        res.render('index', { books: books });
	   
    } catch (err) {
        res.status(500).send('Connot connect to DB');
		console.log('Connot connect to DB');
    }
	  finally{await closeDB();}
});


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
	    await openDB();
        const book = await db.collection(Book).findById(req.params.id);
        res.render('edit', { book: book });
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
	 finally{await closeDB();}
});

app.post('/books/add', async (req, res) => {
    try {
		console.log('insertone');
        const newBook = new Book(req.body);
        await db.newBook.save();
		console.log('inserted book with id: ' + newBook._id);
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
});

app.post('/books/update/:id', async (req, res) => {
    try {
	await openDB();
        await db.collection(Book).findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
	 finally{await closeDB();}
});

app.post('/books/delete/:id', async (req, res) => {
    try {
	    await openDB();
        await db.collection(Book).findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Server error');
		console.log('insert error or cannot connect db');
    }
	 finally{await closeDB();}
});

app.listen(process.env.PORT || 8099);

   
