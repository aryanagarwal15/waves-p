const mongoose = require('mongoose')

const IrshadSchema = mongoose.Schema({
    name: String,
    email: String,
    college: String,
    mobile: String,
    CITYorEVENT: String,
    poem: String
}, { collection: 'irshad' })

const model = mongoose.model('IrshadSchema', IrshadSchema)
module.exports = model