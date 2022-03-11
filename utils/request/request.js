const config = Symbol("config");
const isCompleteURL = Symbol("isCompleteURL");
const requestBefore = Symbol("requestBefore");
const requestAfter = Symbol("requestAfter");

class Request {
	[config] = {
		baseURL: "",
		header: {
			"content-type": "application/json"
		},
		method: "GET",
		dataType: "json",
		responseType: "text"
	};

	interceptors = {
		request: func => {
			if (func) {
				Request[requestBefore] = func;
			} else {
				Request[requestBefore] = request => request;
			}
		},
		response: func => {
			if (func) {
				Request[requestAfter] = func;
			} else {
				Request[requestAfter] = response => response;
			}
		}
	};

	static[requestBefore](config) {
		return config;
	}

	static[requestAfter](response) {
		return response;
	}

	static[isCompleteURL](url) {
		return /(http|https):\/\/([\w.]+\/?)\S*/.test(url);
	}

	setConfig(func) {
		this[config] = func(this[config]);
	}

	request(options = {}) {
		options.baseURL = options.baseURL || this[config].baseURL;
		options.dataType = options.dataType || this[config].dataType;
		options.url = Request[isCompleteURL](options.url) ?
			options.url :
			options.baseURL + options.url;
		options.data = options.data;
		options.header = {
			...options.header,
			...this[config].header
		};
		options.method = options.method || this[config].method;

		options = {
			...options,
			...Request[requestBefore](options)
		};

		return new Promise((resolve, reject) => {
			options.success = function(res) {
				resolve(Request[requestAfter](res));
			};
			options.fail = function(err) {
				reject(Request[requestAfter](err));
			};
			uni.request(options);
		});
	}

	get({
		url,
		data,
		params
	}, options = {}) {
		options.url = url;
		if (params) {
			options.url += "?";
			const keys = Object.keys(params);
			keys.forEach((item, index) => {
				options.url += `${ item }=${ params[item] }`;
				if (index < keys.length - 1) options.url += "&";
			})
		}
		options.data = data;
		options.method = "GET";
		return this.request(options);
	}

	post({
		url,
		data,
		params
	}, options = {}) {
		console.log("rrrrrrrrrrrrr",params)
		console.log("rrrrrrrrdatarrrrr",data)
		data.version =1
		options.url = url;
		if (params) {
			 
			 // params.version = 1; 
			options.url += "?";
			const keys = Object.keys(params);
			keys.forEach((item, index) => {
				options.url += `${ item }=${ params[item] }`;
				if (index < keys.length - 1) options.url += "&";
			})
		}
		 
		options.data = data;
		 
		options.method = "POST";
		return this.request(options);
	}

	put({
		url,
		data,
		params
	}, options = {}) {
		options.url = url;
		if (params) {
			options.url += "?";
			const keys = Object.keys(params);
			keys.forEach((item, index) => {
				options.url += `${ item }=${ params[item] }`;
				if (index < keys.length - 1) options.url += "&";
			})
		}
		options.url = url;
		options.data = data;
		options.method = "PUT";
		return this.request(options);
	}

	delete({
		url,
		data,
		params
	}, options = {}) {
		options.url = url;
		if (params) {
			options.url += "?";
			const keys = Object.keys(params);
			keys.forEach((item, index) => {
				options.url += `${ item }=${ params[item] }`;
				if (index < keys.length - 1) options.url += "&";
			})
		}
		options.url = url;
		options.data = data;
		options.method = "DELETE";
		return this.request(options);
	}
}

Request.install = function(Vue) {
	Vue.mixin({
		beforeCreate: function() {
			if (this.$options.minRequest) {
				console.log(this.$options.minRequest);
				Vue._minRequest = this.$options.minRequest;
			}
		}
	});
	Object.defineProperty(Vue.prototype, "$minApi", {
		get: function() {
			return Vue._minRequest.apis;
		}
	});
};

export default Request;
