const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4000;

const mongoose = require("mongoose");
const Produit = require("./Produit");

app.use(express.json());

//Connection à la base de données MongoDB produit-service-db»
//(Mongoose créera la base de données s'il ne le trouve pas)
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/produit-service-db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log(`Produit-Service DB Connected`);
})
.catch(error => {
    console.error('Error connecting to MongoDB:', error);
});

app.post("/produit/ajouter", (req, res, next) => {
    const { nom, description, prix } = req.body;
    const newProduit = new Produit({
        nom,
        description,
        prix
    });

    //La méthode save() renvoie une Promise.
    //Ainsi, dans le bloc then(), nous renverrons une réponse de réussite avec un code 201 de réussite.
    //Dans le bloc catch () , nous renverrons une réponse avec l'erreur générée par Mongoose ainsi qu'un code d'erreur 400.
    newProduit.save()
        .then(produit => res.status(201).json(produit))
        .catch(error => res.status(400).json({ error }));
});

/* const bodyParser = require('body-parser');
app.use(bodyParser.json()); */
app.post("/produit/acheter", (req, res, next) => {
    const { ids } = req.body;
    console.log(ids);
    Produit.find({ _id: { $in: ids } })
        .then(produits => {console.log(produits); res.status(201).json(produits)})
        .catch(error => res.status(400).json({ error }));
});

app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);
});
