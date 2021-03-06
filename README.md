# Test Your Websockets

A browser-based app to test your websockets. Write messages using the great [ACE Editor](https://ace.c9.io/).
Built with [VueJS](https://vuejs.org/).

Feel free to share your ideas and improvements !

[Click here to test your websockets](https://antoinecheron.github.io/test-your-websockets)

![App UI](/img/ui.jpg)

## Features

* Add your own encoding/decoding method
* ACE Editor integration
* Choose the language to use for text coloration in the editor
* TLS Support
* Previous/next requests and responses + response linked to the request
* Log everything in the response area
* Code error translation to reason
* Desktop app available, based on electron

## Coming features

- Share your ideas, open an issue :)

## How to add your own encoding/decoding feature

You have three choices. You can either make a pull-request and add your plugin in the ./scripts/messaging-manager folder, or upload your file in the modal, or write your code in the modal. 
Be careful ! When using the modal, in both case, the plugin won't be save. Pull-request is the best choice.

In either case, please follow the following template.
```javascript
const MessagingManager = {
	name: string,
	editorLanguage: string, // Search for the ace mode that you would like to use. We take care of the beginning part /ace/mode
	storeEncodedMessage: boolean,
	customAceEditorInstace: , // Ace editor instance : https://ace.c9.io/#nav=api&api=editor
	encodeBeforeSending: (inputMessage) => {
		// Code that transform the user-written message into the encoded message that should be send through the socket.
		return encodedMessage;
	},
	decodeOnReceive: (receivedMessage) => {
		// Code that transform the received message into the message that will be displayed.
		return decodedMessage;
	},
};
```

## How to collaborate

Please respect the rules described here : https://code.tutsplus.com/tutorials/how-to-collaborate-on-github--net-34267.

## Licence

[MIT](./LICENSE.md), do whatever you want with the code : use it, modify it, share it, improve it. 

## Technologies

* [VueJS](https://vuejs.org/)
* [SASS/SCSS](http://sass-lang.com/)
* [ACE Editor](https://ace.c9.io/)
* [Electron](https://electron.atom.io)

## External resources

* require function, in file scripts/require.js from [Sam & Max](sametmax.com/include-require-import-en-javascript/)
