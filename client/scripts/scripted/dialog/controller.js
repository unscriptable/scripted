define(function (require) {

var when = require('when');

return function () {

	return {
	
		/**
		 * @injected
		 */
		shell: null,
		
		/**
		 * @param Object dialog
		 * @param Function task
		 */
		showDialog: function (dialog, task) {
			var shell;
			
			shell = this.shell;
			
			// put dialog into shell
			shell.set(dialog);
			
			// show dialog
			return when(dialog.show()).then(handleTask, closeDialog);
			
			function handleTask (results) {
				when(task()).then(closeDialog, handleError);
			}
			
			function handleError (msg) {
				dialog.showError(msg);
			}
			
			function closeDialog () {
				dialog.close();
				shell.clear();
			}
			
		}
		
	};

};

});