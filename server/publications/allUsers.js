Meteor.publish('allUsers', function() {
	if (!this.userId) {
		return this.ready();
	}

	return RocketChat.models.Users.findAllUsers({
		fields: {
			name: 1,
			username: 1,
			status: 1,
			utcOffset: 1
		}
	});
});
