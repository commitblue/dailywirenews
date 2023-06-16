import fetch from "node-fetch"
import { config } from "dotenv"
import fs from "fs"
//wsp
config()
const newsPath = "alreadyUsedNews.json"
const alreadyPostedNews = JSON.parse(fs.readFileSync(newsPath))
const webhooks = JSON.parse(process.env.webhook)
const element = /\/news\/[^"]+/g
async function fetchNews(){
    const request = await fetch("https://www.dailywire.com/")
    const text = await request.text()
    const fetchedUrl = text.match(element)[0]
    return `https://www.dailywire.com${fetchedUrl}`
}
console.log("READY")
async function loop(){
    const fetchedNews = await fetchNews()
    if (!alreadyPostedNews.find(value => value === fetchedNews)){
        console.log(`new woated news: ${fetchedNews}`)
        alreadyPostedNews.push(fetchedNews)
        for (const webhook of webhooks){
            await fetch(webhook, { 
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    content: fetchedNews
                })
            })
        }
        fs.writeFileSync(newsPath, JSON.stringify(alreadyPostedNews))
    }
    if (alreadyPostedNews.length >= 99){
        alreadyPostedNews.splice(98)
    }
}
setInterval(loop, 5000)