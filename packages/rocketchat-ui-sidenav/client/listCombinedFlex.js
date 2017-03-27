Template.listCombinedFlex.helpers({
	channel() {
		return Template.instance().channelsList.get();
	},
	hasMore() {
		return Template.instance().hasMore.get();
	},
	sortChannelsSelected(sort) {
		return Template.instance().sortChannels.get() === sort;
	},
	sortSubscriptionsSelected(sort) {
		return Template.instance().sortSubscriptions.get() === sort;
	},
	showSelected(show) {
		return Template.instance().show.get() === show;
	},
	channelTypeSelected(type) {
		return Template.instance().channelType.get() === type;
	},
	member() {
		return !!RocketChat.models.Subscriptions.findOne({ name: this.name, open: true });
	},
	hidden() {
		return !!RocketChat.models.Subscriptions.findOne({ name: this.name, open: false });
	},
	roomIcon() {
		return RocketChat.roomTypes.getIcon(this.t, this.unjoinable);
	},
	url() {
		return this.t === 'p' ? 'group' : 'channel';
	}
});

Template.listCombinedFlex.events({
	'click header'() {
		return SideNav.closeFlex();
	},

	'click .channel-link'() {
		return SideNav.closeFlex();
	},

	'mouseenter header'() {
		return SideNav.overArrow();
	},

	'mouseleave header'() {
		return SideNav.leaveArrow();
	},

	'scroll .content': _.throttle(function(e, t) {
		if (t.hasMore.get() && (e.target.scrollTop >= (e.target.scrollHeight - e.target.clientHeight))) {
			return t.limit.set(t.limit.get() + 50);
		}
	}
	, 200),

	'submit .search-form'(e) {
		return e.preventDefault();
	},

	'keyup #channel-search': _.debounce((e, instance) => instance.nameFilter.set($(e.currentTarget).val())
	, 300),

	'change #sort-channels'(e, instance) {
		return instance.sortChannels.set($(e.currentTarget).val());
	},

	'change #channel-type'(e, instance) {
		return instance.channelType.set($(e.currentTarget).val());
	},

	'change #sort-subscriptions'(e, instance) {
		return instance.sortSubscriptions.set($(e.currentTarget).val());
	},

	'change #show'(e, instance) {
		const show = $(e.currentTarget).val();
		if (show === 'joined') {
			instance.$('#sort-channels').hide();
			instance.$('#sort-subscriptions').show();
		} else {
			instance.$('#sort-channels').show();
			instance.$('#sort-subscriptions').hide();
		}
		return instance.show.set(show);
	}
});

Template.listCombinedFlex.onCreated(function() {
	this.channelsList = new ReactiveVar([]);
	this.hasMore = new ReactiveVar(true);
	this.limit = new ReactiveVar(50);
	this.nameFilter = new ReactiveVar('');
	this.sortChannels = new ReactiveVar('name');
	this.sortSubscriptions = new ReactiveVar('name');
	this.channelType = new ReactiveVar('all');
	this.show = new ReactiveVar('all');
	this.type = this.t === 'p' ? 'group' : 'channel';

	return this.autorun(() => {
			this.hasMore.set(true);
			let limit = null;
			if (_.isNumber(this.limit.get())) {
				limit = this.limit.get();
			}
			let sort = null;
			if (_.trim(this.sortSubscriptions.get())) {
				sort = this.sortSubscriptions.get();
			}
			let nameFilter = new RegExp(s.trim(s.escapeRegExp(this.nameFilter.get())), "i");
			let joined = this.show.get() === 'joined';
			let type = {
				$in: ['c', 'p']
			};
			if (_.trim(this.channelType.get())) {
				switch (this.channelType.get()) {
					case 'public':
						type = 'c';
						break;
					case 'private':
						type = 'p';
				}
			}
			this.channelsList.set(RocketChat.roomUtil.getRoomList(joined, type, nameFilter, sort, limit));
			if (this.channelsList.get().length < this.limit.get()) {
				this.hasMore.set(false);
			}
		}
	);
});
