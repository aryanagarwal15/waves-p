const mongoose = require('mongoose')

const InverseSchema = mongoose.Schema({
    name: String,
    email: String,
    college: String,
    mobile: String,
    CITYorEVENT: String,
    poem: String
}, { collection: 'inverse' })

const model = mongoose.model('InverseSchema', InverseSchema)
module.exports = model