const express = require("express");
const bodyParser = require('body-parser');
const {Sequelize, DataTypes} = require("sequelize");
const app = express();
const Joi = require('joi');
const config = require("config.json")

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const sequelize = new Sequelize(config.database, config.user, config.password, {
    dialect: 'mysql',
    host: config.host,
    port: config.port
});

sequelize.authenticate().then(r => console.log("Connection has been established successfully.")).catch(err => console.log(err, "err"));

const User = sequelize.define('users', {
    name: {type: DataTypes.STRING},
    surname: {type: DataTypes.STRING},
    phoneNumber: {type: DataTypes.STRING, maxLength: 11},
    location: {type: DataTypes.STRING},
    gender: {type: DataTypes.TINYINT}
});

//sequelize.sync({force: true}).then(x => console.log(x, "sync"));


app.get("/", (req, res) => {
    User.findAll().then(x => res.send(x));
});

app.get("/api/users", (req, res) => {
    User.findAll().then(result => res.send(result))
});

app.get("/api/users/:id", (req, res) => {
    User.findOne({where: {id: req.params.id}}).then(result => {
        if (result !== null) return res.send(result);
        return res.status(404).send("User not found!");
    });
});

app.post("/api/users", (req, res) => {
    if (req.body == undefined) return res.status(404).send("Body is empty!")
    const schema = Joi.object({
        name: Joi.string()
            .required(),
        surname: Joi.string()
            .required(),
        phoneNumber: Joi.string()
            .length(11)
            .required(),
        location: Joi.string()
            .required(),
        gender: Joi.number()
            .integer()
            .min(1)
            .max(2)
            .required(),
    });
    const validation = schema.validate(req.body);
    if (validation.error)  return res.status(404).send(validation.error.details[0].message)
    User.create({
        name: req.body.name,
        surname: req.body.surname,
        phoneNumber: req.body.phoneNumber,
        location: req.body.location,
        gender: req.body.gender
    }).then(x => {
        res.send(`${x} added user.`);
    }).catch(err => res.status(404).send(err.message));

});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});