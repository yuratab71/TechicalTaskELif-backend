const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt")
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Schema = mongoose.Schema;

const userSheme = new Schema({
    name: String,
    password: String,
    income: Number
});

const financeSheme = new Schema({
    id: String,
    date: String,
    month: String,
    food: Number,
    sport: Number
});

const User = mongoose.model("User", userSheme);
const Finance = mongoose.model("Finance", financeSheme);

const PORT = process.env.PORT || 80;
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({extends: false}))

async function start() {
    try {
        await mongoose.connect("mongodb+srv://*****************cluster0.r9zna.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        app.delete("/:id&:date", (req, res) => {
            console.log("DELETE")
            try {
                Finance.findOneAndRemove({ id: req.params.id, date: req.params.date}, (err, doc) => {
                    if (err || !doc) {
			res.status(404).send({statusCode: 500});
                    } else {
                        res.status(204).send("Success");
                    }
                })
            } catch (err) {
                console.log(err);
                res.status(500).send("Error");
            }
        })

        app.put("/:id&:date", (req, res) => {
            console.log("PUT")
            try {
                Finance.findOneAndUpdate({ id: req.params.id, date: req.params.date}, {food: req.body.food, sport: req.body.sport}, {rawResult: true} , (err, doc) => {
                    if (err || !doc) {
                        res.status(404).send({statusCode: 500});
                    } else {
                        res.status(200).send(doc);
                    }
                })
            } catch (err) {
                res.status(500).send({statusCode: 500});
            }
        })

        app.get("/:id&:date", (req, res) => {
            console.log("GET");
            try {
                Finance.findOne({ id: req.params.id, date: req.params.date}, (err, doc) => {           
                    if (err || !doc){
                        res.status(404).send("Not found");
                    } else {
                        res.status(200).send(doc);
                    }          
                })
            } catch (err) {
                res.status(500).send({statusCode: 500});
            }
        })

        app.get("/all/:id&:month", (req, res) => { //date in view of Apr(3 letter of month)21(last two numbers of year) == Apr21(example for April 2021)
            console.log("GET ALL");
			try {   
                console.log(req.params.id, req.params.month);
                Finance.find({id: req.params.id, month: req.params.month}, (err, docs) => {
                    console.log(docs);
                    if (err || !docs) {
			res.status(404).send();
                    } else {
			res.status(200).send(docs);
                    } 
                })
            } catch  (err) {
                res.status(500).send({statusCode: 500});
            }
        })
        
        app.post("/finance/create/:id", async (req, res) => {
            console.log("POST")
            try {
                console.log(req.body);
                let {date, food, sport} = req.body;
                let month = date.slice(3, 6);
                console.log(month);
                let cash = new Finance({
                    id: req.params.id,
                    date: date,
                    food: food,
                    month: month,
                    sport: sport
                });
                console.log(cash);
                await cash.save();
                res.status(201).send();
            } catch (err) {
                res.status(500).send({statusCode: 500});
            }
        });
        
        app.post("/user/create", async (req, res) => {
            console.log("POST")
            try {
                const salt = await bcrypt.genSalt(10);
                const hashPass = await bcrypt.hash(req.body.password, salt);
                User.find({name: req.body.name}, (err, docs) => {
                    if (docs.length !== 0) {
                        res.status(409).send({statusCode: 500});    
                    } else {
                        let {name, password, income} = req.body;  
                        let user = new User({
                            name: name,
                            password: hashPass,
                            income: income
                        }); 
                        user.save();
                        res.status(201).send({id: user._id, name: user.name, income: user.income});
                    }
                })
            } catch (err) {
                res.status(500).send();
            }        
        })
	    
        app.post("/user/login", async (req, res) => {     
            console.log("POST")
            const {name, password} = req.body;
            User.find({name: name}, async (err, docs) => {
                try {
                    if ( await bcrypt.compare(password, docs[0].password)){
                        res.status(200).send({id: docs[0]._id, name: docs[0].name, income: docs[0].income}); 
                    } else {
                        rres.status(401).send();
                    }                   
                } catch (err) {
                    res.status(500).send();
                }       
            })
        })
 
        app.listen(PORT, () => {
            console.log("Server has been started...")
        })


    } catch (error) {
        console.error(error);
    }

}

start();

