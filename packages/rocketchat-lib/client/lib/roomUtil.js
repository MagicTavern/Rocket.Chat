/**
 * Created by billtt on 25/02/2017.
 */

RocketChat.roomUtil = new (class RoomUtil {

	constructor() {
		this.init();
	}

	/**
	 * Get channels with name and topic
	 */
	_getRoomList(roomIds, roomType, nameFilter, sortOption, limit, incAllChannels) {
		const options = {fields: {name: 1, topic: 1, rid: 1, t: 1, unjoinable: 1}};
		if (limit) {
			options.limit = limit;
		}
		if (sortOption === 'name') {
			options.sort = {name: 1};
		} else if (sortOption === 'ls') {
			options.sort = {ls: -1};
		}

		const query = {
			t: roomType,
			name: nameFilter
		};
		if (roomIds) {
			if (incAllChannels) {
				query.$or = [
					{_id: {$in: roomIds}},
					{t: 'c'}
				];
			} else {
				query._id = {$in: roomIds};
			}
		}
		return RocketChat.models.Rooms.find(query, options).fetch();
	}

	/**
	 * Get Room list by various conditions
	 * @param joined
	 * @param type can be 'c', 'p', or {$in: ['c', 'p']}
	 * @param nameFilter
	 * @param sortOption
	 * @param limit
	 * @returns {*}
	 */
	getRoomList(joined, type, nameFilter, sortOption, limit) {
		if (!joined && type === 'p') {
			joined = true;
		}
		if (!joined && type === 'c') {
			return this._getRoomList(null, type, nameFilter, sortOption, limit, !joined);
		} else {
			const query = {
				t: type,
				'u._id': Meteor.userId()
			};
			const subs = RocketChat.models.Subscriptions.find(query, {
				fields: {rid: 1}
			}).fetch();
			const rids = [];
			if (!subs || subs.length === 0) {
				return [];
			} else {
				for (let i=0; i<subs.length; i++) {
					rids.push(subs[i].rid);
				}
				return this._getRoomList(rids, type, nameFilter, sortOption, limit, !joined);
			}
		}
	}

	getRoomTopic(rid) {
		const result = RocketChat.models.Rooms.findOne({_id: rid});
		return result ? result.topic : '';
	}

	init() {
		Meteor.startup(function() {
			// check for subscription to unjoinable rooms
			ChatSubscription.find().observe({
				added: function(record) {
					const rid = record.rid;
					const room = ChatRoom.findOne({_id: rid});
					if (!room || room.t !== 'c' || !room.unjoinable) {
						return;
					}
					const roomHistory = RoomHistoryManager.getRoom(rid);
					if (!roomHistory || roomHistory.loaded !== 0) {
						return;
					}
					// reset room state
					RoomManager.getOpenedRoomByRid(rid).streamActive = false;
					RoomManager.getOpenedRoomByRid(rid).ready = false;
					RoomHistoryManager.getRoom(rid).loaded = undefined;
					RoomManager.computation.invalidate();
				}});
		});
	}
});
