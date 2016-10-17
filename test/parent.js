// Found here https://gist.github.com/xavierlepretre/afab5a6ca65e0c52eaf902b50b807401
var getEventsPromise = function (myFilter, count) {
  return new Promise(function (resolve, reject) {
    count = count ? count : 1;
    var results = [];
    myFilter.watch(function (error, result) {
      if (error) {
        reject(error);
      } else {
        count--;
        results.push(result);
      }
      if (count <= 0) {
        resolve(results);
        myFilter.stopWatching();
      }
    });
  });
};

// Found here https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6
web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
  var transactionReceiptAsync;
  interval = interval ? interval : 500;
  transactionReceiptAsync = function(txnHash, resolve, reject) {
    try {
      var receipt = web3.eth.getTransactionReceipt(txnHash);
      if (receipt == null) {
        setTimeout(function () {
          transactionReceiptAsync(txnHash, resolve, reject);
        }, interval);
      } else {
        resolve(receipt);
      }
    } catch(e) {
      reject(e);
    }
  };

  return new Promise(function (resolve, reject) {
      transactionReceiptAsync(txnHash, resolve, reject);
  });
};

contract('Parent', function(accounts) {
  it("should create a child", function() {
    var parent = Parent.deployed();
    var blockNumber = web3.eth.blockNumber + 1;;
    var childAddress;

    return parent.createChild()
    .then(function() {
      // Returns the Event triggered
      return getEventsPromise(parent.ChildBorn({}, { fromBlock: blockNumber, toBlock: "latest" }));
    })
    .then(function(event){
      var eventArgs = event[0].args;
      assert.equal(eventArgs._parent_address, parent.address, "Should be the parent");
      // Returns the Child instance and evaluates if it belongs to the Parent.
      return Child.at(eventArgs._child_address).isChild.call();
    })
    .then(function(isChild) {
      assert.isTrue(isChild, "should be recognised by parent");
      // Count the children
      return parent.childrenCount.call();
    })
    .then(function(count) {
      assert.equal(count.valueOf(), 1, "Have 1 Child");
      // Create a second Child
      return parent.createChild();
    })
    .then(function() {
      return getEventsPromise(parent.ChildBorn({ fromBlock: blockNumber, toBlock: "latest" }));
    })
    .then(function(event){
      var eventArgs = event[0].args;
      assert.equal(eventArgs._parent_address, parent.address, "Should be the parent");
      // Returns the Child instance and evaluates if it belongs to the Parent.
      return Child.at(eventArgs._child_address).isChild.call();
    })
    .then(function(isChild) {
      assert.isTrue(isChild, "should be recognised by parent");
      // Count the children
      return parent.childrenCount.call();
    })
    .then(function(count) {
      assert.equal(count.valueOf(), 2, "Have 2 Children");
    });
  });
});
