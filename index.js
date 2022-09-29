const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./database");
const prodController = require("./controllers/ProductController");
const session = require('express-session');
const { flash } = require('express-flash-message');

const app = express();
const port = process.env.PORT || "8000";

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// express-session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      // secure: true, // becareful set this option, check here: https://www.npmjs.com/package/express-session#cookiesecure. In local, if you set this to true, you won't receive flash as you are using `http` in local, but http is not secure
    },
  })
);

// apply express-flash-message middleware
app.use(flash({ sessionKeyName: 'flashMessage' }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

/**
 * Routes Definitions
 */

app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});


app.get("/products", prodController.getProducts);

app.post("/product-scan", (req, res)=>{
  res.redirect(`/product/${req.body.id}`)
})


app.get("/product/:id", prodController.getProduct);

app.get("/add-product", (req, res) => {
  res.render("add", { title: "Add Product" });
});

app.get("/delete-product/:id", prodController.deleteProduct);


app.get("/edit-product/:id",  prodController.editProduct);

app.get("/scan-product", async (req, res) => {
  const messages = await req.consumeFlash('info');
  res.render("scan", { title: "Scan Product", messages: messages });;
});

app.post("/add-product", prodController.postProduct);

app.post("/update-product", prodController.updateProduct);

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
