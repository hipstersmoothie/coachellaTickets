var fs      = require("fs"),
		_       = require('lodash'),
		sqlite3 = require('sqlite3').verbose(),
		twilio  = require('twilio');

var client = twilio('AC93366747b3404f6da1eddc2a5063cdb4', '195d7dcf403d67b6d0df6cc8a845fb8b'),
		db     = new sqlite3.Database('/Users/lisowski/Library/Group\ Containers/4GWDBCF5A4.group.com.shazam/com.shazam.mac.Shazam/ShazamDataModel.sqlite');

var desiredArtists = [
	"m83",
	"guns n' roses", 
	"courtney barnett"
];
var numbers = [
	'6195406339', 
	'6194516589', 
	'6193585728',
	'6198768561',
	'4082504666',
	'7603178925',
	'7603156395',
	// '6192545058',
	'7608259316',
	'7605331774',
	'9708190099'
];
var playedArtists = [];
var checkShazamInterval;

function sendText(number) {
	client.sms.messages.create({
    to   : '+1' + number,
    from : '+13197741101',
    body : "It\s' you chance to win coachella tickets on 91x! Call 6195701919, if it\'s' '" + _.last(desiredArtists) + "' and you're #9, you win!"
	}, function(error, message) {
    if (!error) {
      console.log('Success! The SID for this SMS message is:');
      console.log(message.sid);
      console.log('Message sent on:');
      console.log(message.dateCreated);
    } else {
      console.log('Oops! There was an error.', error);
    }
	});
}

function checkForDesiredArtists(callback) {
	db.all("select track.Z_PK as ZID, ZDATE, ZTRACKNAME, ZNAME from ZSHARTISTMO artist, ZSHTAGRESULTMO track where artist.ZTAGRESULT = track.Z_PK and track.Z_PK", function(err, artists) {
      if(artists[artists.length - 1].ZNAME.toLowerCase().indexOf(desiredArtists[1]) == -1)
      	return callback(false);
      
      if(artists[artists.length - 2].ZNAME.toLowerCase().indexOf(desiredArtists[0]) == -1)
      	return callback(false);

      return callback(true);
  });
}

function pollShazamNotifications() {
	checkForDesiredArtists(function(found) {
		console.log('found: ', found ? '√' : 'X');

		if(found) {
			clearInterval(checkShazamInterval);
			_.forEach(numbers, sendText);
			db.close();
		}
	});
}

db.serialize(function() {
	checkShazamInterval = setInterval(pollShazamNotifications, 20 * 1000);
	desiredArtists = _.map(desiredArtists, function(artist) { return artist.toLowerCase(); } );
	pollShazamNotifications();
});
