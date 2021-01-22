module.exports = {
    database_connection_string: `mongodb+srv://${process.env.DATABASE_NAME}:${process.env.DATABASE_PASS}@cluster0.ejyro.mongodb.net/${process.env.COLLECTION_NAME}?retryWrites=true&w=majority`,
}
