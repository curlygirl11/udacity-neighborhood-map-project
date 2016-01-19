var initialLocations = [
	{
		name: 'Bracher Park',
		lat: 37.370,
		long: -122.002
	},
	{
		name: 'Hacker Dojo',
		lat: 37.402,
		long: -122.052
	},
	{
		name: 'Red Rock Coffee',
		lat: 37.393,
		long:-122.081
	},
	{
		name: 'Com Tam Thanh (Broken Rice)',
		lat: 37.309,
		long: -121.934
	},
	{
		name: 'House of Falafel',
		lat: 37.322,
		long: -122.018
	},
	{
		name: 'The Prolific Oven',
		lat: 37.394,
		long: -121.948
	},
	{
		name: 'Pho Mai #1 Noodle House',
		lat: 37.415,
		long: -121.878
	},
	{
		name: 'Alviso Marina County Park',
		lat: 37.429,
		long: -121.984
	}

]

var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.long = data.long;
	this.URL = "";
	this.street = "";
	this.city = "";
	this.phone = "";

	this.visible = ko.observable(true);
	this.selected = ko.observable(false);

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

	$.getJSON(foursquareURL).done(function(data) {
		console.log('AJAX is working!');
		var results = data.response.venues[0];
		self.URL = results.url;
		console.log(self.URL);
		self.street = results.location.formattedAddress[0];
		console.log(self.street);
     	self.city = results.location.formattedAddress[1];
     	console.log(self.city);
      	self.phone = results.contact.phone;
      	console.log(self.phone);

      	console.log(results);
	}).fail(function() {
		self.error = "There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.";
	});

	this.contentString = '<div class="info-window-content"><div class="title">' + data.name + "</div>" +
        '<div class="content">' + self.URL + "</div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content">' + self.phone + "</div></div>";

	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.long),
			map: map,
			title: data.name
	});

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.bounceMarker = ko.computed(function() {
		if(this.selected() === true) {
			this.marker.setAnimation(google.maps.Animation.BOUNCE);
		} else {
			this.marker.setAnimation(null);
		}
		return true;
	}, this);

	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title">' + data.name + "</div>" +
        '<div class="content">' + self.URL + "</div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content">' + self.phone + "</div></div>";

        self.infoWindow.setContent(self.contentString);

		self.infoWindow.open(map, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});
};

function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: {lat: 37.370, lng: -122.002}
	});

	// Foursquare API settings
	clientID = "V443OTCAQPJLCRY4QWBFYN3ZK5FDKGJOYDHLMI3O342IRVNN";
	clientSecret = "AK1JHLEG2D2KW14WF5HYVFNTUYFTBXYS4LDUUNRAHPR5URLB";

	initialLocations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
};

function startApp() {
	ko.applyBindings(new AppViewModel());
}