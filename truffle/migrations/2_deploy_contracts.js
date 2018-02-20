var UserCertificates = artifacts.require("./UserCertificates.sol");

module.exports = function(deployer) {
  deployer.deploy(UserCertificates);
};
