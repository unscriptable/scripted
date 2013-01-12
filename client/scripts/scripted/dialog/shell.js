define(function (require) {

return function () {

	return {
	
		/**
		 * @injected
		 */
		element: null,
		
		set: function (thing) {
			var node;
			
			node = thing.domNode || thing;
			
			this.clear();
			this.element.appendChild(node);
			
		},
		
		show: function () {
			this.element.style.display = 'block';
		},
		
		hide: function () {
			this.element.style.display = 'none';
		},
		
		clear: function () {
			this.element.innerHTML = '';
		}
		
	};

};

});