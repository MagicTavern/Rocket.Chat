Template.createCombinedFlex.helpers
	selectedUsers: ->
		return Template.instance().selectedUsers.get()

	name: ->
		return Template.instance().selectedUserNames[this.valueOf()]

	error: ->
		return Template.instance().error.get()

	roomName: ->
		return Template.instance().roomName.get()

	autocompleteSettings: ->
		return {
			limit: 10
			# inputDelay: 300
			rules: [
				{
					# @TODO maybe change this 'collection' and/or template
					collection: 'UserAndRoom'
					subscription: 'userAutocomplete'
					field: 'username'
					template: Template.userSearch
					noMatchTemplate: Template.userSearchEmpty
					matchAll: true
					filter:
						exceptions: [Meteor.user().username].concat(Template.instance().selectedUsers.get())
					selector: (match) ->
						return { term: match }
					sort: 'username'
				}
			]
		}
	privateSwitchDisabled: ->
		return if RocketChat.authz.hasAllPermission ['create-c', 'create-p'] then '' else 'disabled'
	privateSwitchChecked: ->
		return if RocketChat.authz.hasAllPermission 'create-c' then '' else 'checked'
	privateSwitchHidden: ->
		return if RocketChat.authz.hasAllPermission ['create-c', 'create-p'] then '' else 'hidden'

	unjoinableSwitchHidden: ->
		if not RocketChat.authz.hasAllPermission 'create-c'
			return 'hidden'
		privateGroup = Template.instance().privateGroup.get()
		return if privateGroup then 'hidden' else ''

	groupLimitHidden: ->
		return if RocketChat.settings.get 'Group_Limit_Enable' then '' else 'hidden'
	groupLimitNumber: ->
		return RocketChat.settings.get 'Group_Limit_Number'

Template.createCombinedFlex.events
	'autocompleteselect #channel-members': (event, instance, doc) ->
		instance.selectedUsers.set instance.selectedUsers.get().concat doc.username

		instance.selectedUserNames[doc.username] = doc.name

		event.currentTarget.value = ''
		event.currentTarget.focus()

	'click .remove-room-member': (e, instance) ->
		self = @

		users = Template.instance().selectedUsers.get()
		users = _.reject Template.instance().selectedUsers.get(), (_id) ->
			return _id is self.valueOf()

		Template.instance().selectedUsers.set(users)

		$('#channel-members').focus()

	'click header': (e, instance) ->
		SideNav.closeFlex ->
			instance.clearForm()

	'click .cancel-channel': (e, instance) ->
		SideNav.closeFlex ->
			instance.clearForm()

	'mouseenter header': ->
		SideNav.overArrow()

	'mouseleave header': ->
		SideNav.leaveArrow()

	'keydown input[type="text"]': (e, instance) ->
		Template.instance().error.set([])

	'keyup #channel-name': (e, instance) ->
		if e.keyCode is 13
			instance.$('#channel-members').focus()

	'keydown #channel-members': (e, instance) ->
		if $(e.currentTarget).val() is '' and e.keyCode is 13
			instance.$('.save-channel').click()

	'change #channel-type': (e, instance) ->
		instance.privateGroup.set instance.find('#channel-type').checked

	'click .save-channel': (e, instance) ->
		err = SideNav.validate()
		name = instance.find('#channel-name').value.toLowerCase().trim()
		privateGroup = instance.find('#channel-type').checked
		readOnly = instance.find('#channel-ro').checked
		createRoute = if privateGroup then 'createPrivateGroup' else 'createChannel'
		successRoute = if privateGroup then 'group' else 'channel'
		unjoinable = if privateGroup then false else instance.find('#unjoinable').checked
		instance.roomName.set name

		# check group limit
		if privateGroup and RocketChat.settings.get 'Group_Limit_Enable'
			limit = RocketChat.settings.get 'Group_Limit_Number'
			if instance.selectedUsers.get().length > limit
				instance.error.set({grouplimitexceed: true})
				return

		if not err
			Meteor.call createRoute, name, instance.selectedUsers.get(), readOnly, {}, unjoinable, (err, result) ->
				if err
					console.log err
					if err.error is 'error-invalid-name'
						instance.error.set({ invalid: true })
						return
					if err.error is 'error-duplicate-channel-name'
						instance.error.set({ duplicate: true })
						return
					if err.error is 'error-archived-duplicate-name'
						instance.error.set({ archivedduplicate: true })
						return
					else
						return handleError(err)

				SideNav.closeFlex ->
					instance.clearForm()

				if not privateGroup
					RocketChat.callbacks.run 'aftercreateCombined', { _id: result.rid, name: name }

				FlowRouter.go successRoute, { name: name }, FlowRouter.current().queryParams
		else
			console.log err
			instance.error.set({ fields: err })

Template.createCombinedFlex.onCreated ->
	instance = this
	instance.selectedUsers = new ReactiveVar []
	instance.selectedUserNames = {}
	instance.error = new ReactiveVar []
	instance.roomName = new ReactiveVar ''
	instance.privateGroup = new ReactiveVar false

	instance.clearForm = ->
		instance.error.set([])
		instance.roomName.set('')
		instance.selectedUsers.set([])
		instance.find('#channel-name').value = ''
		instance.find('#channel-type').checked = false;
		instance.find('#channel-members').value = ''
		instance.find('#unjoinable').checked = true
		instance.privateGroup.set false
