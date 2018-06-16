const BITSEvent = require('./event')

async function addEntry(name, email, college, mobile, event, CITYorEVENT = 'not available') {
    // other validation?
    const check = await BITSEvent.findOne({ college, event })
    const entry = new BITSEvent({name, email, college, mobile, event, CITYorEVENT})
    await entry.save()
    return { status: 'ok' }
}

module.exports = { addEntry }