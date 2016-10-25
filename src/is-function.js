module.exports = function(functionToCheck) {
	const getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};