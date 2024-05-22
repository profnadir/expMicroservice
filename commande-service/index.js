const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4001;

const mongoose = require("mongoose");
const Commande = require("./Commande");
const axios = require('axios');

app.use(express.json());

//Connection à la base de données MongoDB commande-service-db»
//(Mongoose créera la base de données s'il ne le trouve pas)
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/commande-service-db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log(`Commande-Service DB Connected`);
})
.catch(error => {
    console.error('Error connecting to MongoDB:', error);
});

//Calcul du prix total d'une commande en passant en paramètre un tableau 
//des produits
function prixTotal(produits) {
    let total = 0;
    for (let t = 0; t < produits.length; ++t) {
        total += produits[t].prix;
    }
    console.log("prix total :" + total);
    return total;
}
//Cette fonction envoie une requête http au service produit pour récupérer 
//le tableau des produits qu'on désire commander (en se basant sur leurs ids)
async function httpRequest(ids) {
    try {
        //console.log(ids);
        const URL = "http://localhost:4000/produit/acheter"
        const response = await axios.post(URL, { ids: ids }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        //appel de la fonction prixTotal pour calculer le prix total de 
        //la commande en se basant sur le résultat de la requête http
        //console.log(response);
        return prixTotal(response.data);
    } catch (error) {
        console.error(error);
    }
}

const bodyParser = require('body-parser');
const isAuthenticated = require("./isAuthenticated");
app.use(bodyParser.json());

app.post("/commande/ajouter",isAuthenticated, async (req, res, next) => {
    // Création d'une nouvelle commande dans la collection commande
    const { ids } = req.body;

    httpRequest(req.body.ids)
    .then(total => {
        const newCommande = new Commande({
            "produits":ids,
            email_utilisateur: req.user.email,
            prix_total: total,
        });
        newCommande.save()
            .then(commande => res.status(201).json(commande))
            .catch(error => res.status(400).json({ error }));
    });
});
app.listen(PORT, () => {
    console.log(`Commande-Service at ${PORT}`);
});