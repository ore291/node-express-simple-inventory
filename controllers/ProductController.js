const db = require("../database");
var { nanoid } = require("nanoid");
var JsBarcode = require("jsbarcode");
const { createCanvas } = require("canvas");
const fs = require("fs");

const postProduct = async (req, res) => {
  var id = nanoid();
  try {
    db.run(
      "insert into inventory(  name, code, quantity, price) values( ?, ?, ?, ?)",

      req.body.name,
      id,
      req.body.quantity,
      req.body.price,
      (err) => {
        if (err) {
          res.send(err);
        } else {
          var canvas = createCanvas(300, 300);
          JsBarcode(canvas, id, {
            // error
            displayValue: false,
          });
          const buffer = canvas.toBuffer("image/png");
          fs.writeFileSync(`./public/barcodes/${id}.png`, buffer);
          res.redirect(`/product/${id}`);
        }
      }
    );
  } catch (e) {
    console.log(
      `error ocurred in productController at postProduct() , error message : ${e.message}`
    );
  }
};

const updateProduct = async (req, res) => {
  let data = [
    req.body.name,
    parseInt(req.body.quantity),
    parseInt(req.body.price),
    parseInt(req.body.id),
  ];

  try {
    db.run(
      `UPDATE inventory
        SET name = ?, quantity = ?, price = ?
        WHERE id = ?`,
      data,
      (err) => {
        if (err) {
          console.log(err.message); 
          res.send(err);
        } else {
          return res.redirect(`/product/${req.body.code}`);
        }
      }
    );
  } catch (e) {
    console.log(
      `error ocurred in productController at updateProduct() , error message : ${e.message}`
    );
  }
};

const getProduct = async (req, res) => {
  try {
    db.all(
      "select * from inventory where code = ?",
      req.params.id,
      async (err, rows) => {
        if (err) res.send(err);
        else {
          if (rows.length < 1) {
            await req.flash("info", "Product Not Found!");
            res.redirect("/scan-product");
          } else {
            res.render("single", { title: "product", data: rows[0] });
          }
        }
      }
    );
  } catch (e) {
    console.log(
      `error ocurred in productController at getProduct() , error message : ${e.message}`
    );
  }
};

const editProduct = async (req, res) => {
  try {
    db.all(
      "select * from inventory where code = ?",
      req.params.id,
      async (err, rows) => {
        if (err) res.send(err);
        else {
          if (rows.length < 1) {
            await req.flash("info", "Product Not Found!");
            res.redirect("/scan-product");
          } else {
            res.render("edit", { title: "edit product", data: rows[0] });
          }
        }
      }
    );
  } catch (e) {
    console.log(
      `error ocurred in productController at getProduct() , error message : ${e.message}`
    );
  }
};

const getProducts = async (req, res) => {
  try {
    db.all("select * from inventory", (err, rows) => {
      if (err) res.send(err);
      else {
        res.render("all", { title: "products", products: rows });
      }
    });
  } catch (e) {
    console.log(
      `error ocurred in productController at getProduct() , error message : ${e.message}`
    );
  }
};

// app.post('/register', (req, res) => {
//     //{failureRedirect: '/register'},
//     db.run("insert into user(id, username, password) values(?, ?, ?)",
//     Date.now(),
//     req.user,
//     req.body.password,
//     (err) => {
//         if(err)
//            res.send(err);
//         else
//            res.redirect("/login");
//     });

//   });

//   //show data
//   app.get('/', (req, res) => {
//       if(req.isAuthenticated()){
//       db.all("select * from inventory where resp_person = ?", req.user, (err, rows) => {
//         if(err)
//           res.send(err);
//         else{
//           res.send(pug.renderFile('list.pug', {
//             "inv_list": rows
//           }));
//         }
//       });
//      }else{
//        console.log("Unauthenticated user!!!");
//        res.redirect('/login');
//      }
//   });

//   //add data
//   app.get('/add', (req, res) => {
//     res.sendFile(`${__dirname}/add.html`);
//   })
//   app.post('/add', (req, res) => {
//     db.run("insert into inventory(id, title, resp_person) values(?, ?, ?)",
//     Date.now(),
//     req.body.title,
//     req.user,
//     (err) => {
//         if(err)
//            res.send(err);
//         else
//            res.redirect("/");
//     });
//   });

//   //delete data
//   app.post('/delete', (req, res) => {
//     console.log(req.body.delid);
//     db.run("delete from inventory where id=?",
//     req.body.delid,
//     (err) => {
//         if(err)
//            res.send(err);
//         else
//            res.redirect("/");
//     });
//   });

module.exports = {
  getProducts,
  getProduct,
  postProduct,
  editProduct,
  updateProduct,

  // getProductById,
  // putProduct,
  // getProductByCode,
  // deleteProduct,
};
