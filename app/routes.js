var restaurants = require('./controllers/restaurant.js');
module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes
	app.get('/api/restaurant', restaurants.all);
	app.get('/api/restaurantNear/:lon/:lat', restaurants.near);
	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};