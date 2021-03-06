/*******************************************************************************
 * @license
 * Copyright (c) 2012 VMware, Inc. All Rights Reserved.
 * THIS FILE IS PROVIDED UNDER THE TERMS OF THE ECLIPSE PUBLIC LICENSE
 * ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION OF THIS FILE
 * CONSTITUTES RECIPIENTS ACCEPTANCE OF THE AGREEMENT.
 * You can obtain a current copy of the Eclipse Public License from
 * http://www.opensource.org/licenses/eclipse-1.0.php
 *
 * Contributors:
 *     Kris De Volder - initial API and implementation
 ******************************************************************************/

/*global require define window scripted */
/*jslint browser:true devel:true*/

define(['scripted/utils/pathUtils'], function () {

// This module provides a mechanism to replace 'parameters' of the form ${name}
// inside of data objects. It walks the data object creating a copy of it, replacing
// all occurrences of the params in every string found in the data object.

//Creates a parameter replacement function that is base on a given set of parameter definitions.
function createParamReplacer(paramDefs) {

	function resolve(param) {
		var resolverDef = paramDefs[param];
		if (typeof(resolverDef)==='function') {
			return resolverDef();
		}
		return resolverDef; //Assuming it's just a literal value
	}

	function replaceParams(target) {
		if (typeof(target)==='string') {
			var string = target;
			for (var param in paramDefs) {
				if (paramDefs.hasOwnProperty(param)) {
					while (string.indexOf(param)>=0) {
						var value = resolve(param);
						string = string.replace(param, value);
					}
				}
			}
			return string;
		} else if (typeof(target)==='object') {
			var copied = Array.isArray(target)?[]:{};
			for (var property in target) {
				if (target.hasOwnProperty(property)) {
					copied[property] = replaceParams(target[property]);
				}
			}
			return copied;
		} else {
			return target;
		}
	}
	
	var PARAM_START = "${";
	var PARAM_END = "}";
	
	/**
	 * Finds the replacements for a given target string.  Does not apply the replacements.
	 * Instead, returns an array of replacements that would be applied.
	 * @param String target the target text to determine replacements for
	 * @return {Array.<{start:Number,end:Number,text:String,lengthAdded:Number}>} an array of replacements that
	 * would be applied if the replaceParams function is called.  the lengthAdded property
	 * is the number of chars added minus the number of chars removed
	 */
	function findReplacements(target) {
		var curr = 0;
		var res = [];
		while ((curr = target.indexOf(PARAM_START, curr)) >= 0) {
			var end = target.indexOf(PARAM_END, curr);
			if (end >= 0) {
				var param = target.substring(curr, end+1);
				for (var paramDef in paramDefs) {
					if (paramDefs.hasOwnProperty(paramDef)) {
						while (param === paramDef) {
							var value = resolve(param);
							res.push({start:curr, end: end, text:value, lengthAdded:(value.length - end + curr-1)});
							break;
						}
					}
				}
				curr = end+1;
			} else {
				break;
			}
		}
		return res;
	}
	
	return {
		replaceParams : replaceParams,
		findReplacements : findReplacements
	};
}

/**
 * Returns a string of all the whitespace at the start of the current line.
 * @param {String} buffer The document
 * @param {Integer} offset The current selection offset
 */
function leadingWhitespace(buffer, offset) {
	var whitespace = "";
	offset = offset-1;
	while (offset >= 0) {
		var c = buffer.charAt(offset--);
		if (c === '\n' || c === '\r') {
			//we hit the start of the line so we are done
			break;
		}
		if (/\s/.test(c)) {
			//we found whitespace to add it to our result
			whitespace = c.concat(whitespace);
		} else {
			//we found non-whitespace, so reset our result
			whitespace = "";
		}
	}
	return whitespace;
}

/**
 * @return {String} indentation preferences for current project
 */
function indent() {
	var formatterPrefs = scripted && scripted.config && scripted.config.editor;
	if (!formatterPrefs) {
		return '\t';
	}
	
	var expandtab = formatterPrefs.expandtab;
	var tabsize = formatterPrefs.tabsize ? formatterPrefs.tabsize : 4;
	
	var indentText = '';
	if (expandtab) {
		for (var i = 0; i < tabsize; i++) {
			indentText += " ";
		}
	} else {
		indentText = '\t';
	}
	return indentText;
}


var getDirectory = require('scripted/utils/pathUtils').getDirectory;

//Create a param replacer function that 'resolves' parameters relative to
//a given editor context.
function forEditor(editor) {

	var paramDefs = {
	};
	
	function getDir() {
		return getDirectory(editor.getFilePath());
	}
	
	function def(param, resolverFunOrValue) {
		if (paramDefs[param]) {
			throw "Multiple definitions for param: "+param;
		}
		paramDefs[param] = resolverFunOrValue;
	}
	
	def("${file}", function() {
		return editor.getFilePath();
	});
	
	def("${dir}", getDir);
	
	def("${projectDir}", function () {
		return window.fsroot || getDir();
	});
	
	// function to return the leading offset of the currently selected line
	def("${lineStart}", function() {
		var offset = editor.getTextView().getSelection().start;
		var buffer = editor.getText();
		return leadingWhitespace(buffer, offset);
	});
	
	var indentText;
	def("${indent}", function() {
		if (!indentText) {
			indentText = indent();
		}
		return indentText;
	});
	
	def("${selection}", function() {
		var selection = editor.getTextView().getSelection();
		return editor.getText(selection.start, selection.end);
	});
	
	
	// Other possible parameters
	// current line
	// current user name (requires server call)
	// year
	// time
	// date (but how to format???)
	
	return createParamReplacer(paramDefs);
}

function forFsRoot(fsroot) {
	return createParamReplacer({
		"${projectDir}": fsroot
	});
}

return {
	forEditor: forEditor,
	forFsRoot: forFsRoot
};

});
