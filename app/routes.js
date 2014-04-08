var restaurants = require('./controllers/restaurant.js');
var form = require('./controllers/form.js');
module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes
	app.get('/api/restaurantNear/:lon/:lat', restaurants.near);
	app.get('/api/getTextInput', form.textInput);
	app.get('/api/getSelectInput', form.selectInput);
	// POST requests
	app.post('/api/restaurant', form.submit);
	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};