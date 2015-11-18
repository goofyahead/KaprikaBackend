//Modal view definition

define(['backbone', 'text!templates/modal.html'], function(Backbone, template){
	var ModalView = Backbone.View.extend({

		selection: [],

		template: _.template(template),

		tagName: 'div',
		id: 'modal',

		initialize: function(){
			this.selection = [];
			console.log("initializing ++++++++++++++++++++++++++++");
			console.log(this.options.having.get(this.options.what));
			this.options.having.get(this.options.what).forEach(this.addToSelection, this);
		},

		addToSelection: function (relation) {
			this.selection.push(relation);
		},

		events: {
			'click #save-modal' : 'save_clicked',
			'click #modal-element': 'button_clicked'
		},

		save_clicked: function(ev){
			this.options.having.updateFields(this.options.what, this.selection);
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

		render: function(){
			console.log(this.options.having);
			var compiledTemplate = this.template({
            	myCategos: this.collection.toJSON(),
            	myHaving: this.selection
        	});
			this.$el.html(compiledTemplate);
			return this;
		}
	});

	return ModalView;
})