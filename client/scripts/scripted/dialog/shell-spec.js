define({

	shell: {
		create: { module: 'scripted/dialog/shell' },
		properties: {
			element: { $ref: 'dom!dialogs' }
		}
	},
	
	window: {
		literal: window,
		on: {
			'click': 'handler._handleBlur',
			'keypress': 'handler._handleKeypress'
		}
	},

	plugins: [
//		{ module: 'wire/debug' },
		{ module:  'wire/dom' },
		{ module:  'wire/on' }
	]
});