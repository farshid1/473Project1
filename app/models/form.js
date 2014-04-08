'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var TextInputSchema = new Schema({
	type: {
		type: String,
    	trim: true
	},
	name: {
		type: String,
    	trim: true
	},
	placeholder: {
		type: String,
    	trim: true
	},
	class: {
		type: String,
    	trim: true
	},
	labelClass: {
		type: String,
    	trim: true
	},
	labelFor: {
		type: String,
    	trim: true
	},
	divClass: {
		type: String,
    	trim: true
	},
	order: {
		type: String,
    	trim: true
	}
});



var SelectInputSchema = new Schema({
	id: {
		type: String,
    	trim: true
	},
	name: {
		type: String,
    	trim: true
	},
	selectClass: {
		type: String,
    	trim: true
	},
	labelClass: {
		type: String,
    	trim: true
	},
	labelFor: {
		type: String,
    	trim: true
	},
	divClass: {
		type: String,
    	trim: true
	},
	selectOptions: [String]
});

	



//We should add the last argument to link the model to our collection
var TextInput = mongoose.model('TextInput', TextInputSchema, 'textInput');
var SelectInput = mongoose.model('SelectInput', SelectInputSchema, 'selectInput');

exports.TextInput = TextInput;
exports.SelectInput = SelectInput;
