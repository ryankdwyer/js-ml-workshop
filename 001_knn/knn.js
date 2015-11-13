
//Start off with what passes the first test.
function KNN(kSize){
	this.kSize = kSize;
	this.points = [];
}

KNN.prototype.train = function (arr) {
	this.points = this.points.concat(arr);
};

KNN.prototype.predictSingle = function (vector) {
	var distances = this._distances(vector, this.points);
	var sorted = this._sorted(distances);
	return this._majority(this.kSize, sorted);
};

KNN.prototype.predict = function (arrVectors) {
	var results = [];
	var self = this;
	arrVectors.forEach(function (el) {
		results.push(self.predictSingle(el, self.points));
	});
	return results;
};

KNN.prototype._distance = function (vectorA, vectorB) {
	return euclideanNorm(vectorSub(vectorA, vectorB));
};

KNN.prototype._distances = function (vector, trainData) {
	var result = [],
		distance,
		self = this;
	trainData.forEach(function(el) {
		distance = self._distance(vector, el[0]);
		result.push([distance, el[1]]);
	});
	return result;
};

KNN.prototype._sorted = function (vector) {
	vector.sort(function(a, b) {
		if (a[0] < b[0]) return -1;
		if (a[0] > b[0]) return 1;
		return 0;
	});
	return vector.map(function(el) {
		return el[1];
	});
};

KNN.prototype._majority = function (k, sortedDist) {
	var kNearest = sortedDist.slice(0,k);
	return getMostCommon(kNearest);
};

KNN.prototype.score = function (testData) {
	var expectedResults = testData.map(function (el) {
		return el[1];
	});
	var testPoints = testData.map(function (el) {
		return el[0];
	});
	var testResults = this.predict(testPoints);
	return getPercentCorrect(expectedResults, testResults);
};

KNN.prototype._normalize = function () {
	var normalizedPoints = [],
		dimensions = getVectorLength(),
		min,
		max,
		normalPt;
	for (var i = 0; i < this.points.length; i++) {
		normalizedPoints.push([[],this.points[i][1]]);
	}
	for (var i = 0; i < dimensions; i++) {
		min = getMin(this.points, i);
		max = getMax(this.points, i);
		this.points.forEach(function(el, idx) {
			normalPt = calcNormalized(el[0][i], min, max);
			normalizedPoints[idx][0].push(normalPt);
		})
	}
	return normalizedPoints;
};

function vectorSub (vectorA, vectorB) {
	var result = [];
	vectorA.forEach(function (el, idx) {
		result.push(vectorA[idx] - vectorB[idx]);
	});
	return result;
}

function euclideanNorm (vector) {
	return Math.sqrt(vector.reduce(function(prev, el) {
		return prev + (el * el);
	}, 0));
}

function getMostCommon (vector) {
	var store = {},
		max = 1,
		maxEl = vector[0];
	vector.forEach(function (el) {
		if (store[el.toString()]) {
			store[el.toString()]++
			if (store[el.toString()] > max) {
				max = store[el.toString()];
				maxEl = el;
			}
		} else {
			store[el.toString()] = 1;
		}
	});
	return maxEl;
}

function getPercentCorrect (expected, actual) {
	var count = 0;
	expected.forEach(function (el, idx) {
		if (expected[idx] === actual[idx]) {
			count++;
		}
	});
	return count / expected.length;
}

function getMin (vector, idx) {
	return Math.min.apply(null, vector.map(function(el) {return el[0][idx]}));
}

function getMax (vector, idx) {
	return Math.max.apply(null, vector.map(function(el) {return el[0][idx]}));
}

function getVectorLength () {
	return this.points[0][0].length;
}

function calcNormalized (x, min, max) {
	return (x - min) / (max - min);
}

module.exports = KNN;