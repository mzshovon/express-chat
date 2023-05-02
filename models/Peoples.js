const mongoose = require('mongoose');
// Chat people schema
const peopleSchema = mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim : true
    },
    email : {
        type: String,
        required: true,
        trim : true,
        lowercase : true
    },
    mobile : {
        type : String,
        required : true
    },
    password : {
        type : String
    },
    status : {
        type : String,
        enum : ['active', 'inactive', 'blocked'],
        default : "active"
    },
    profile_image : {
        type : String
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
} ,{
    timestamps : true
});

const People = mongoose.model('People', peopleSchema)

module.exports = People;