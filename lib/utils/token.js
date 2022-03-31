var accessTokenInterface = function() {
    if (this.constructor === accessTokenInterface) {
      throw new Error("Can't instantiate abstract class!");
    }
};

//Comment : Abstract method
accessTokenInterface.prototype.getAccessToken = function() {
    throw new Error("Abstract method!");
}

module.exports = accessTokenInterface;


