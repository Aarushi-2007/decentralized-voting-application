const crypto= require("crypto");

const generateInviteCode= (length= 8)=> {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let code= "";
    
    for(let i=0;i<length;i++){
        const randomIndex= crypto.randomInt(0, chars.length);
        code+=chars[randomIndex];
    }

    return code;
}

module.exports= generateInviteCode;