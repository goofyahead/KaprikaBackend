//Modal view definition

define(['backbone', 'text!templates/modalOptions.html'], function(Backbone, template){
	var ModalView = Backbone.View.extend({

		selection: [],

		currentOptionsGlobal : {},

		template: _.template(template),

		tagName: 'div',
		id: 'modal',

		initialize: function(){
			this.selection = [];
			console.log("initializing ++++++++++++++++++++++++++++");
			console.log("options are:" , this.model);
			console.log(this.options.selection);
		},

		events: {
			'click #save-modal' : 'save_clicked',
			'click #modal-element': 'button_clicked',
			'click #delete-option': 'delete_option',
			'click #add-option': 'add_option',
			'click #delete-complete': 'del_cat',
			'click #cat-name-change': 'cat_name_change'
		},

		del_cat : function (ev) {
			var catToDel = $(ev.currentTarget).attr('data-value');
			this.model.deleteOption(catToDel);
		},

		cat_name_change : function (ev) {
			console.log(this.options.selection + "is now " + $("#cat-name").val());
			var newName = $("#cat-name").val();
			this.model.updateCatName(this.options.selection, newName);
			this.options.selection = newName;
			console.log(this.model);
		},

		add_option: function (ev) {
			console.log( $('#new-option').val() );
			var given = $('#new-option').val();
			var newOptions = this.model.get('options');
			newOptions[this.options.selection].push(given);
			console.log(newOptions);
			this.model.set({options : newOptions});
			$("#options-div").append('<div class="row" id="row-' + given + '"><div class="span2">' + given + ' </div> <div class="span2"><button type="button" class="btn btn-danger" id="delete-option" data-value='+ given+' >Eliminar</button></div></div>');
		},

		delete_option: function (ev) {
			console.log(this.model);
			var newOptions = this.model.get('options');
			console.log(newOptions);
			console.log(newOptions[this.options.selection] , $(ev.currentTarget).attr('data-value'));
			newOptions[this.options.selection] = _.without(newOptions[this.options.selection], $(ev.currentTarget).attr('data-value'));
			this.model.set({options : newOptions});
			console.log(this.model);
			$('#row-' + $(ev.currentTarget).attr('data-value')).remove();
		},

		save_clicked: function(ev){
			this.model.save();
		},

		button_clicked: function(ev){
			console.log('clicked');
			var textTarget = $(ev.currentTarget).text().trim();
			if ($(ev.currentTarget).hasClass("btn-primary")){
				$(ev.currentTarget).removeClass("btn-primary");
				console.log(this.selection);
				console.log('position of current:' + textTarget + ':in: ' + this.selection.indexOf(textTarget));
				this.selection.splice(this.selection.indexOf(textTarget),1);
				console.log('afer removing ' + this.selection);
			} else {
				$(ev.currentTarget).addClass("btn-primary");
				//this should add the id and the name in an object {}
				this.setObjectSelection($(ev.currentTarget).text().trim());
			}
		},

		setObjectSelection: function (dishSelected) {
			var currentElement = {};
			currentElement.name = dishSelected;
			var result = $.grep(this.collection.models, function(e){ 
				return e.get('name') == dishSelected;
			});
			currentElement._id = result[0].get('_id');
			this.selection.push(currentElement);
		},

		render: function() {
			console.log("in render", this.model.get('options')[this.options.selection]);
			var compiledTemplate = this.template({
            	options: this.model.get('options')[this.options.selection] || [],
            	selection : this.options.selection || ""
        	});
			this.$el.html(compiledTemplate);
			return this;
		}
	});

	return ModalView;
})