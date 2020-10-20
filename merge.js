const { merge } = require('sol-merger');
 
async () => {
// Get the merged code as a string
const mergedCode = await merge("./contracts/SenseMinter.sol");
// Print it out or write it to a file etc.
console.log(mergedCode);
}