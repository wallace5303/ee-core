const { promisify } = require('util');
const dgram = require('dgram');
const { isIPv6, isIPv4 } = require('net');
const dns = require('dns-socket');
const HttpClient = require('../httpclient');

class IpNotFoundError extends Error {
	constructor(options) {
		super('Could not get the public IP address', options);
		this.name = 'IpNotFoundError';
	}
}

const defaults = {
	timeout: 5000,
	onlyHttps: false,
};

const dnsServers = [
	{
		v4: {
			servers: [
				'208.67.222.222',
				'208.67.220.220',
				'208.67.222.220',
				'208.67.220.222',
			],
			name: 'myip.opendns.com',
			type: 'A',
		},
		v6: {
			servers: [
				'2620:0:ccc::2',
				'2620:0:ccd::2',
			],
			name: 'myip.opendns.com',
			type: 'AAAA',
		},
	},
	// {
	// 	v4: {
	// 		servers: [
	// 			'216.239.32.10',
	// 			'216.239.34.10',
	// 			'216.239.36.10',
	// 			'216.239.38.10',
	// 		],
	// 		name: 'o-o.myaddr.l.google.com',
	// 		type: 'TXT',
	// 		transform: ip => ip.replace(/"/g, ''),
	// 	},
	// 	v6: {
	// 		servers: [
	// 			'2001:4860:4802:32::a',
	// 			'2001:4860:4802:34::a',
	// 			'2001:4860:4802:36::a',
	// 			'2001:4860:4802:38::a',
	// 		],
	// 		name: 'o-o.myaddr.l.google.com',
	// 		type: 'TXT',
	// 		transform: ip => ip.replace(/"/g, ''),
	// 	},
	// },
];

const type = {
	v4: {
		dnsServers: dnsServers.map(({v4: {servers, ...question}}) => ({
			servers, question,
		})),
		httpsUrls: [
			'https://icanhazip.com/',
			'https://api.ipify.org/',
		],
	},
	v6: {
		dnsServers: dnsServers.map(({v6: {servers, ...question}}) => ({
			servers, question,
		})),
		httpsUrls: [
			'https://icanhazip.com/',
			'https://api6.ipify.org/',
		],
	},
};

const queryDns = (version, options) => {
	const data = type[version];
  console.log('ssss11111:');
	const socket = dns({
		retries: 0,
		maxQueries: 1,
		socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4'),
		timeout: options.timeout,
	});

	const socketQuery = promisify(socket.query.bind(socket));
  console.log('22222:');
	const promise = (async () => {
		let lastError;

		for (const dnsServerInfo of data.dnsServers) {
			const {servers, question} = dnsServerInfo;
      console.log('3333:', dnsServerInfo);
			for (const server of servers) {
				if (socket.destroyed) {
          console.log('4444:');
					return;
				}
        console.log('5555:');
				// try {
					const {name, type, transform} = question;

					// eslint-disable-next-line no-await-in-loop
					const dnsResponse = await socketQuery({questions: [{name, type}]}, 53, server);

					const {
						answers: {
							0: {
								data,
							},
						},
					} = dnsResponse;
          console.log('6666:', dnsResponse);
					const response = (typeof data === 'string' ? data : data.toString()).trim();
          const ip = transform ? transform(response) : response;

					//const ip = version === 'v6' ? transform(response) : response;
					const method = version === 'v6' ? isIPv6 : isIPv4;

					if (ip && method(ip)) {
						socket.destroy();
						return ip;
					}
				// } catch (error) {
				// 	lastError = error;
				// }
			}
		}

		socket.destroy();

		throw new IpNotFoundError({cause: lastError});
	})();

	promise.cancel = () => {
		socket.destroy();
	};

	return promise;
};

const queryHttps = (version, options) => {
	let cancel;
  const hc = new HttpClient();

	const promise = (async () => {
		try {
			const requestOptions = {
        method: 'GET',
				timeout: options.timeout,
        dataType: 'text',
			};

			const urls = [
				...type[version].httpsUrls,
				...(options.fallbackUrls ?? []),
			];

			let lastError;
			for (const url of urls) {
				try {
          const gotPromise = hc.request(url, requestOptions);
          gotPromise.cancel = () => {
            // todo
          }
          cancel = gotPromise.cancel;

					const response = await gotPromise;
          let result = response.status == 200 ? response.data : '';
					const ip = result.trim();

					const method = version === 'v6' ? isIPv6 : isIPv4;

					if (ip && method(ip)) {
						return ip;
					}
				} catch (error) {
					lastError = error;
				}
			}

			throw new IpNotFoundError({cause: lastError});
		} catch (error) {
      throw error;
		}
	})();

	promise.cancel = function () {
		return cancel.apply(this);
	};

	return promise;
};

const queryAll = (version, options) => {
	let cancel;
	const promise = (async () => {
		let response;
		const dnsPromise = queryDns(version, options);
		cancel = dnsPromise.cancel;
		try {
			response = await dnsPromise;
		} catch {
			const httpsPromise = queryHttps(version, options);
			cancel = httpsPromise.cancel;
			response = await httpsPromise;
		}

		return response;
	})();

	promise.cancel = cancel;

	return promise;
};

/**
 * 查询 public ipv4
 */  
function publicIpv4(options) {
  options = {
    ...defaults,
    ...options,
  };

  if (!options.onlyHttps) {
    return queryAll('v4', options);
  }

  if (options.onlyHttps) {
    return queryHttps('v4', options);
  }

  return queryDns('v4', options);
}

/**
 * 查询public ipv6
 */  
function publicIpv6(options) {
  options = {
    ...defaults,
    ...options,
  };

  // if (!options.onlyHttps) {
  //   return queryAll('v6', options);
  // }

  // if (options.onlyHttps) {
  //   return queryHttps('v6', options);
  // }

  return queryDns('v6', options);
}

const publicIp = createPublicIp(publicIpv4, publicIpv6);
function createPublicIp(publicIpv4, publicIpv6) {
	return function publicIp(options) { // eslint-disable-line func-names
		const ipv4Promise = publicIpv4(options);
		const ipv6Promise = publicIpv6(options);

		const promise = (async () => {
      const ipv6 = await ipv6Promise;
      ipv4Promise.cancel();
      return ipv6;
			try {
				const ipv6 = await ipv6Promise;
				ipv4Promise.cancel();
				return ipv6;
			} catch (ipv6Error) {
				if (!(ipv6Error instanceof IpNotFoundError)) {
					throw ipv6Error;
				}

				try {
					return await ipv4Promise;
				} catch (ipv4Error) {
					throw ipv4Error;
				}
			}
		})();

		promise.cancel = () => {
			ipv4Promise.cancel();
			ipv6Promise.cancel();
		};

		return promise;
	};
}

const IP = {
  publicIp,
  publicIpv4,
  publicIpv6
}

module.exports = IP;

