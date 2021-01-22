const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const config = require('./db/config')
const RestaurantDB = require('./modules/restaurantDB.js')

// Database configuration
const connectionString = config.database_connection_string
const db = new RestaurantDB(connectionString)

// Initializing express
var app = express()
var port = process.env.PORT || 8080

// Setup middleware
app.use(cors())
app.use(bodyParser.json())

// Routes
app.get('/', (req, res) => {
    res.status(201).send({ message: 'API Listening' })
})

app.post('/api/restaurants', (req, res) => {
    db.addNewRestaurant(req.body)
        .then((result) => {
            res.status(201).json({
                message: result,
            })
        })
        .catch((error) => {
            res.status(400).json({ error_message: error })
        })
})

app.get('/api/restaurants', (req, res) => {
    let page = req.query.page
    let perPage = req.query.perPage
    let borough = req.query.borough
    db.getAllRestaurants(page, perPage, borough)
        .then((result) => {
            if (!result) {
                res.status(404).json({
                    error_message: 'No restaurants founded',
                })
            }
            res.status(200).json(result)
        })
        .catch((err) => {
            res.status(500).json(err)
        })
})

app.get('/api/restaurants/:id', (req, res) => {
    let id = req.params.id
    db.getRestaurantById(id)
        .then((result) => {
            if (!result) {
                res.status(404).json({ error_message: 'No restaurant founded' })
            }
            res.status(200).json(result)
        })
        .catch((error) => {
            res.status(400).json({ error_message: error })
        })
})

app.put('/api/restaurants/:id', (req, res) => {
    let id = req.params.id
    db.updateRestaurantById(req.body, id)
        .then((result) => {
            if (!result) {
                res.status(404).json({
                    error_message: `There is no restaurant with id: ${id} to update`,
                })
            }
            res.status(200).json({
                message: result,
            })
        })
        .catch((error) => {
            res.status(400).json({
                error_message: `Error occured in updating restaurant with id: ${id}, ${error}`,
            })
        })
})

app.delete('/api/restaurants/:id', (req, res) => {
    let id = req.params.id
    db.deleteRestaurantById(id)
        .then((result) => {
            if (!result) {
                res.status(404).json({
                    error_message: `There is no restaurant with id: ${id} to delete`,
                })
            }
            res.status(200).json({
                message: result,
            })
        })
        .catch((error) => {
            res.status(400).json({
                error_message: `Error occured when deleting a restaurant with id: ${id}, ${error}`,
            })
        })
})

// Connect to the MongoDB Atlas cluster
db.initialize()
    .then(() => {
        // Setup http server to listen on the port
        app.listen(port, () => {
            console.log(`server listening on: ${port}`)
        })
    })
    .catch((err) => {
        console.log(err)
    })
