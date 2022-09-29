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

const deleteProduct = async (req, res) => {
  try {
    db.all("delete from inventory where id=?",req.params.id, (err) => {
      if (err) res.send(err);
      else {
        res.redirect("/products");
      }
    });
  } catch (e) {
    console.log(
      `error ocurred in productController at deleteProduct() , error message : ${e.message}`
    );
  }
};



module.exports = {
  getProducts,
  getProduct,
  postProduct,
  editProduct,
  updateProduct,
  deleteProduct,
};
