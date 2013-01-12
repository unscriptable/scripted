define({
	
	// defaults. these should be overridden or mixed-in by another spec.
	template: 'oops!',
	structureCss: null,
	strings: {},
	
	// this is the root node of the dialog.
	// all dom queries are rooted at this node. see the plugins section.
	deleteResourceNode:   {
	     render: {
			template: { $ref: 'template' },
			css: { $ref: 'structureCss' },
			replace: { $ref: 'strings' }
	     },
	     insert: { last: { $ref: 'containerNode' } },
	     on: {
			'click:button': 'handler._handleButtonClick',
			'submit:form': 'handler._handleSubmit'
	     }
	},
	
	handler: {
		create: { module: 'scripted/dialog/handler' },
		properties: {
			errorNode: { $ref: 'dom.first!.error_message' }
		},
		connect: {
			show: 'toggleVisibleState.add',
			close: 'toggleVisibleState.remove',
			cancel: 'toggleVisibleState.remove'
		},
		init: 'init'
	},
	
	// oocss state handler
	toggleVisibleState: {
		create: {
			module: 'wire/dom/transform/toggleClasses',
			args: {
				node: { $ref: 'deleteResourceNode' },
				classes: 'dialog_visible'
			}
		}
	},
	
	plugins: [
//		{ module: 'wire/debug' },
		{ module:  'wire/dom', at: { $ref: 'deleteResourceNode' } },
		{ module:  'wire/on' },
		{ module:  'wire/aop' },
		{ module:  'wire/dom/render' }
	]
});