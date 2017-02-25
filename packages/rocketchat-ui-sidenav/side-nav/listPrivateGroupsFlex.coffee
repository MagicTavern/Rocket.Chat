Template.listPrivateGroupsFlex.helpers
	groups: ->
		return Template.instance().groups.get()
	hasMore: ->
		return Template.instance().hasMore.get()
	sortSelected: (sort) ->
		return Template.instance().sort.get() is sort
	hidden: ->
		return !!RocketChat.models.Subscriptions.findOne({ name: @name, open: false })

Template.listPrivateGroupsFlex.events
	'click header': ->
		SideNav.closeFlex()

	'click .channel-link': ->
		SideNav.closeFlex()

	'mouseenter header': ->
		SideNav.overArrow()

	'mouseleave header': ->
		SideNav.leaveArrow()

	'scroll .content': _.throttle (e, t) ->
		if t.hasMore.get() and e.target.scrollTop >= e.target.scrollHeight - e.target.clientHeight
			t.limit.set(t.limit.get() + 50)
	, 200

	'keyup #channel-search': _.debounce (e, instance) ->
		instance.nameFilter.set($(e.currentTarget).val())
	, 300

	'change #sort': (e, instance) ->
		instance.sort.set($(e.currentTarget).val())

Template.listPrivateGroupsFlex.onCreated ->
	@groups = new ReactiveVar []
	@hasMore = new ReactiveVar true
	@limit = new ReactiveVar 50
	@nameFilter = new ReactiveVar ''
	@sort = new ReactiveVar 'name'

	@autorun =>
		@hasMore.set true
		limit = null
		if _.isNumber @limit.get()
			limit = @limit.get()
		sort = null
		if _.trim(@sort.get())
			sort = @sort.get()
		nameFilter = new RegExp s.trim(s.escapeRegExp(@nameFilter.get())), "i"
		@groups.set RocketChat.roomUtil.getRoomList(true, 'p', nameFilter, sort, limit)
		if @groups.get().length < @limit.get()
			@hasMore.set false
