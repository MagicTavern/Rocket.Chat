Meteor.publish('roomFiles', function(rid, limit = 50) {
	if (!this.userId) {
		return this.ready();
	}

	// check permissions

	const room = Meteor.call('canAccessRoom', rid, this.userId);

	if (!room) {
		return this.ready();
	}

	if (room.t === 'c' && !RocketChat.authz.hasPermission(this.userId, 'preview-c-room') && room.usernames.indexOf(room.username) === -1) {
		return this.ready();
	}

	if (room.t === 'c' && room.unjoinable === true && room.usernames.indexOf(room.username) === -1) {
		return this.ready();
	}

	const pub = this;

	const cursorFileListHandle = RocketChat.models.Uploads.findNotHiddenFilesOfRoom(rid, limit).observeChanges({
		added(_id, record) {
			return pub.added('room_files', _id, record);
		},
		changed(_id, record) {
			return pub.changed('room_files', _id, record);
		},
		removed(_id, record) {
			return pub.removed('room_files', _id, record);
		}
	});

	this.ready();

	return this.onStop(function() {
		return cursorFileListHandle.stop();
	});
});
