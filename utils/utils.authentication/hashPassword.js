const bcryptjs = require('bcryptjs')

module.exports.hashedPassword =async(password)=>{
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    return hashedPassword;
}