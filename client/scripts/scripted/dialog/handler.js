define(function(require) {

var when = require('when');

return function () {

	return {

		init: function () {},
		
		show: function () {
			this._action = null; // does this belong here?
			this.deferred = when.defer();
			return this.deferred.promise;
		},
		
		showError: function (message) {
			this.errorNode.textContent = message;
		},
		
		close: function () {},

		cancel: function () {
			return this.deferred.reject(new Error('dialog canceled'));
		},
		
		/**
		 * Collects any state or user-entered information from the dialog.
		 * @return Object
		 */
		collect: function () {
			return {
				action: this._action
			};
		},
		
		_submit: function (action) {
			var data;
			
			this._action = action;
			
			if (action != 'cancel') {
				data = this.collect();
				return this.deferred.resolve(data);
			}
			else {
				return this.cancel();
			}
		},
		
		_handleButtonClick: function (e) {
			var node, name, formaction, succeed, data;
			
			node = e.selectorTarget || e.target || e.srcElement;
			name = node.name || node.getAttribute('data-scripted-name');
			formaction = node.formaction || node.getAttribute('formaction');
			
			return this._submit(formaction);
		},
		
		_handleSubmit: function (e) {
			var form, action;
			
			form = e.selectorTarget || e.target || e.srcElement;
			action = form.action || this._findSubmit(form);
			
			return this._submit(action);
		},
		
		_handleBlur: function (e) {
			return this.cancel();
		},
		
		_handleKeypress: function (e) {
			if (e.key == 27) {
				this.cancel();
			}
		},
		
		/**
		 * Find s the first submit button in a form. Needed by browsers that don't
		 * support the formaction attribute (which populate's the form's action property).
		 * @param HTMLFormElement form
		 * @return HTMLElement
		 */
		_findSubmit: function (form) {
			var i = 0, el;
			while ((el = form.elements[i++])) {
				if (el.type == 'submit') {
					return el;
				}
			}
		}

	};

};

});