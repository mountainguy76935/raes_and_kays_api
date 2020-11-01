const mongoose = require('mongoose');
const Schema = mongoose.Schema
const MenuSchema = new Schema({
    openDates: [{
        day: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        }
    }],
    entreeItems: [
        {
            name: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            picture: {
                type: String
            }
        }
    ],
    sideItems: [
        {
            name: {
                type: String,
                required: true
            },
            genre: {
                type: String,
                required: true
            },
            description: {
                type: String
            },
            picture: {
                type: String
            }
        }
    ],
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    popup:
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            images: {
                type: String
            }
        }
})

module.exports = mongoose.model('Menu', MenuSchema)