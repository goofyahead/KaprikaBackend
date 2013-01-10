// ListView of dishes for a list on the left side.
define(['backbone','views/dishListElement','text!templates/blueButton.html','eventDispatcher'],
 function(Backbone, DishListElement, template, eventDispatcher){
	var DishViewList = Backbone.View.extend({
		//attach to an existing element
		el: $('#left_menu'),

		template: _.template(template),

		initialize: function(){
			this.collection.on('reset', this.addAll, this);
			this.collection.on('change', this.change, this);
			eventDispatcher.on('app:dishCreated', this.reload, this);
		},

		reload: function() {
			console.log('la lista debe actualizarseeeee el modelo ha creado un nuevo plato +++++++++++++++++++');
			this.collection.fetch();
		},

		render: function() {
			this.addAll();
		},

		addOne: function(dish) {
			console.log('painting each view element ' + dish.toJSON);
			var dishListElement = new DishListElement({model: dish});
			this.$el.append(dishListElement.render().el);
		},

		addAll: function() {
			$('#left_menu').empty();
			console.log('add all called');
			$('#left_list_header').html('Lista de platos');
			this.collection.forEach(this.addOne, this);
			var compiledTemplate = this.template({
            	action: '#newDish'
        	});
			$('#left_menu').append(compiledTemplate);
		}
	});

	return DishViewList;
});
