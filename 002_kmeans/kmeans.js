'use strict'
//Again, I'll start this off with the very beginning of the constructor function.
function KMeans(options){
	if (options == undefined){options = {};}
	this.minClusterMove = options.minClusterMove || 0.0001;
	this.clusterAttempts = 2;
	this.points = [];
}

KMeans.prototype.train = function (points) {
	this.points = this.points.concat(points);
};

KMeans.prototype._distance = function(vectorA, vectorB) {

	return Math.sqrt(vectorA.reduce(function(prev, curr, idx) {
		return prev + Math.pow(curr - vectorB[idx], 2);
	}, 0))
};

KMeans.prototype._max = function(vector, fn) {
	var max = fn(vector[0], 0),
		maxVal = vector[0],
		test;
	for (let i = 1; i < vector.length; i++) {
		test = fn(vector[i], i);
		if (test > max) {
			max = test;
			maxVal = vector[i];
		}
	}
	return maxVal;
};

KMeans.prototype._clusterEvaluator = function (centroids, vectors) {
	var self = this,
		dists = [],
		sumSqDists = 0;
	vectors.forEach(function(el) {
		for (let i = 0; i < centroids.length; i++) {
			dists.push(Math.pow(self._distance(el, centroids[i]),2))
		}
		sumSqDists += Math.min.apply(null, dists);
		dists = [];
	});
	return sumSqDists;
};

KMeans.prototype._averageLocation = function (vectors) {
	var divisor = vectors.length,
		centroid = [];
	vectors.forEach(function (vector) {
		for (let i = 0; i < vector.length; i++) {
			if (centroid[i]) centroid[i] += vector[i]/divisor;
			else centroid[i] = vector[i]/divisor;
		}
	});
	return centroid;
};

KMeans.prototype._shiftCentroids = function (centroids, tD) {
	var self = this, clusters = [], closestIdx, dists = [];
	tD.forEach(function (vector) {
		for (let i = 0; i < centroids.length; i++) {
			dists.push(Math.pow(self._distance(vector, centroids[i]),2))
		}
		closestIdx = dists.indexOf(Math.min.apply(null, dists));
		(clusters[closestIdx]) ? clusters[closestIdx].push(vector) :clusters[closestIdx] = [vector];
		dists = [];
	});
	return clusters.map(function(cluster){ return self._averageLocation(cluster)})
};

KMeans.prototype._haveShifted = function (before, after) {
	var self = this;
	return before.some(function(el, idx) {
		return self._distance(el, after[idx]) > 0;
	})
};

KMeans.prototype._clusters = function (k, tD) {
	var self = this,
		centroids = forgyMethod(k, tD.length).map(function(el){return tD[el];}),
		newCentroids;
	function minDistance (centroids, tD) {
		newCentroids = self._shiftCentroids(centroids, tD);
		if (self._haveShifted(centroids, newCentroids)) return minDistance(newCentroids, tD);
		else return newCentroids;
	}
	return minDistance(centroids, tD);
};

KMeans.prototype._manyClusters = function (rounds, k) {
	var centroids = [];
	for (let i = 0; i < rounds; i++) {
		centroids.push(this._clusters(k, this.points));
	}
	return centroids;
};

KMeans.prototype.clusters = function(clusterNum){
	var self = this;
	return self._max( self._manyClusters( self.clusterAttempts, clusterNum ) , function(cluster){
		return -self._clusterEvaluator(cluster, self.points);
	});
};

KMeans.prototype.findClusters = function(maxClusters) {
	var self = this;
	var results = [];
	var ans;
	for (let i = 1; i <= maxClusters; i++) {
		var bestCentroids = self.clusters(i);
		var score = self._clusterEvaluator(bestCentroids, self.points);
		results.push([score,bestCentroids]);
	}
	for (let i = 1; i < results.length; i++) {
		var change = (results[i][0] - results[i-1][0]) / results[i-1][0];
		results[i].push(-change);
	}
	var max = -1000000;
	results.forEach(function(el) {
		console.log(el[2]);
		if (el[2] > max) {
			ans = el[1];
			max = el[2];
		}
	});
	return ans;
};

function forgyMethod (k, vectorCount) {
	var indexes = [],
		idx;
	while(indexes.length < k) {
		idx = Math.round(Math.random() * (vectorCount-1));
		if (indexes.indexOf(idx) === -1) indexes.push(idx);
	}
	return indexes;
}

module.exports = KMeans