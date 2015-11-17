'use strict';
//Again, I'll start this off with the very beginning of the constructor function.
function KMeans(options) {
	if (options == undefined) {
		options = {};
	}
	this.minClusterMove = options.minClusterMove || 0.0001;
	this.clusterAttempts = 10;
	this.points = [];
}

KMeans.prototype.train = function (points) {
	this.points = this.points.concat(points);
};

KMeans.prototype.clusters = function () {};

KMeans.prototype._distance = function (vectorA, vectorB) {
	return Math.sqrt(vectorA.reduce(function (prev, curr, idx, arr) {
		return prev + Math.pow(curr - vectorB[idx], 2);
	}, 0));
};

KMeans.prototype._max = function (vector, fn) {
	var max = fn(vector[0], 0),
	    maxVal = vector[0],
	    test;
	for (var i = 1; i < vector.length; i++) {
		test = fn(vector[i], i);
		if (test > max) {
			max = test;
			maxVal = vector[i];
		}
	}
	return maxVal;
};

KMeans.prototype._clusterEvaluator = function (clusters, vectors) {
	var self = this,
	    dists = [],
	    sumSqDists = 0;
	vectors.forEach(function (el, idx, arr) {
		for (var i = 0; i < clusters.length; i++) {
			dists.push(Math.pow(self._distance(el, clusters[i]), 2));
		}
		sumSqDists += Math.min.apply(null, dists);
		dists = [];
	});
	return sumSqDists;
};

module.exports = KMeans;

//# sourceMappingURL=kmeans-compiled.js.map