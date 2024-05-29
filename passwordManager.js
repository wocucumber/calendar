const randoms = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

function generateKey(length=10){
    let result = "";
    for(let i = 0; i < length; i++){
        result += randoms[Math.floor(Math.random() * randoms.length)];
    }

    return result;
}
function auth(cookies, staticServerKey="012345678A"){
    if(!cookies.t || !cookies.u || !cookies.s || !cookies.j) return false;
    let {t, u, s, j} = cookies;

    if(hash(staticServerKey, 256, t) !=  u) return false;
    if(hash(staticServerKey + j, 256, t) !=  s) return false;

    return true;
}
function getUserKeys(staticServerKey=generateKey(), user="しけくん"){
    const key = generateKey(256);
    return {
        t: key,
        u: hash(staticServerKey, 256, key),
        s: hash(staticServerKey + user, 256, key),
        j: user
    }
}
function hash(value, length=128, salt="012345678A"){
    // salt to integer


    salt = salt.toString();
    value = value.toString();
    let intSalt = salt.length ^ 23489 * 4839 * value.length;
    for(let i = 0; i < salt.length; i++){
        intSalt = salt[i].charCodeAt(0) ^ intSalt * 85736 ^ 5792 * 4839 * value.length ^ salt.length * 4839 * value.length ^ intSalt;
    }

    const indexToSalt2 = (index=0)=>{
        // index to salt2 (integer)
        let salt2 = 0;
        for(let i = 0; i < salt.length; i++){
            salt2 = salt[i].charCodeAt(0) ^ index ^ salt2 * 85736 ^ 5792 * 4839 * value.length ^ salt.length * 4839 * value.length ^ salt2;
        }
        return salt2;
    }
    
    let res = "";


    for(let i = 0; i < length; i++){
        // index to salt2
        let s1 = indexToSalt2(intSalt);
        let s2 = indexToSalt2(i)
        let s3 = intSalt;

        // value to integer (use s1, s2, s3)
        let intValue = 0;
        for(let j = 0; j < value.length; j++){
            intValue = value[j].charCodeAt(0) * intValue ^ s1 ^ s2 ^ s3;
        }




        // intValue to one English( a-z, A-Z, 0-9 )

        res += randoms[Math.abs(intValue) % randoms.length];

    }

    return res;
}


const res = {
    generateKey,
    auth,
    getUserKeys,
    hash
}

module.exports = res;