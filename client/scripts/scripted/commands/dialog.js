define(function (require) {

var when, wire, shellSpec, dialogSpec;

when = require('when');
wire = require('wire');
shellSpec = require('scripted/dialog/shell-spec');
dialogSpec = require('scripted/dialog/dialog-spec');

// TODO: return object with two command constructors. one for "open" and one for "close"

return function () {


	return {
		
		/**
		 * @param Object context provides the name of the dialog spec as dialogSpec
		 */
		handler: function (context) {
			var shellPromise, dialogPromise, destroyShell;

			// wire shell spec
			shellPromise = getShell().then(function (context) {
				destroyShell = context.destroy;
				return context;
			});
			
			// wire dialog spec
			dialogPromise = getDialog(context.dialogSpec);
			
			return when.all([shellPromise, dialogPromise]).then(
				function (contexts) {
					var shell, dialog;
					shell = contexts[0].shell;
					dialog = contexts[1].handler;
					
					// insert dialog into shell
					shell.set(dialog);
					
					// display shell
					shell.show();
					
					// display dialog
					return dialog.show().then(function () {
						context.dialog = dialog;
						context.shell = shell;
						return context;
					});
				}
			);
		}
		
	};

};

function getDialog (spec) {
	return wire([dialogSpec, spec]);
}

function getShell () {
	return wire(shellSpec);
}

});