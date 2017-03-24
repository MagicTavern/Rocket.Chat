/**
 * Created by billtt on 25/02/2017.
 */

RocketChat.userUtil = new (class UserUtil {

	constructor() {
		this.init();
	}

	/**
	 * Get user's name from username, fallback to username if user not found
	 * @param username
	 * @returns {*}
	 */
	getName(username) {
		const user = RocketChat.models.Users.findOne({username: username}, {fields: {name: 1}});
		return user ? user.name : username;
	}

	init() {
		Meteor.startup(function() {
		});
	}
});
