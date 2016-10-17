pragma solidity ^0.4.1;

import "ParentI.sol";
import "Child.sol";

contract Parent is ParentI {
  mapping (address => bool) children_existance;
  address[] public children_addresses;

  function childrenCount() returns(uint children_count) {
    return children_addresses.length;
  }

  event ChildBorn(address indexed _parent_address, address indexed _child_address);

  function Parent() {
  }

  function createChild() returns(address child_address) {
    Child child = new Child(address(this));
    child_address = address(child);
    children_existance[child_address] = true;
    children_addresses.push(child_address);
    ChildBorn(address(this), child_address);
  }

  function isParentOf(address _child_address) returns(bool parenthood) {
    return children_existance[_child_address];
  }
}
