//ABI from Smart Contract, REMEMBER upload this array if you makes changes on the Smart Contract.
var abiArray = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getNumberCertificatesUser",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "ipfsHash",
                "type": "string"
            }
        ],
        "name": "certificateExists",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "price",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "user",
                "type": "address"
            },
            {
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getUserCertificateAtIndex",
        "outputs": [
            {
                "name": "",
                "type": "address"
            },
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_ipfsHash",
                "type": "string"
            }
        ],
        "name": "CertificateIssued",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawFunds",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_ipfsHash",
                "type": "string"
            }
        ],
        "name": "CertificateRevoked",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "user",
                "type": "address"
            },
            {
                "name": "ipfsHash",
                "type": "string"
            }
        ],
        "name": "addCertificate",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "user",
                "type": "address"
            },
            {
                "name": "ipfsHash",
                "type": "string"
            }
        ],
        "name": "revokeCertificate",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_price",
                "type": "uint256"
            }
        ],
        "name": "setPrice",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
//Contract deployed address
var contractAddress = '0x4919b414296cEC576a6dDCfC3328b9C30F06DCBa'
var CertificationContract;
var certification;

$(document).ready(function () {

    //Control error if there is no MetamMask extension
    if (typeof web3 === "undefined" || !web3.currentProvider.isMetaMask) {
        $('#login-disabled-text').append('No se ha detectado la extensión MetaMask activa. Por favor instala la extensión <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn">aquí</a> y refresca la página.')
        $('#login-disabled-text').show();
        $('#login-button').attr('disabled', 'disabled');
    }

    //Control if there is no account logger on MetaMask extension
    if (web3.eth.coinbase == null) {
        $('#login-disabled-text').append('No se ha detectado una cuenta registrada en la extensión MetaMask. Por favor entra o crea una cuenta en MetaMask sobre la red en la que desees realizar las operaciones y refresca la página.')
        $('#login-disabled-text').show();
        $('#login-button').attr('disabled', 'disabled');
    }

    //Fake login form
    $('#form-login').on('submit', function (e) {
        e.preventDefault();
        $("#login-panel").hide();
        $("#main-panel").show();
    });

    //Control submit for serialice and call method for send to NodeJS the JSON file
    $('#form-certification').on('submit', function (e) {
        e.preventDefault()

        var unindexed_array = $(this).serializeArray();
        var indexed_array = {};

        $.map(unindexed_array, function (n, i) {
            indexed_array[n['name']] = n['value'];
        });
        makeCertification(indexed_array);
    });

    //Generating instances from our Smart Contract for listen events and call methods.
    CertificationContract = web3.eth.contract(abiArray);
    certification = CertificationContract.at(contractAddress);

    //Get instance of event will be triggered at the end of the payable function.
    var certificationIssuedEvent = certification.CertificateIssued();
    //Listen on CertificateIssued event and get his params with result.
    certificationIssuedEvent.watch(function (error, result) {
        //A little kind of control errors.
        $("#loading-section").hide();
        if (!error) {
            $("#certificate-link-container").show();
            $("#certificate-link").attr("href", "/certificated/" + ipfsHash + "/" + result.transactionHash)
        } else {
            $("#certificate-error-container").show();
            $("#error-text-feedback").html(error);
        }
    });
})

var txId = "";
var ipfsHash = "";

function makeCertification(formDataJson) {
    //Callback for call Ethereum using Web3 after upload JSON on NodeJS
    var callback = function (response) {
        ipfsHash = response[0].hash;
        makeTransaction(response[0].hash)
    }

    sendFileToIPFS(formDataJson, callback);
}

//Method send files to IPFS
function sendFileToIPFS(data, callback) {
    $.post({
        url: '/uploadJson',
        data: { json: JSON.stringify(data) },
        success: function (response) {
            //This callback call to makeTransacion sending as parameter file hash
            callback(response);
        }
    });
}

//Method for call Smart Contract's Method addCertificate for execute payable function.
function makeTransaction(fileHash) {
    let userToCertificate = $("#alumnAddress").val();
    $('#submit-form').show();
    $("#certificate-error-container").hide();
    $("#loading-section").hide();

    certification.addCertificate(userToCertificate, fileHash,
        function (error, hash) {
            //Simple kind of control errors
            if (error) { 
                console.log(error); 
                alert("No se ha podido realizar la transacción contra la blockchain"); 
                $("#certificate-error-container").show();
                $("#error-text-feedback").html(error); 
            } else {
                $("#transacion-id-link").attr("href", "https://ropsten.etherscan.io/tx/" + hash)
                $("#loading-section").show();
                $('#submit-form').hide();
            }
        });
}