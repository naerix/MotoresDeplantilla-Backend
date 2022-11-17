const express = require("express");
const { Router } = express;
const routerProductos = Router();
const Container = require("./Container.js");
const { engine } = require('express-handlebars');
const app = express();
const port = process.env.PORT || 8080;

const contenedor = new Container();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(port, () => {
  console.log(`App funcionando en http://localhost:${port}`);
});

app.use("/api/productos", routerProductos);

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'hbs');
app.set('views', './views');
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
  })
);

app.get("/", (req, res) => {
  res.render("inicio", {title: "E-commerce"});
});

app.get("/form", (req, res) => {
  res.render('form', {title: "Agregar productos"});
});

app.post("/form", (req, res) => {
  const { body } = req;
  console.log(body);
  contenedor.save(body);
  res.render('gracias')
});


routerProductos.get("/", async (req, res) => {
  try {
    const productos = await contenedor.getAll();
    const productsExist = productos.length != 0
    res.render('products', { title: 'Listado de productos', products: productos, productsExist })
  } catch (error) {
    res.json({ error: true, msj: "error" });
  }
});

routerProductos.get("/:id", async (req, res) => {
  const id = req.params.id;
  res.json((await contenedor.getById(id)) ?? { error: "no encontrado" });
});

routerProductos.post("/", async (req, res) => {
  try {
    const { body } = req;
    contenedor.save(body);
    res.json("ok");
  } catch (error) {
    res.json({ error: true, msj: "error" });
  }
});

routerProductos.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    console.log(name, price, id)
    await contenedor.updateById(id, name, price);
    res.json({ succes: true });
  } catch (error) {
    res.json({ error: true, msj: "error" });
  }
});

routerProductos.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    contenedor.deleteById(id);
    res.send("Eliminado");
  } catch (error) {
    res.json({ error: true, msj: "error" });
  }
});

