//Model representing the dish state.

define(['backbone','eventDispatcher','models/modelErrorHandler'], function(Backbone, eventDispatcher, ModelErrorHanlder){
	
	var Dish = ModelErrorHanlder.extend({

		urlRoot: '/api/dishes',
		
		idAttribute: "_id",

		defaults: {
	        _id: null,
	        name: '',
	        description: '',
	        price: '',
	        picture: null,
	        categories: [],
	        recommendations: [],
	        tags: [],
	        ingredients: [],
	        menu: [],
	        video: null,
	        demo: false,
	        options: {}
    	},

    	toggleDemo: function () {
    		if (this.get('demo') == false) {
    			this.set({demo: true});
    		} else {
    			this.set({demo: false});
    		}
    		this.save({},{
    			success: function() {
					console.log('saved correctly');
				},
				error: function (model, response) {
					console.log('error login' + response.responseText);
				}
			});
    	},

    	deleteMyself: function () {
	   		this.destroy();
	   		eventDispatcher.trigger('app:dishDestroyed');
   		},

   		updateVideo: function ( mVideo ){
   			this.set({video: mVideo});
   			this.save();
   		},

   		updateThumbnail: function ( mThumbnail ) {
   			this.set({picture: mThumbnail});
   			this.save();
   		},

		updateFields: function ( what, updates ){
			console.log('updating model ' + what + ' with: ' + updates);
			this.set(what, updates);
			this.save();
			this.trigger('change');
		},

		updateCatName: function (previous, newName) {
			if (previous){
				var currentOptions = this.get('options');
				currentOptions[newName] = currentOptions[previous]; // check recurrency copy by ref
				delete currentOptions[previous];
				console.log('status options: ', currentOptions);
				this.set({'options': currentOptions});
			} else {
				var optionss = this.get('options');
				optionss[newName] = [];
				this.set({'options' : optionss});
			}
		},

		updateBasicInfo: function ( vName, vDescription, vPrice) {
			var that = this;
			var wasNew = this.isNew();
			this.set({name: vName});
			this.set({description: vDescription});
			this.set({price: vPrice});
			this.save({},{
				success: function() {
					if (wasNew) {
						eventDispatcher.trigger('app:dishCreated');
						// navigate to the page of the newly added dish.
						Backbone.history.navigate('/dishes/' + that.get('_id'));
					}
				}
			});
		},

		deleteOption: function (catToDel){
			var currentOptions = this.get('options');
			delete currentOptions[catToDel];
			this.set({options : currentOptions});
			this.save();
			this.trigger('change');
		},

		updateRelations: function (relations) {
			this.set({recommendations: relations});
			this.save();
			this.trigger('change');
		},

		updatePicture: function  (newPicture) {
			this.set({picture: newPicture});
			this.save();
		}
	});

	return Dish;
});