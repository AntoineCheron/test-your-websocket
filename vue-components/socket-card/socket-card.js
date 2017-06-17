Vue.component('socket-card', {
	props: {
		'color' : {
			type: String,
			required:true,
		}, 
		'name' : {
			type: String,
			required: true,
		}
	},
	created: function () {
		this.checkboxId = this.generateUUID();
	},
	data: function () {
		return {
			socketAddress: 'ws://',
			socketSubprotocol: '',
			enableTLS: false,
			status: 'disconnected',
			connectClass: 'filled',
			connectText: 'connect',
			sendClass: 'not-filled',
			socket: null,
			response : '',
			request: '',
			requestHistory : [],
			requestHistoryIndex: 0,
			responseHistory: [],
			responseHistoryIndex: 0,
			requestResponseLinked: {},
			requestEditable: true,
			responseEditable: false,
			checkboxId: '',
		}
	},
	methods: {
		toggleConnect: function () {
			if (this.socket === null || this.status === 'disconnected') {
				// Setting the subprotocol. Support multiple protocol if user enter the list as a JSON array
				let subprotocol = null;
				if (this.socketSubprotocol !== '') {
					try {
						subprotocol = JSON.parse(this.socketSubprotocol);
						subprotocol = JSON.stringify(subprotocol);
					} catch (err) {
						subprotocol = this.socketSubprotocol;
					}
				}
				// Create socket and connect
				this.socket = this.createWebsocket(this.socketAddress, subprotocol);
			} else if(this.status === 'connected') {
				this.socket.close(1000, 'User decided to close socket');
				this.socket = null;
			}
		},
		sendMessage: function () {
			if (this.socket !== null && this.socket.readyState === 1 && this.request !== '') {
				this.socket.send(this.request);
				this.requestHistory.push(this.request);
				this.requestHistoryIndex = this.requestHistory.length;
				this.request = '';
			}
		},
		previousRequest: function () {
			this.requestHistoryIndex--;
			this.request = this.requestHistory[this.requestHistoryIndex];
			this.showAssociatedResponse();
		},
		nextRequest: function () {
			this.requestHistoryIndex++;
			this.request = this.requestHistory[this.requestHistoryIndex];
			this.showAssociatedResponse();
		},
		clearRequest: function () {
			this.request = '';
			this.requestHistoryIndex = this.requestHistory.length;
		},
		showAssociatedResponse() {
			// Check whether there is a response linked to the request. If so, show it.
			if (this.requestResponseLinked[this.request]) {
				this.goToResponse(this.requestResponseLinked[this.request]);
			}
		},
		goToRequest: function (request) {
			// Verify that the request exist
			if (this.requestHistory.indexOf(request) !== -1) {
				this.requestHistoryIndex = this.requestHistory.indexOf(request);
				this.request = this.requestHistory[this.requestHistoryIndex];
			}
		},
		previousResponse: function () {
			this.responseHistoryIndex--;
			this.response = this.responseHistory[this.responseHistoryIndex];
			this.showAssociatedRequest();
		},
		nextResponse: function () {
			this.responseHistoryIndex++;
			this.response = this.responseHistory[this.responseHistoryIndex];
			this.showAssociatedRequest();
		},
		clearResponse: function () {
			this.response = '';
			if (this.responseHistory.length != 0) {
				this.responseHistoryIndex = this.responseHistory.length;
			}
		},
		showAssociatedRequest: function () {
			// Check whether there is a request linked to the on-screen response. If so, show it.
			const index = Object.keys(this.requestResponseLinked).indexOf(this.response);
			if ( index !== -1 ) {
				this.requestHistoryIndex = index;
				this.request = this.requestHistory[index];
			}
		},
		goToResponse: function (response) {
			// Verify that the reponse exist
			if (this.responseHistory.indexOf(response) !== -1) {
				this.responseHistoryIndex = this.responseHistory.indexOf(response);
				this.response = this.responseHistory[this.responseHistoryIndex];
			}
		},
		createWebsocket: function (address) {
			let that = this;
			try {
				const socket = new WebSocket(address, 'echo-protocol');

				socket.onopen = function () {
					that.socket = socket;
					that.status = 'connected';
					that.connectClass = 'not-filled';
					that.connectText = 'disconnect';
					that.sendClass = 'filled';
					that.response = 'Successfully connected !';
					if(that.responseHistory.length != 0) { that.responseHistoryIndex++; }
				}

				socket.onmessage = function (event) {
					msg = event.data;
					that.response = msg;
					that.responseHistory.push(msg);
					that.requestResponseLinked[that.requestHistory[that.requestHistory.length-1]] = msg;
					that.responseHistoryIndex = (that.responseHistory.length -1);
				}

				socket.onerror = function (event) {
					that.response = 'An error occured on socket';
					console.log(event);
					if(that.responseHistory.length != 0) { that.responseHistoryIndex++; }
				}

				socket.onclose = function (event) {
					that.status = 'disconnected';
					that.connectClass = 'filled';
					that.connectText = 'connect';
					that.sendClass = 'not-filled';
					that.response = `Socket closed with code ${event.code}\nReason : ${SOCKET_CODE[String(event.code)]}`;
					that.responseHistory.push(that.response);
					that.responseHistoryIndex = (that.responseHistory.length -1);
				}
			} catch (err) {
				this.responseHistory.push(err.message);
				this.response = err.message;
				this.socket = null;
			}
		},
		updateRequest: function(value) {
			this.request = value;
		},
		updateResponse: function(value) {
			this.response = value;
		},
		generateUUID: function() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
             });
            return uuid;
        },
        toggleTLS: function() {
        	// this.enableTLS change after this function has been called
        	if (!this.enableTLS) {
        		this.socketAddress = this.socketAddress.replace('ws', 'wss');
        	} else {
        		this.socketAddress = this.socketAddress.replace('wss', 'ws');
        	}
        },
        toggleTlSFromText: function(event) {
        	// Set the value of socketAddress (default behavior)
        	this.socketAddress = event.target.value;

        	// Look at the address to determine wether the user wants to use TLS or not
        	const prefix = event.target.value.substring(0,3);
        	if (prefix === 'wss') { this.enableTLS = true; }
        	else { this.enableTLS = false; }
        },
        enterPressed: function(event) {
        	if (event.keyCode === 13 && this.status === 'disconnected') {
        		this.toggleConnect();
        		return false;
        	}
        },
        remove: function() {
        	if (this.status === 'connected') {
        		this.socket.close();
        	}
        	
        	this.$emit('remove');
        }
	},
	template: `<div class="w-10">
				<div class="socket-card" :class="color">
					<div class="name">{{name}}<span class="delete-button" @click="remove">x</span></div>
					<div class="connexion">
						<div class="address">
							<div class="label">Address</div>
							<input :value="socketAddress" @input="toggleTlSFromText" class="field" type="text" placeholder="ws://your-address" 
							:disabled="status === 'connected'" @keypress="enterPressed">
							<div class="label sub-protocol-label">Sub-protocol</div>
							<input v-model="socketSubprotocol" class="field-subprotocol" type="text" placeholder="(optional)" 
							:disabled="status === 'connected'" @keypress="enterPressed">
						</div>
						<div class="socket-status">
							<div class="status">Status : <span class="value">{{status}}</span></div>
							<div class="buttons">
								<button class="connect" :class="connectClass" @click="toggleConnect">{{connectText}}</button>
								<button class="send" :class="sendClass" @click="sendMessage" :disabled="socket === null || status === 'disconnected'">send message</button>
							</div>
							<div class="use-tls">
								<div>
									<div>
										<div class="tls-checkbox">
											<input v-model="enableTLS" type="checkbox" :id="checkboxId" :disabled="status === 'connected'">
											<label :for="checkboxId" @click="toggleTLS"></label>
										</div>
										<label :for="checkboxId" class="checkbox-label" @click="toggleTLS">Use TLS protocol</label>
									</div>
								</div>
								
							</div>
						</div>
					</div>
					<div class="request message">
						<div class="flex-space-between">
							<div>
								<button @click="previousRequest" :disabled="requestHistoryIndex <= 0">previous</button>
								<button @click="nextRequest" :disabled="requestHistoryIndex >= requestHistory.length-1">next</button>
							</div>
							<div>
								<button class="clear-button" @click="clearRequest">clear</button>
							</div>
						</div>
						<div>
							<p class="message-label message-label-1">Request</p>
							<editor v-model="request" :readOnly="!requestEditable"></editor>
						</div>
					</div>
					<div class="response message">
						<div class="flex-space-between">
							<div>
								<button @click="previousResponse" :disabled="responseHistoryIndex <= 0">previous</button>
								<button @click="nextResponse" :disabled="responseHistoryIndex >= (responseHistory.length -1)">next</button>
							</div>
							<div>
								<button class="clear-button" @click="clearResponse">clear</button>
							</div>
						</div>
						<div>
							<p class="message-label message-label-2">Response</p>
							<editor v-model="response" :readOnly="!responseEditable"></editor>
						</div>
					</div>
				</div>
			</div>`
});