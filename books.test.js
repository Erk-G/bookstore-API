const db = require("./db");
const app = require("./app");
const request= require("supertest");

let book_isbn;

beforeEach(async ()=>{
    const result= await db.query(`INSERT INTO books
    VALUES('0691161518','http://amazon.co/eobPtX2','Matthew Lane','english',264,'Princeton University Press','Power-Up: Unlocking the Hidden Mathematics in Video Games',2017) 
    RETURNING isbn`);
    book_isbn=result.rows[0].isbn;
})
    describe("GET /",()=>{
        test("If base url works for books", async ()=>{
            const response= await request(app).get("/books");
            expect(response.body.books).toStrictEqual([{
                "isbn": "0691161518",
                "amazon_url": "http://amazon.co/eobPtX2",
                "author": "Matthew Lane",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                "year": 2017
              }]);
        })
    })
    describe("GET /:id",()=>{
        test("If we can get a specific book", async ()=>{
            const response= await request(app).get(`/books/${book_isbn}`);
            expect(response.body.book).toStrictEqual({
                "isbn": "0691161518",
                "amazon_url": "http://amazon.co/eobPtX2",
                "author": "Matthew Lane",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                "year": 2017
              });           
        })
    })
    describe("POST /",()=>{
        test("If Post works", async ()=>{
            const response= await request(app).post(`/books/`).send({
                isbn:"123456789",
                amazon_url:"google.com",
                author:"Me :)",
                language:"yo mama",
                pages:0,
                publisher:"Yo Yo Ma",
                title:"IDK",
                year:1
            });
            expect(response.statusCode).toBe(201);
        })
        test("If Schema filters bad posts", async ()=>{
            const response= await request(app).post(`/books/`).send({
                language:"yo mama",
                pages:0,
                publisher:"Yo Yo Ma",
                title:"IDK",
                year:3
            });
            expect(response.statusCode).toBe(400);
        })
    })
    describe("PUT /:isbn",()=>{
        test("testing if route can edit", async ()=>{
            const response= await request(app).put(`/books/${book_isbn}`).send(
                {
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Matthew Lane",
                    language: "english",
                    pages: 264,
                    publisher: "A defunct one",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                }
            );
            expect(response.body.book.publisher).toBe("A defunct one");
        })
    })
    describe("DELETE /:isbn",()=>{
        test("Testing if it can delete", async ()=>{
            const response = await request(app).delete(`/books/${book_isbn}`)
            expect(response.body).toEqual({message: "Book deleted"});
        })
    })

    afterEach(async function () {
        await db.query("DELETE FROM BOOKS");
      });

    afterAll(async function () {
        await db.end()
      });