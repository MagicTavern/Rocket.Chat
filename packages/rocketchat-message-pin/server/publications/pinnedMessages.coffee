Meteor.publish 'pinnedMessages', (rid, limit=50) ->
	unless this.userId
		return this.ready()

	publication = @

	user = RocketChat.models.Users.findOneById this.userId
	unless user
		return this.ready()

	room = Meteor.call 'canAccessRoom', rid, this.userId
	unless room
		return this.ready()

	if room.t is 'c' and not RocketChat.authz.hasPermission(this.userId, 'preview-c-room') and room.usernames.indexOf(room.username) is -1
		return this.ready()

	if room.t is 'c' and room.unjoinable is true and room.usernames.indexOf(room.username) is -1
		return this.ready()

	cursorHandle = RocketChat.models.Messages.findPinnedByRoom(rid, { sort: { ts: -1 }, limit: limit }).observeChanges
		added: (_id, record) ->
			publication.added('rocketchat_pinned_message', _id, record)

		changed: (_id, record) ->
			publication.changed('rocketchat_pinned_message', _id, record)

		removed: (_id) ->
			publication.removed('rocketchat_pinned_message', _id)

	@ready()
	@onStop ->
		cursorHandle.stop()
