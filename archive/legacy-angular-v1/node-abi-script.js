const nodeAbi = require('node-abi');

/**
 * 
 * get electron node version first with process.version then use below command to get node abi version
 * 
 * nodeAbi.getAbi('electron-node-version', 'node')
 * 
 */

console.log(nodeAbi.getAbi('14.16.0', 'node'));