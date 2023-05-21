const mongoose = require("mongoose");
const {DateTime} = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  if (!this.first_name || !this.family_name) {
    fullname = "";
  }
  return fullname;
});

//Virtual for author's URL

AuthorSchema.virtual("url").get(function () {
    //Dont use an arrow function as we will need the this object
    return `/catalog/author/${this._id}`;
});

 AuthorSchema.virtual("life_span").get(function () {
  let life_span = ''

  if (typeof this.date_of_birth !== 'object' && typeof this.date_of_death !== 'object') {
    life_span = 'No birth/death data';
  } 
  else if (typeof this.date_of_birth !== 'object') {
    let date_of_birth_f =  'No birth data';
    let date_of_death_f =  DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
    life_span = date_of_birth_f + ' - ' + date_of_death_f;   
  }
  else if (typeof this.date_of_death !== 'object') {
    let date_of_birth_f =  DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    let date_of_death_f =  'No death data';
    life_span = date_of_birth_f + ' - ' + date_of_death_f;    
  }
  else {
    let date_of_birth_f =  DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    let date_of_death_f =  DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
    life_span = date_of_birth_f + ' - ' + date_of_death_f;    
  }
  return life_span;
 })

// Export model
module.exports = mongoose.model("Author", AuthorSchema)