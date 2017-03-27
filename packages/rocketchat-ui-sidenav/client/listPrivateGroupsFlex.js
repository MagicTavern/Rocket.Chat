Template.listPrivateGroupsFlex.helpers({
	groups() {
		return Template.instance().groups.get();
	},
	hasMore() {
		return Template.instance().hasMore.get();
	},
	sortSelected(sort) {
		return Template.instance().sort.get() === sort;
	},
	hidden() {
		return !!RocketChat.models.Subscriptions.findOne({ name: this.name, open: false });
	}
});

Template.listPrivateGroupsFlex.events({
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

	'keyup #channel-search': _.debounce((e, instance) => instance.nameFilter.set($(e.currentTarget).val())
	, 300),

	'change #sort'(e, instance) {
		return instance.sort.set($(e.currentTarget).val());
	}
});

Template.listPrivateGroupsFlex.onCreated(function() {
	this.groups = new ReactiveVar([]);
	this.hasMore = new ReactiveVar(true);
	this.limit = new ReactiveVar(50);
	this.nameFilter = new ReactiveVar('');
	this.sort = new ReactiveVar('name');

	return this.autorun(() => {
			this.hasMore.set(true);
			let limit = null;
			if (_.isNumber(this.limit.get())) {
				limit = this.limit.get();
			}
			let sort = null;
			if (_.trim(this.sort.get())) {
				sort = this.sort.get();
			}
			let nameFilter = new RegExp(s.trim(s.escapeRegExp(this.nameFilter.get())), "i");
			this.groups.set(RocketChat.roomUtil.getRoomList(true, 'p', nameFilter, sort, limit));
			if (this.groups.get().length < this.limit.get()) {
				this.hasMore.set(false);
			}
		}
	);
});
