// View definition importing its html for rendering

define(['backbone','jquery','text!templates/dish.html','views/modal','bootstrap','models/categories',
	'models/menus','models/tags','models/ingredients','models/dishes','views/modal_relations','views/modalPictureSelect',
	'views/ModalView', 'views/modalOptions'],
	function(Backbone, $, dish, ModalView, bootstrap, Categories,
	 Menus, Tags, Ingredients, Dishes, ModalRelations, ModalPicture, BootstapModal, ModalOption) {
	var DishView = Backbone.View.extend({
		template: _.template(dish),

		tagName: 'div',
		id: 'dish',

		initialize: function() {
			console.log('initializing dishView');
			this.model.on('change', this.render, this);
			this.model.bind('change', this.render, this);
		},


		render: function(){
			console.log('rendering dishView');
			this.$el.html(this.template(this.model.toJSON()));
		},

		events: {
			'click #menus-menu .newItem': 'launch_modal_menu',
			'click #categories-menu .newItem': 'launch_modal_categories',
			'click #tags-menu .newItem': 'launch_modal_tags',
			'click #ingredients-menu .newItem': 'launch_modal_ingredients',
			'click #relations-menu .newItem': 'launch_modal_relations',
			'click #options-menu .newItem': 'launch_modal_options',
			'click #delete' : 'delete_dish',
			'click #save-basic-changes': 'save_basic',
			'click #demo' : 'toggleDemo',
			'click #option' : 'launch_modal_options',
			'drop #dropVideo' : 'dropVideo',
			'dragover #dropVideo' : 'dragover'
		},

		toggleDemo: function (event) {
			this.model.toggleDemo();
		},

		dropVideo: function (event) {
			event.preventDefault();
			console.log('drop received');
			event.stopPropagation();

			$('.progress').removeClass('hide');
	        var e = event.originalEvent;
	        this.videoFile = e.dataTransfer.files[0];

	        var thisView = this;
	        var fd = new FormData();
		    fd.append('uploadingVideo', this.videoFile);
		    fd.append('filename', this.model.get("name"));
		    var xhr = new XMLHttpRequest();
		    xhr.addEventListener('load', uploadComplete, false);
		    xhr.addEventListener('progress', uploadProgress, false);
		    xhr.open('POST', '/api/video-upload');
		    xhr.setRequestHeader( 'Authorization' , sessionStorage.getItem('token') );
		    xhr.send(fd);

		    function uploadProgress(evt) {

		    	if (evt.lengthComputable) {
	   				var percentComplete = evt.loaded / evt.total;
	   				console.log(' porcentaje: ' + percentComplete);
	   				$('.bar').text( percentComplete + "%");
	   			} else {
	   				console.log(' no computable ');
	   			}
		    }

		    function uploadComplete(evt) {
		    	console.log('upload done');
		    	$('.progress').addClass('hide');
				var responseUpload = JSON.parse(evt.target.response);
				console.log(responseUpload);

				var modalPicture = new ModalPicture({
					pictures: responseUpload,
					model: thisView.model
				});
				var modal = new BootstapModal({ content: modalPicture, allowCancel: false, title: 'Select a picture' }).open();
				modalPicture.sender(modal);
				thisView.model.updateVideo(responseUpload.name);
			}
		},

		dragover: function (event) {
			console.log('dragOver');
			event.preventDefault();
		},

		delete_dish: function () {
			this.model.deleteMyself();
			this.remove();
  			this.unbind();
		},

		save_basic: function (event) {
			var name = $('#inputName').val();
			var description = $('#inputDescription').val();
			var price = $('#inputPrice').val();
			this.model.updateBasicInfo(name, description, price);
		},

		launch_modal_options: function (ev) {
			var selected = $(ev.currentTarget).attr('value');
			console.log('launching: ' ,this.model.get('options'));
			var emptyOptionModal = new ModalOption({model : this.model, selection : selected});
			emptyOptionModal.render();
			$('#modalplacer').html(emptyOptionModal.el);
			$('#myModal').modal();
		},

		launch_modal_relations: function(ev) {
			var thisView = this;
			var dishes = new Dishes();
			dishes.fetch({
	            success: function(){
					var modal = new ModalRelations(
						{collection: dishes,
						 having: thisView.model,
						 what: 'recommendations'
					});
					modal.render();
					$('#modalplacer').html(modal.el);
					$('#myModal').modal();
	            },
	            error: function(){
	              console.log('failure');
	            }
		    });
		},

		launch_modal_ingredients: function(ev){
			var thisView = this;
			var ingredients = new Ingredients();
			ingredients.fetch({
	            success: function(){
					var modal = new ModalView(
						{collection: ingredients,
						 having: thisView.model,
						 what: 'ingredients'
					});
					modal.render();
					$('#modalplacer').html(modal.el);
					$('#myModal').modal();
	            },
	            error: function(){
	              console.log('failure');
	            }
		    });	
		},

		launch_modal_tags: function(ev){
			var thisView = this;
			var tags = new Tags();
			tags.fetch({
	            success: function(){
					var modal = new ModalView(
						{collection: tags,
						 having: thisView.model,
						 what: 'tags'
					});
					modal.render();
					$('#modalplacer').html(modal.el);
					$('#myModal').modal();
	            },
	            error: function(){
	              console.log('failure');
	            }
		    });	
		},

		launch_modal_menu: function(ev){
			var thisView = this;
			var menus = new Menus();
			menus.fetch({
	            success: function(){
					var modal = new ModalView(
						{collection: menus,
						 having: thisView.model,
						 what: 'menu'
					});
					modal.render();
					$('#modalplacer').html(modal.el);
					$('#myModal').modal();
	            },
	            error: function(){
	              console.log('failure');
	            }
		    });	
		},

		launch_modal_categories: function(ev){
			var thisView = this;
			var categories = new Categories();
			categories.fetch({
	            success: function(){
					var modal = new ModalView(
						{collection: categories,
						 having: thisView.model,
						 what: 'categories'
					});
					modal.render();
					$('#modalplacer').html(modal.el);
					$('#myModal').modal();
	            },
	            error: function(){
	              console.log('failure');
	            }
		    });		
		}

	});

	return DishView;
});