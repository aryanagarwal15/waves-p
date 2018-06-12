const BITSEvent = require('./event')

async function addEntry(name, email, college, mobile, event) {
    // other validation?
    const check = await BITSEvent.findOne({ college, event })
    const entry = new BITSEvent({name, email, college, mobile, event})
    await entry.save()
    return { status: 'ok' }
}

module.exports = { addEntry }