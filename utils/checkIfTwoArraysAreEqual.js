
const checkIfTwoArraysAreEqual = (array1,array2)=>{
    let sortedArray1 = array1.sort();
    let sortedArray2 = array2.sort();
     return sortedArray1.length === array2.length && array1.every((value,index)=>{
          value === sortedArray2[index]
     })
  }


  module.exports = checkIfTwoArraysAreEqual


