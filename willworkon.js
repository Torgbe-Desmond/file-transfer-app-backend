


 function receiveSchema(data){

 }


 
async function directorySchema(){
    return new Promise((resolve,reject)=>{
        const data = task.map(item=>{
            return item
        })

        if(data) resolve(data)
            else reject()
    })
}


const { Low, JSONFile } = require('lowdb');
const { join } = require('path');

// Define the schema
const groupSchema = {
    name: { type: String },
    foldersLinkedToGroup: [],
    filesInGroup: [],
};

// Create a new instance of the database
const file = join(__dirname, `${group}.json`);

