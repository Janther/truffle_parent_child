pragma solidity ^0.4.1;

import "ParentI.sol";

contract Child {
  ParentI parent;

  function Child(address _parent) {
    parent = ParentI(_parent);
  }

  function isChild() returns(bool parenthood) {
    return parent.isParentOf(address(this));
  }
}
