var express = require('express');
var router = express.Router();
var recursosModel = require('./../models/recursos')
var porductoModel = require('./../models/productos')

const util = require('util');
const cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy)



/* GET home page. */
router.get('/', async function (req, res, next) {
  var producto = await porductoModel.GetProduct()

  res.render('admin/admin', {
    layout: 'admin/layout',
    producto
  })
});






router.get('/agregar', async function (req, res, next) {

  res.render('admin/agregar', {
    layout: 'admin/layout',
    title: 'Agregar un Registro',

  })
});


router.post('/agregar', async (req, res, next) => {
  try {


    if (req.body.ison == 'on') {
      var ison = 1
    } else {
      var ison = 0

    }

    if (req.body.name != "" && req.body.description != "" &&
      req.body.category != "" && req.body.price != "" && req.body.stock != "") {
      var name = req.body.name
      var description = req.body.description
      var category = req.body.category
      var price = req.body.price
      var stock = req.body.stock
      if(req.files.img) {
        imagen1 = req.files.img;
        img = (await uploader(imagen1.tempFilePath)).public_id;
      }
      await porductoModel.CreateProduct({
        name,
        description,
        category,
        price,
        stock,
        ison,
        img
      });
      if (req.body.category == 'clothing') {
        var name = req.body.name
        var xs = req.body.XS
        var s = req.body.S
        var m = req.body.M
        var l = req.body.L
        var xl = req.body.XL
        var xxl = req.body.XXL
        var xxxl = req.body.XXXL
        await porductoModel.CreateClothingSize({
          name,
          xs,
          s,
          m,
          l,
          xl,
          xxl,
          xxxl
        })
      }
      if (req.body.category == 'shoe') {

        var obj = {
          name: req.body.name,
          three_half: req.body.three_half,
          four: req.body.four,
          four_half: req.body.four_half,
          five: req.body.five,
          five_half: req.body.five_half,
          six: req.body.six,
          six_half: req.body.six_half,
          seven: req.body.seven,
          seven_half: req.body.seven_half,
          eight: req.body.eight,
          eight_half: req.body.eight_half,
          nine: req.body.nine,
          nine_half: req.body.nine_half,
          ten: req.body.ten,
          ten_half: req.body.ten_half,
          eleven: req.body.eleven,
          eleven_half: req.body.eleven_half,
          twelve: req.body.twelve,
          twelve_half: req.body.twelve_half,
          thirteen: req.body.thirteen,
          thirteen_half: req.body.thirteen_half,
          fourteen: req.body.fourteen,
          fourteen_half: req.body.fourteen_half,
          fifteen: req.body.fifteen
        }

        await porductoModel.CreateShoeSize(obj)
      }

      res.redirect('/inicio')
    } else {
      res.render('admin/agregar', {
        layout: 'admin/layout',
        error: true,
        message: "alguno de los campos requeridos no fue cargado"
      })
    }
  } catch (error) {
    console.log(error)
    res.render('admin/agregar', {
      layout: "admin/layout",
      error: true,
      message: "error al crear el producto0"
    })
  }
});

router.get('/eliminar/:id', async (req, res, next) => {
  var id = req.params.id;

  // Trae el producto por el id pasado del params
  let producto = await porductoModel.getProductById(id)

  // se comprueba la categoria
  if (producto.category == 'clothing') {
    // eliminar el registros de clothin size dependiendo del name pasado
    await porductoModel.deleteClothingSizeById(producto.name)
  }
  if (producto.category == 'shoe') {
    // eliminar el registros de shoe size dependiendo del name pasado
    await porductoModel.deleteShoeSizeById(producto.name)
  }
  // eliminar el registros de producto dependiendo del id pasado
  await porductoModel.deleteProductById(id);
  res.redirect('/inicio')
})


// trae el recurso por id para despues modificarlo
router.get('/editar/:id', async (req, res, next) => {
  var id = req.params.id;
  let sizes = ''
  let producto = await porductoModel.getProductById(id)

  if (producto.category == 'clothing') {
    sizes = await porductoModel.getClothingSizeById(producto.name)
  }
  if (producto.category == 'shoe') {
    sizes = await porductoModel.getShoeSizeById(producto.name)
  }
  console.log(sizes)
  res.render('admin/editar', {
    layout: 'admin/layout',
    producto,
    sizes
  })
});

// modifica el nft
router.post('/editar', async (req, res, next) => {
  try {
    var obj = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
      ison: 1
    }
    await porductoModel.modificarProductById(obj, req.body.name);
    res.redirect('/inicio')
  }
  catch (error) {
    console.log(error)
    res.redirect('/inicio/editar/{req.body.id}'), {
      layout: 'admin/layout',
      error: true,
      message: 'No se modifico el NFT vuelva a interntarlo'
    }
  }
})

module.exports = router;