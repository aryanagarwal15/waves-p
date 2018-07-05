const Irshad = require('./irshad_schema')

async function addEntry(name, email, college, mobile, CITYorEVENT, poem = 'not available') {
    // other validation?

    const entry = new Irshad({name, email, college, mobile, CITYorEVENT, poem})
    await entry.save()
    return { status: 'ok' }
}

module.exports = { addEntry }