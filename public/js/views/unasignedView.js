// ListView of categories for a list on the left side.
define(['backbone','text!templates/unasigned.html', 'eventDispatcher', 'models/dish'],
 function(Backbone, unasigned, eventDispatcher, Dish){

	var TagsListView = Backbone.View.extend({
		//attach to an existing element
		tagName: 'div',
		template: _.template(unasigned),

		initialize: function(){
			this.model.on('reset', this.render, this);
			this.model.on('change', this.render, this);
		},

		events: {
			'click #delete': 'deleteItem',
			'click #edit' : 'edit'
		},

		deleteItem: function (event){
			event.preventDefault();
			var videoName = $(event.currentTarget).attr("data-videoname");
			console.log('delete clicked ' + $(event.currentTarget).attr('data-videoname'));
		},

		edit : function (event) {

   			var videoName = $(event.currentTarget).attr("data-videoname");
			console.log('edit clicked ' + $(event.currentTarget).attr('data-videoname'));
			var edited = new Dish();
			edited.set({video : videoName});
			edited.set({picture: videoName.split('.')[0] + '.jpg'});

			console.log('is new?' + edited.isNew());
			console.log(edited);

			console.log('pic name should be' + videoName.split('.')[0]);

			edited.save({},{
    			success: function(model, response, options) {
					console.log('saved correctly');
					console.log(response);
					console.log(model);
					Backbone.history.navigate('/#dishes/' + model.id, true);
					console.log('navigate!');
				},
				error: function (model, response) {
					console.log('error login' + response.responseText);
				}
			});
		},

		reload: function() {
			console.log('reloading list');
			this.model.fetch();
		},

		render: function() {
			console.log('rendering dishView');
			this.$el.html(this.template(this.model.toJSON()));
		}
	});

	return TagsListView;
});