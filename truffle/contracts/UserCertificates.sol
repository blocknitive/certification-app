pragma solidity ^0.4.16;

// This is the main contract of our dApp
// It stores the association between users (Ethereum addresses) with their certificates (IPFS hashes)

contract UserCertificates {

	//A certificate is represented by issuer and hash in IPFS
	struct Certificate {
		address issuer;
		string ipfsHash;
	}

	address private owner;
	uint public price;
	mapping (address => Certificate[]) private userCertificates;
	mapping (string => bool) private certificates;

	modifier onlyOwner {
		require(msg.sender == owner);
		_;
	}

	modifier costs(uint _price) {
		if (msg.value >= _price) {
			_;
		}
	}

	//Equal function for 2 strings. Research: this could be more efficient by comparing their hashes
	function stringsEqual(string storage _a, string memory _b) internal returns (bool) {
		bytes storage a = bytes(_a);
		bytes memory b = bytes(_b);
		
		if (a.length != b.length) {
			return false;
		}
		
		// @todo unroll this loop
		for (uint i = 0; i < a.length; i ++) {
			if (a[i] != b[i]) {
				return false;
			}
		}
		return true;
	}

	event CertificateIssued(address indexed _from, address indexed _to, string _ipfsHash);
	event CertificateRevoked(address indexed _from, address indexed _to, string _ipfsHash);

	function UserCertificates() public {
		owner = msg.sender;
		price = 0;//10000000000000000;//wei
	}

	//Set the minimum value to be transfer to create a certificate
	function setPrice(uint _price) onlyOwner public {
		price = _price;
	}


	//withdraw funds from contract to owner address
	function withdrawFunds(uint amount) onlyOwner public returns(bool) {
		require(amount <= this.balance);
		owner.transfer(amount);
		return true;
	}

	//Checks if certificate with same ipfs hash has been already published
	function certificateExists(string ipfsHash) public constant returns (bool) {
		if (certificates[ipfsHash]==true) {
			return true;
		} else {
			return false;
		}
	}

	//Adds a certificate (sender + hash) to a user
	function addCertificate(address user, string ipfsHash) public payable costs(price) {

		//check the sender and receiver are different
		require (msg.sender != user);

		//check certificate doesn't exist
		require(!certificateExists(ipfsHash));

		//add certificate
		userCertificates[user].push(Certificate(msg.sender, ipfsHash));
		certificates[ipfsHash] = true;

		//trigger event
		CertificateIssued(msg.sender, user, ipfsHash);
	}

	//Revokes previously added certificate
	function revokeCertificate(address user, string ipfsHash) public {

		//check certificate exist
		require(certificateExists(ipfsHash));

		Certificate[] storage certs = userCertificates[user];

		bool found = false;
		uint i = 0;

		while (!found && i<certs.length) {
			found = (stringsEqual(certs[i].ipfsHash, ipfsHash));
			i++;
		}		

		require(found);//exists
		require(certs[i-1].issuer == msg.sender || msg.sender == owner);//being revoked for same issuer or owner

		delete certs[i-1];
		if (certs.length > 1) {
			certs[i-1] = certs[certs.length-1];//fill the gap
		}

		certs.length--;
		certificates[ipfsHash] = false;

		CertificateRevoked(msg.sender, user, ipfsHash);
	}

	//Return the number of certificates associated to user
	function getNumberCertificatesUser(address user) public constant returns (uint) {
		return userCertificates[user].length;
	}

	//Returns certificate for user in specific index position. This is neccesary because currently it is not possible to return array of strings
	function getUserCertificateAtIndex(address user, uint256 index) public constant returns (address, string) {
		require(userCertificates[user].length>index);

		Certificate storage cert = userCertificates[user][index];
		return (cert.issuer, cert.ipfsHash);
	}
}