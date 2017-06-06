Vue.component('add-button', {
	template: '<div class="w-2">\
				<button class="add-button" :class="color" @click="add">\
					<div class="text"><div class="valign">ADD</div></div>\
				</button>\
			</div>',
	props: ['color'],
	methods: {
		add: function () {
			this.$emit('add');
		}
	}
});