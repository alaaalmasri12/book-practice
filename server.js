'use strict'
require("dotenv").config();
const express=require("express");
const app=express();
const PORT=process.env.PORT;
const superagent=require("superagent");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
var methodOverride = require('method-override');
app.use(methodOverride('_method'))
const pg=require("pg");
app.set("view engine","ejs");
const client=new pg.Client(process.env.DATABASE_URL);
app.get("/",(req,res)=>{
    let SQL="SELECT * FROM booktests";
    client.query(SQL)
    .then(data=>{
        res.render("pages/index",{results:data.rows});
    })
})
app.get("/books/:id",(req,res)=>{
    let SQL="SELECT * FROM booktests WHERE id=$1";
    let safevalues=[req.params.id];
    client.query(SQL,safevalues)
    .then(result=>{
        res.render("pages/book/detail",{books:result.rows});
    })
})
app.put("/update/:id",(req,res)=>{
   let {title,authors,description,isbn,image,booksehelf}=req.body;
    let SQL="UPDATE booktests set title=$2,authors=$3,description=$4,isbn=$5,image=$6,booksehelf=$7 WHERE id=$1";
    let safevalues=[req.params.id,title,authors,description,isbn,image,booksehelf];
    client.query(SQL,safevalues)
    .then(()=>{
   res.redirect("/");
    })
})
app.post("/show",(req,res)=>{
    var url;
if(req.body.searchtype === "title")
{
    url=`https://www.googleapis.com/books/v1/volumes?q=${req.body.search}`;
}
else if(req.body.searchtype === "author")
{
    url=`https://www.googleapis.com/books/v1/volumes?q=${req.body.search}+inauthor:${req.body.search}`;
}

superagent.get(url)

.then(data=>{
    let dataarr=data.body.items;
    let bookresult=dataarr.map(value=>{
let bookobject=new Book(value);
return bookobject;
    })
    console.log(bookresult);
    res.render("pages/searches/show",{books:bookresult});
})    
})
app.delete("/delete/:id",(req,res)=>{
    let SQL="DELETE FROM booktests WHERE id=$1";
    let safevalues=[req.params.id];
    client.query(SQL,safevalues)
    .then(()=>{
        res.redirect("/");
    })
})
app.post("/add",(req,res)=>{
    let{title,authors,description,isbn,image,booksehlf}=req.body;
    let SQL="INSERT INTO booktests(title,authors,description,isbn,image,booksehelf) VALUES($1,$2,$3,$4,$5,$6);";
    let safevalues=[title,authors,description,isbn,image,booksehlf];
    client.query(SQL,safevalues)
    .then(()=>{
        res.redirect("/");
    })
})
app.get('/',(req,res)=>{
    res.render("pages/index");
})
app.get("/new",(req,res)=>{
    res.render("pages/searches/new");
})

app.use("*",(req,res)=>{
    res.status(404).send("page not found");
})
app.use(Error,(req,res)=>{
    res.status(500).send(Error);
})
client.connect()
.then(app.listen(PORT,()=>{
    console.log(`port is runing at port${PORT}`);
}))
function Book(book) {
    this.title = book.volumeInfo.title;
    this.image = book.volumeInfo.imageLinks.smallThumbnail;
    this.authors = book.volumeInfo.authors;
    this.description = book.volumeInfo.description;
    this.isbn = book.volumeInfo.industryIdentifiers[0].type;
}