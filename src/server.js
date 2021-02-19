/*********************************************************************************
 * WEB422 – Assignment 1
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Andrei Batomunkuev______ Student ID: 119124196____ Date: 22 January 2021_____
 * Heroku Link: https://ancient-eyrie-99048.herokuapp.com
 *
 ********************************************************************************/
const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const config = require('./db/config')
const openGeocoder = require('node-open-geocoder')
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
    res.status(200).send({ message: 'API Listening' })
})

app.post('/api/restaurants', (req, res) => {
    // This route adds a new "Restaurant" document to the collection
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
    // This route return all "Restaurant" objects for a specific "page" to the client
    // as well as optionally filtering by "borough", if provided.
    let page = req.query.page
    let perPage = req.query.perPage
    let borough = req.query.borough
    let cuisine = req.query.cuisine
    if (cuisine) {
        db.getRestaurantsByCuisine(page, perPage, cuisine)
            .then((result) => {
                if (!result) {
                    res.status(404).json({
                        error_message: `No restaurants found with cuisine ${cuisine}`,
                    })
                }
                res.status(200).json(result)
            })
            .catch((error) => {
                res.status(400).json({ error_message: error })
            })
    } else {
        db.getAllRestaurants(page, perPage, borough)
            .then((result) => {
                if (result.length == 0) {
                    res.status(404).json({
                        error_message: 'No restaurants found',
                    })
                }
                res.status(200).json(result)
            })
            .catch((err) => {
                res.status(400).json({ error_message: `${err}` })
            })
    }
})

app.get('/api/restaurants/:id', (req, res) => {
    // This route return a specific "Restaurant" object to the client based on id provided
    let id = req.params.id
    db.getRestaurantById(id)
        .then((result) => {
            if (!result) {
                res.status(404).json({ error_message: 'No restaurant found' })
            }
            res.status(200).json(result)
        })
        .catch((error) => {
            res.status(400).json({ error_message: error })
        })
})

app.put('/api/restaurants/:id', (req, res) => {
    // This route updates a specific "Restaurant" document in the collection
    let id = req.params.id
    db.updateRestaurantById(req.body, id)
        .then((result) => {
            res.status(200).json({
                message: result,
            })
        })
        .catch((error) => {
            res.status(400).json({
                error_message: `Error occurred in updating restaurant with id: ${id}, ${error}`,
            })
        })
})

app.delete('/api/restaurants/:id', (req, res) => {
    // This route deletes a specific "Restaurant" document from the collection
    let id = req.params.id
    db.deleteRestaurantById(id)
        .then((result) => {
            res.status(204).json({
                message: result,
            })
        })
        .catch((error) => {
            res.status(400).json({
                error_message: `Error occurred when deleting a restaurant with id: ${id}, ${error}`,
            })
        })
})

app.post('/api/location', (req, res) => {
    const FORM_DATA = req.body
    openGeocoder()
        .geocode(FORM_DATA.address)
        .end((err, result) => {
            if (err) {
                return res.status(400).json({
                    error_message: `Error occurred when fetching a location`,
                })
            }
            res.status(200).json(result)
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
