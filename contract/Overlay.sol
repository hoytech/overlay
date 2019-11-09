pragma solidity ^0.5.0;

contract Overlay {
    event LogRegister(address indexed sender, bytes32 content);

    mapping(address => bytes32) private registry;

    function register(bytes32 content) external {
        registry[msg.sender] = content;
        emit LogRegister(msg.sender, content);
    }

    function lookup(address[] calldata addrs) external view returns (bytes32[] memory) {
        bytes32[] memory output = new bytes32[](addrs.length);

        for (uint i = 0; i < addrs.length; i++) {
            output[i] = registry[addrs[i]];
        }

        return output;
    }
}
