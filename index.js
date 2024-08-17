const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000

app.use(express.json());



app.use(cors(
  {
    origin:[
      "http://localhost:5173"
    ]
  }
));



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.swwr6sg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {

    await client.connect();

    const db = client.db('ClassicalString');

    const products = db.collection('products')

    app.get('/products', async (req, res) => {
      const brand = req?.query?.brand;
      const sort = req?.query?.sort;
      let limit = req?.query?.limit;
      limit = parseInt(limit)
      const page = req?.query?.page
      const range = req?.query?.range;
      const category = req?.query?.category;
      const search = req?.query?.search;
      let order = ""
      if(sort === "rating"){

        order = req?.query?.order === 'desc' ? 1 : -1;
      }else{
        order = req?.query?.order === 'desc' ? -1 : 1;
      }
      let query = {};

      if (brand && brand !== "all") {
        query.brand = brand;
      }

      if (category && category !== "all") {
        if(category === "classical") {
          query.stringType = "Nylon";
        } else {
          query.stringType = "Steel";
        }
      }

      if (range && range !== "all") {
        const [min, max] = range.split('-');
        query.price = {
          $gte: parseInt(min) || 0,
          ...(max ? { $lte: parseInt(max) } : {}),
        };
      }

      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }









      try {

        const totalItems = await products.countDocuments(query);





        const result = await products
          .find(query)
          .sort({ [sort]: order })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();


        res.send({totalItems,products:result});
      } catch (error) {
        console.log(error)
        res.status(500).send(error);
      }
    });



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {


  }
}





run().catch(console.dir);







app.get('/',(req,res)=>{
  res.send('my server classical string')

})
app.listen(port,()=>{
  console.log('server running')
})
