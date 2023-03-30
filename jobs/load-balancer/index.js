

class LoadBalancer {
  /**
    * @param  {Object} options
    * @param  {Array } options.targets [ targets for load balancing calculation: [{id: 1, weight: 1}, {id: 2, weight: 2}] ]
    * @param  {String} options.algorithm [ strategies for load balancing calculation : RANDOM | POLLING | WEIGHTS | SPECIFY | WEIGHTS_RANDOM | WEIGHTS_POLLING | MINIMUM_CONNECTION | WEIGHTS_MINIMUM_CONNECTION]
    */
  constructor(options) {
    let opt = Object.assign({
      targets: [], 
      algorithm: 'polling' 
    }, options);
  }
}

module.exports = LoadBalancer;